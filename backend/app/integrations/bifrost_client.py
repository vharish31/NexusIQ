import base64
import logging
import time
from typing import Any, Dict, List, Optional
import httpx
from app.config import get_settings

logger = logging.getLogger("nexusiq.integrations.bifrost")


class BifrostError(Exception):
    """Base exception for Bifrost AI Gateway operations."""
    pass


class BifrostConnectionError(BifrostError):
    """Raised when Bifrost AI Gateway is unreachable or not running."""
    pass


class BifrostAPIError(BifrostError):
    """Raised when Bifrost AI Gateway returns an error status code."""

    def __init__(self, status_code: int, message: str, payload: Optional[Any] = None):
        super().__init__(f"Bifrost API Error {status_code}: {message}")
        self.status_code = status_code
        self.message = message
        self.payload = payload


_BIFROST_HEALTH_CACHE: Dict[str, Any] = {}
_BIFROST_HEALTH_TTL = 15.0


class BifrostClient:
    """
    Independent client for Bifrost AI Gateway.
    Handles communication with Bifrost gateway for multi-model routing and inference.
    Supports both Basic Auth (username:password) and API keys/tokens.
    """

    def __init__(
        self,
        base_url: Optional[str] = None,
        api_key: Optional[str] = None,
        username: Optional[str] = None,
        password: Optional[str] = None,
        setup_token: Optional[str] = None,
        default_model: Optional[str] = None,
        timeout_seconds: Optional[float] = None,
    ):
        settings = get_settings()
        self.base_url = (base_url or settings.bifrost_base_url).rstrip("/")
        self.api_key = api_key or settings.bifrost_api_key
        self.username = username or settings.bifrost_username
        self.password = password or settings.bifrost_password
        self.setup_token = setup_token or settings.bifrost_setup_token
        self.default_model = default_model or settings.bifrost_default_model
        self.timeout_seconds = timeout_seconds or settings.bifrost_timeout_seconds

    def _get_headers(self) -> Dict[str, str]:
        headers = {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "User-Agent": f"NexusIQ-Backend/{get_settings().app_version}",
        }

        # Virtual Key for routing in Bifrost
        if self.api_key:
            key_str = self.api_key.strip()
            headers["x-bf-vk"] = key_str
            headers["X-Api-Key"] = key_str
            if key_str.startswith("Bearer ") or key_str.startswith("Basic "):
                headers["Authorization"] = key_str
            else:
                headers["Authorization"] = f"Bearer {key_str}"

        # Basic Auth credentials if provided
        if self.username and self.password:
            raw_cred = f"{self.username}:{self.password}"
            encoded = base64.b64encode(raw_cred.encode("utf-8")).decode("utf-8")
            if "Authorization" not in headers:
                headers["Authorization"] = f"Basic {encoded}"

        if self.setup_token:
            headers["X-Bifrost-Setup-Token"] = self.setup_token

        return headers

    async def check_health(self, force_refresh: bool = False) -> Dict[str, Any]:
        """
        Pings Bifrost Gateway to verify availability and measure latency.
        Caches result briefly so offline localhost probes do not stall UI requests.
        """
        now = time.time()
        cached = _BIFROST_HEALTH_CACHE.get(self.base_url)
        if not force_refresh and cached is not None:
            cached_at, cached_report = cached
            if (now - cached_at) < _BIFROST_HEALTH_TTL:
                return dict(cached_report)

        health_url = f"{self.base_url}/health"
        start_time = time.perf_counter()

        try:
            timeout = 0.5 if ("localhost" in self.base_url or "127.0.0.1" in self.base_url) else 1.5
            async with httpx.AsyncClient(timeout=timeout) as client:
                response = await client.get(health_url, headers=self._get_headers())
                latency_ms = round((time.perf_counter() - start_time) * 1000, 2)

                if response.status_code in (200, 204):
                    report = {
                        "service": "bifrost_ai_gateway",
                        "status": "online",
                        "available": True,
                        "base_url": self.base_url,
                        "latency_ms": latency_ms,
                        "details": "Gateway is reachable and healthy.",
                    }
                else:
                    report = {
                        "service": "bifrost_ai_gateway",
                        "status": "degraded",
                        "available": False,
                        "base_url": self.base_url,
                        "latency_ms": latency_ms,
                        "details": f"Gateway returned status {response.status_code}: {response.text[:200]}",
                    }
        except httpx.ConnectError:
            report = {
                "service": "bifrost_ai_gateway",
                "status": "offline",
                "available": False,
                "base_url": self.base_url,
                "latency_ms": None,
                "details": f"Could not connect to Bifrost Gateway at {self.base_url}. Ensure the service is running.",
            }
        except httpx.TimeoutException:
            report = {
                "service": "bifrost_ai_gateway",
                "status": "timeout",
                "available": False,
                "base_url": self.base_url,
                "latency_ms": None,
                "details": f"Connection timed out when reaching Bifrost Gateway at {self.base_url}.",
            }
        except Exception as exc:
            report = {
                "service": "bifrost_ai_gateway",
                "status": "error",
                "available": False,
                "base_url": self.base_url,
                "latency_ms": None,
                "details": f"Unexpected error while checking Bifrost Gateway: {str(exc)}",
            }

        _BIFROST_HEALTH_CACHE[self.base_url] = (now, report)
        return report

    async def chat_completion(
        self,
        messages: List[Dict[str, str]],
        model: str = "default",
        temperature: float = 0.7,
        max_tokens: Optional[int] = None,
        **kwargs: Any,
    ) -> Dict[str, Any]:
        """
        Dispatches a chat completion request through Bifrost Gateway.
        Raises BifrostConnectionError if gateway cannot be reached.
        Raises BifrostAPIError if an error status is returned.
        """
        endpoint = f"{self.base_url}/v1/chat/completions"
        effective_model = (
            self.default_model
            if (not model or model == "default")
            else model
        )
        payload: Dict[str, Any] = {
            "model": effective_model,
            "messages": messages,
            "temperature": temperature,
            **kwargs,
        }
        if max_tokens is not None:
            payload["max_tokens"] = max_tokens

        try:
            async with httpx.AsyncClient(timeout=self.timeout_seconds) as client:
                response = await client.post(
                    endpoint,
                    json=payload,
                    headers=self._get_headers(),
                )

                if response.status_code >= 400:
                    try:
                        error_data = response.json()
                        err_msg = error_data.get("error", {}).get("message", response.text)
                    except Exception:
                        err_msg = response.text
                    raise BifrostAPIError(
                        status_code=response.status_code,
                        message=err_msg,
                        payload=response.text,
                    )

                return response.json()
        except (httpx.ConnectError, httpx.NetworkError) as net_err:
            logger.error("Bifrost connection error at %s: %s", endpoint, net_err)
            raise BifrostConnectionError(
                f"Cannot connect to Bifrost Gateway at {self.base_url}. Please verify Bifrost is running."
            ) from net_err
        except httpx.TimeoutException as timeout_err:
            logger.error("Bifrost timeout at %s: %s", endpoint, timeout_err)
            raise BifrostConnectionError(
                f"Bifrost Gateway request timed out after {self.timeout_seconds}s at {self.base_url}."
            ) from timeout_err

    async def list_models(self) -> List[Dict[str, Any]]:
        """
        Queries Bifrost Gateway for registered models.
        """
        endpoint = f"{self.base_url}/v1/models"
        try:
            async with httpx.AsyncClient(timeout=self.timeout_seconds) as client:
                response = await client.get(endpoint, headers=self._get_headers())
                if response.status_code >= 400:
                    raise BifrostAPIError(
                        status_code=response.status_code,
                        message=response.text,
                    )
                data = response.json()
                return data.get("data", []) if isinstance(data, dict) else data
        except (httpx.ConnectError, httpx.NetworkError) as net_err:
            raise BifrostConnectionError(
                f"Cannot connect to Bifrost Gateway at {self.base_url}."
            ) from net_err


def get_bifrost_client() -> BifrostClient:
    """Factory function for acquiring a BifrostClient configured from settings."""
    return BifrostClient()

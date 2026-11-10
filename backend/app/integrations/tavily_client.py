import logging
import time
from typing import Any, Dict, List, Optional
import httpx
from app.config import get_settings

logger = logging.getLogger("nexusiq.integrations.tavily")


class TavilyError(Exception):
    """Base exception for Tavily Search API operations."""
    pass


class TavilyNotConfiguredError(TavilyError):
    """Raised when Tavily API key is missing."""
    pass


class TavilyAPIError(TavilyError):
    """Raised when Tavily API returns an error status code."""

    def __init__(self, status_code: int, message: str, payload: Optional[Any] = None):
        super().__init__(f"Tavily API Error {status_code}: {message}")
        self.status_code = status_code
        self.message = message
        self.payload = payload


class TavilyClient:
    """
    Independent HTTPX client for Tavily Search API.
    Designed for pre-meeting background research and evidence collection.
    """

    def __init__(
        self,
        api_key: Optional[str] = None,
        base_url: Optional[str] = None,
        timeout_seconds: Optional[float] = None,
    ):
        settings = get_settings()
        self.api_key = api_key or settings.tavily_api_key
        self.base_url = (base_url or settings.tavily_base_url).rstrip("/")
        self.timeout_seconds = timeout_seconds or settings.tavily_timeout_seconds

    async def check_health(self) -> Dict[str, Any]:
        """
        Validates configuration and checks connectivity to Tavily API.
        Does not reveal secret API keys in response.
        """
        if not self.api_key or not self.api_key.strip():
            return {
                "service": "tavily_search_api",
                "configured": False,
                "available": False,
                "base_url": self.base_url,
                "details": "Tavily API key is not configured. Set TAVILY_API_KEY in .env.",
            }

        masked_key = (
            f"{self.api_key[:6]}...{self.api_key[-4:]}"
            if len(self.api_key) > 10
            else "***"
        )

        # Quick validation ping to endpoint
        search_endpoint = f"{self.base_url}/search"
        start_time = time.perf_counter()
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.post(
                    search_endpoint,
                    json={
                        "api_key": self.api_key,
                        "query": "ping",
                        "max_results": 1,
                    },
                )
                latency_ms = round((time.perf_counter() - start_time) * 1000, 2)
                if response.status_code == 200:
                    return {
                        "service": "tavily_search_api",
                        "configured": True,
                        "available": True,
                        "masked_key": masked_key,
                        "latency_ms": latency_ms,
                        "details": "Connected successfully to Tavily Search API.",
                    }
                else:
                    return {
                        "service": "tavily_search_api",
                        "configured": True,
                        "available": False,
                        "masked_key": masked_key,
                        "latency_ms": latency_ms,
                        "details": f"API responded with status {response.status_code}: {response.text[:150]}",
                    }
        except httpx.ConnectError:
            return {
                "service": "tavily_search_api",
                "configured": True,
                "available": False,
                "masked_key": masked_key,
                "latency_ms": None,
                "details": "Could not connect to Tavily host. Check network connectivity.",
            }
        except httpx.TimeoutException:
            return {
                "service": "tavily_search_api",
                "configured": True,
                "available": False,
                "masked_key": masked_key,
                "latency_ms": None,
                "details": "Connection to Tavily API timed out.",
            }
        except Exception as exc:
            return {
                "service": "tavily_search_api",
                "configured": True,
                "available": False,
                "masked_key": masked_key,
                "latency_ms": None,
                "details": f"Error testing Tavily API: {str(exc)}",
            }

    async def search(
        self,
        query: str,
        search_depth: str = "basic",
        max_results: int = 5,
        include_domains: Optional[List[str]] = None,
        exclude_domains: Optional[List[str]] = None,
        include_answer: bool = True,
        include_raw_content: bool = False,
        **kwargs: Any,
    ) -> Dict[str, Any]:
        """
        Executes a web search query via Tavily Search API.
        Raises TavilyNotConfiguredError if API key is missing.
        Raises TavilyAPIError if Tavily returns an error response.
        """
        if not self.api_key:
            raise TavilyNotConfiguredError(
                "TAVILY_API_KEY is not set. Please add it to your .env file."
            )

        endpoint = f"{self.base_url}/search"
        payload: Dict[str, Any] = {
            "api_key": self.api_key,
            "query": query,
            "search_depth": search_depth,
            "max_results": max_results,
            "include_answer": include_answer,
            "include_raw_content": include_raw_content,
            **kwargs,
        }

        if include_domains:
            payload["include_domains"] = include_domains
        if exclude_domains:
            payload["exclude_domains"] = exclude_domains

        try:
            async with httpx.AsyncClient(timeout=self.timeout_seconds) as client:
                response = await client.post(endpoint, json=payload)

                if response.status_code >= 400:
                    err_text = response.text
                    try:
                        err_json = response.json()
                        err_text = err_json.get("detail", {}).get("error", err_text)
                    except Exception:
                        pass
                    raise TavilyAPIError(
                        status_code=response.status_code,
                        message=str(err_text),
                        payload=response.text,
                    )

                return response.json()
        except httpx.TimeoutException as timeout_err:
            logger.error("Tavily request timed out for query '%s': %s", query, timeout_err)
            raise TavilyError(
                f"Tavily search timed out after {self.timeout_seconds}s."
            ) from timeout_err
        except httpx.RequestError as req_err:
            logger.error("Tavily network request failed for query '%s': %s", query, req_err)
            raise TavilyError(
                f"Failed to communicate with Tavily API: {req_err}"
            ) from req_err


def get_tavily_client() -> TavilyClient:
    """Factory function for acquiring a TavilyClient configured from settings."""
    return TavilyClient()


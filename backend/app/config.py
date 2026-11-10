import json
from functools import lru_cache
from pathlib import Path
from typing import List, Optional, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

_backend_dir = Path(__file__).resolve().parent.parent
_env_file_candidates = (
    str(_backend_dir / ".env"),
    str(Path.cwd() / "backend" / ".env"),
    str(Path.cwd() / ".env"),
)


class Settings(BaseSettings):
    """Application configuration loaded from environment variables and .env file."""

    # Application settings
    app_name: str = "NexusIQ API"
    app_version: str = "0.1.0"
    app_description: str = (
        "AI Agent Benchmarking and Pre-Meeting Intelligence Platform Backend"
    )
    environment: str = "development"
    debug: bool = True
    host: str = "0.0.0.0"
    port: int = 8000

    # CORS settings for React/Vite frontends
    cors_origins: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
    ]

    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_cors_origins(cls, value: Union[str, List[str]]) -> List[str]:
        if isinstance(value, str):
            value = value.strip()
            if value.startswith("[") and value.endswith("]"):
                try:
                    return json.loads(value)
                except Exception:
                    pass
            return [origin.strip() for origin in value.split(",") if origin.strip()]
        return value

    # Firebase Firestore settings
    firebase_project_id: Optional[str] = "nexusiq-2fe97"
    firebase_credentials_path: Optional[str] = "firebase-service-account.json"
    firebase_database_url: Optional[str] = None

    # Bifrost AI Gateway settings
    bifrost_base_url: str = "http://localhost:8080"
    bifrost_api_key: Optional[str] = None
    bifrost_username: Optional[str] = None
    bifrost_password: Optional[str] = None
    bifrost_setup_token: Optional[str] = None
    bifrost_default_model: str = "gemini/gemini-1.5-flash"
    bifrost_timeout_seconds: float = 30.0

    # Tavily Search API settings
    tavily_api_key: Optional[str] = None
    tavily_base_url: str = "https://api.tavily.com"
    tavily_timeout_seconds: float = 20.0

    model_config = SettingsConfigDict(
        env_file=_env_file_candidates,
        env_file_encoding="utf-8",
        extra="ignore",
    )


@lru_cache()
def get_settings() -> Settings:
    """Returns a cached instance of application settings."""
    return Settings()


import time
from typing import Any, Dict
from fastapi import APIRouter, status
from app.config import get_settings
from app.integrations.firebase_client import check_firebase_health
from app.integrations.bifrost_client import get_bifrost_client
from app.integrations.tavily_client import get_tavily_client

from app.api.agents import router as agents_router
from app.api.benchmarks import router as benchmarks_router
from app.api.briefings import router as briefings_router
from app.api.datasets import router as datasets_router
from app.api.meetings import router as meetings_router
from app.api.ml import router as ml_router
from app.api.models import router as models_router
from app.api.stats import router as stats_router
from app.api.traces import router as traces_router

api_router = APIRouter(prefix="/api")

# Sub-routers for platform features
api_router.include_router(agents_router)
api_router.include_router(benchmarks_router)
api_router.include_router(briefings_router)
api_router.include_router(datasets_router)
api_router.include_router(meetings_router)
api_router.include_router(ml_router)
api_router.include_router(models_router)
api_router.include_router(stats_router)
api_router.include_router(traces_router)


@api_router.get(
    "/health",
    tags=["Health"],
    summary="NexusIQ Backend System Health",
    description="Returns general server health status, environment info, and connectivity summary.",
)
async def health_check() -> Dict[str, Any]:
    settings = get_settings()
    return {
        "status": "healthy",
        "app_name": settings.app_name,
        "version": settings.app_version,
        "environment": settings.environment,
        "timestamp": time.time(),
        "services": {
            "api": "online",
            "database": "firebase_firestore",
        },
    }


@api_router.get(
    "/health/firebase",
    tags=["Health"],
    summary="Firebase Firestore Health Check",
    description="Inspects Firebase Admin SDK credentials and Firestore database connectivity.",
)
async def firebase_health_check() -> Dict[str, Any]:
    return check_firebase_health()


@api_router.get(
    "/health/bifrost",
    tags=["Health"],
    summary="Bifrost AI Gateway Health Check",
    description="Pings Bifrost Gateway to verify routing and availability.",
)
async def bifrost_health_check() -> Dict[str, Any]:
    client = get_bifrost_client()
    return await client.check_health()


@api_router.get(
    "/health/tavily",
    tags=["Health"],
    summary="Tavily Search API Health Check",
    description="Validates Tavily Search API key configuration and network connectivity.",
)
async def tavily_health_check() -> Dict[str, Any]:
    client = get_tavily_client()
    return await client.check_health()


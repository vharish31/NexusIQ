import logging
from contextlib import asynccontextmanager
from typing import Any, Dict
from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.config import get_settings
from app.api import api_router
from app.integrations.firebase_client import initialize_firebase

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("nexusiq")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifecycle management: initializes external clients on startup."""
    settings = get_settings()
    logger.info("Starting %s v%s in %s mode...", settings.app_name, settings.app_version, settings.environment)

    # Attempt to initialize Firebase Admin SDK
    try:
        initialize_firebase()
    except Exception as exc:
        logger.warning("Firebase startup initialization note: %s", exc)

    logger.info("Bifrost base URL configured: %s", settings.bifrost_base_url)
    logger.info("Tavily configured: %s", bool(settings.tavily_api_key))

    yield

    logger.info("Shutting down %s...", settings.app_name)


def create_application() -> FastAPI:
    """FastAPI application factory with middleware, routers, and exception handlers."""
    settings = get_settings()

    app = FastAPI(
        title=settings.app_name,
        description=(
            "NexusIQ Backend API — Autonomous AI Agent Benchmarking and "
            "Pre-Meeting Intelligence Platform powered by Firebase Firestore, "
            "Bifrost AI Gateway, and Tavily Search API."
        ),
        version=settings.app_version,
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
        lifespan=lifespan,
    )

    # CORS configuration for React / Vite frontend
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # --------------------------------------------------------------------------
    # Global Exception Handlers
    # --------------------------------------------------------------------------

    @app.exception_handler(StarletteHTTPException)
    async def http_exception_handler(request: Request, exc: StarletteHTTPException) -> JSONResponse:
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "success": False,
                "error": {
                    "code": f"HTTP_{exc.status_code}",
                    "message": exc.detail,
                    "status_code": exc.status_code,
                    "path": request.url.path,
                },
            },
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
        errors = []
        for error in exc.errors():
            errors.append({
                "loc": error.get("loc"),
                "msg": error.get("msg"),
                "type": error.get("type"),
            })
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={
                "success": False,
                "error": {
                    "code": "VALIDATION_ERROR",
                    "message": "Invalid request parameters or payload.",
                    "details": errors,
                    "status_code": status.HTTP_422_UNPROCESSABLE_ENTITY,
                    "path": request.url.path,
                },
            },
        )

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
        logger.exception("Unhandled application error at %s: %s", request.url.path, exc)
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "success": False,
                "error": {
                    "code": "INTERNAL_SERVER_ERROR",
                    "message": "An internal server error occurred while processing your request.",
                    "status_code": status.HTTP_500_INTERNAL_SERVER_ERROR,
                    "path": request.url.path,
                },
            },
        )

    # --------------------------------------------------------------------------
    # Root Landing Endpoint
    # --------------------------------------------------------------------------

    @app.get(
        "/",
        tags=["General"],
        summary="NexusIQ API Root",
        description="Landing endpoint returning service status and documentation references.",
    )
    async def root() -> Dict[str, Any]:
        return {
            "name": settings.app_name,
            "version": settings.app_version,
            "status": "online",
            "documentation": {
                "swagger_ui": "/docs",
                "redoc": "/redoc",
                "openapi_spec": "/openapi.json",
            },
            "endpoints": {
                "health": "/api/health",
                "firebase_health": "/api/health/firebase",
                "bifrost_health": "/api/health/bifrost",
                "tavily_health": "/api/health/tavily",
                "stats": "/api/stats",
                "search": "/api/search",
                "models": "/api/models",
                "datasets": "/api/datasets",
                "agents": "/api/agents",
                "benchmarks": "/api/benchmarks",
                "benchmark_suites": "/api/benchmarks/suites",
                "traces": "/api/traces",
                "briefings": "/api/briefings",
                "meetings": "/api/meetings",
            },
        }

    # Mount the /api router
    app.include_router(api_router)

    return app


app = create_application()


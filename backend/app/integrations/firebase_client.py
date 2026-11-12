import itertools
import json
import logging
import os
import time
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple
import firebase_admin
from firebase_admin import credentials, firestore
from app.config import get_settings

logger = logging.getLogger("nexusiq.integrations.firebase")

_firebase_app: Optional[firebase_admin.App] = None
_firestore_client: Optional[Any] = None
_health_cache: Optional[Tuple[float, Dict[str, Any]]] = None
_HEALTH_CACHE_TTL = 30.0

# Default candidate filenames to search for service account JSON
CREDENTIAL_CANDIDATES: List[str] = [
    "firebase-service-account.json",
    "serviceAccountKey.json",
    "firebase-key.json",
    "service-account.json",
]


class FirebaseNotConfiguredError(RuntimeError):
    """Raised when Firestore is accessed but Firebase credentials are not configured."""
    pass


def resolve_credentials_path(configured_path: Optional[str]) -> Optional[str]:
    """
    Resolves the actual absolute path to the Firebase service account JSON.
    Searches:
      1. Explicit path as given or relative to cwd.
      2. Explicit path relative to the backend project root.
      3. Candidate filenames in cwd.
      4. Candidate filenames in the backend directory.
    """
    backend_root = Path(__file__).resolve().parent.parent.parent
    cwd = Path.cwd()

    search_dirs = [cwd, backend_root]

    # Check explicit configured path first
    if configured_path:
        p = Path(configured_path)
        if p.is_absolute() and p.exists():
            return str(p)
        for base in search_dirs:
            candidate = base / configured_path
            if candidate.exists():
                return str(candidate.resolve())

    # Fallback search candidate filenames in known locations
    for filename in CREDENTIAL_CANDIDATES:
        for base in search_dirs:
            candidate = base / filename
            if candidate.exists():
                logger.info("Auto-detected Firebase credentials file: %s", candidate)
                return str(candidate.resolve())

    return None


def initialize_firebase() -> Optional[firebase_admin.App]:
    """
    Initializes the Firebase Admin SDK.
    Supports service account JSON key file or Application Default Credentials (ADC).
    """
    global _firebase_app, _firestore_client

    if _firebase_app is not None:
        return _firebase_app

    if firebase_admin._apps:
        _firebase_app = firebase_admin.get_app()
        logger.info("Using existing Firebase default app '%s'", _firebase_app.name)
        return _firebase_app

    settings = get_settings()
    resolved_path = resolve_credentials_path(settings.firebase_credentials_path)
    cred = None
    detected_project_id: Optional[str] = None

    if resolved_path and os.path.exists(resolved_path):
        try:
            logger.info("Initializing Firebase Admin with service account: %s", resolved_path)
            cred = credentials.Certificate(resolved_path)

            # Safely inspect project_id from certificate JSON if available
            try:
                with open(resolved_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    detected_project_id = data.get("project_id")
            except Exception:
                pass
        except Exception as exc:
            logger.error("Failed to load Firebase credentials from %s: %s", resolved_path, exc)
            return None
    elif settings.firebase_credentials_path:
        logger.warning(
            "Could not locate service account file for configured path: '%s'",
            settings.firebase_credentials_path,
        )

    options: Dict[str, Any] = {}
    effective_project_id = (
        detected_project_id
        or settings.firebase_project_id
        or (cred.project_id if hasattr(cred, "project_id") else None)
    )
    if effective_project_id:
        options["projectId"] = effective_project_id
    if settings.firebase_database_url:
        options["databaseURL"] = settings.firebase_database_url

    try:
        if cred is not None:
            _firebase_app = firebase_admin.initialize_app(cred, options=options)
        elif os.environ.get("GOOGLE_APPLICATION_CREDENTIALS"):
            logger.info("Initializing Firebase with GOOGLE_APPLICATION_CREDENTIALS")
            _firebase_app = firebase_admin.initialize_app(options=options)
        else:
            logger.warning(
                "No Firebase credentials found. Place 'firebase-service-account.json' in backend/ "
                "or configure FIREBASE_CREDENTIALS_PATH in .env."
            )
            return None

        logger.info(
            "Firebase Admin SDK initialized successfully for project '%s'.",
            effective_project_id,
        )
        return _firebase_app
    except Exception as exc:
        logger.error("Failed to initialize Firebase Admin SDK: %s", exc)
        return None


def get_firebase_app() -> Optional[firebase_admin.App]:
    """Returns the current Firebase app instance, initializing if needed."""
    return initialize_firebase()


def get_firestore_client() -> Any:
    """
    Returns the Firestore database client.
    Raises FirebaseNotConfiguredError if Firebase is not properly initialized.
    """
    global _firestore_client
    if _firestore_client is not None:
        return _firestore_client

    app = initialize_firebase()
    if app is None:
        raise FirebaseNotConfiguredError(
            "Firebase is not configured. Please supply 'firebase-service-account.json' "
            "or set FIREBASE_CREDENTIALS_PATH in .env."
        )

    try:
        _firestore_client = firestore.client(app=app)
        return _firestore_client
    except Exception as exc:
        logger.error("Failed to acquire Firestore client: %s", exc)
        raise FirebaseNotConfiguredError(f"Error creating Firestore client: {exc}") from exc


def get_collection(collection_name: str) -> Any:
    """Convenience helper to obtain a Firestore collection reference."""
    return get_firestore_client().collection(collection_name)


def check_firebase_health(force_refresh: bool = False) -> Dict[str, Any]:
    """
    Verifies Firebase connectivity and configuration health.
    Caches successful status briefly to prevent redundant network roundtrips.
    """
    global _health_cache
    now = time.time()
    if not force_refresh and _health_cache is not None:
        cached_at, cached_report = _health_cache
        if (now - cached_at) < _HEALTH_CACHE_TTL:
            return dict(cached_report)

    settings = get_settings()
    resolved_path = resolve_credentials_path(settings.firebase_credentials_path)

    health_report = {
        "service": "firebase_firestore",
        "configured": bool(resolved_path),
        "connected": False,
        "project_id": settings.firebase_project_id,
        "credentials_path": resolved_path or settings.firebase_credentials_path,
        "details": "",
    }

    try:
        client = get_firestore_client()
        health_report["configured"] = True
        health_report["project_id"] = client.project

        # Perform a lightweight metadata check (limit to first 5 collections)
        collection_names = [col.id for col in itertools.islice(client.collections(), 5)]
        health_report["connected"] = True
        health_report["details"] = (
            f"Connected successfully to Firestore project '{client.project}'. "
            f"Collections visible: {collection_names if collection_names else 'None (empty database)'}."
        )
        _health_cache = (now, health_report)
        return health_report
    except FirebaseNotConfiguredError as fnc_err:
        health_report["configured"] = False
        health_report["connected"] = False
        health_report["details"] = str(fnc_err)
        _health_cache = (now, health_report)
        return health_report
    except Exception as exc:
        health_report["configured"] = True
        health_report["connected"] = False
        health_report["details"] = f"Connection failed: {str(exc)}"
        return health_report


def reset_firebase_state() -> None:
    """Resets cached app and client instances (useful during testing or reconfiguration)."""
    global _firebase_app, _firestore_client, _health_cache
    _firestore_client = None
    _firebase_app = None
    _health_cache = None

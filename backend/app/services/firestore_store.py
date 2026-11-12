"""Shared Firestore document store helpers with write-through caching and safe fallback."""

import logging
import time
from typing import Any, Dict, List, Optional, Tuple
from app.integrations.firebase_client import (
    FirebaseNotConfiguredError,
    get_firestore_client,
)

logger = logging.getLogger("nexusiq.services.firestore_store")

_TRANSIENT_STORE: Dict[str, Dict[str, Dict[str, Any]]] = {}
_COLLECTION_CACHE: Dict[str, Tuple[float, List[Dict[str, Any]], str]] = {}
_CACHE_TTL_SECONDS = 20.0


def _safe_doc_id(doc_id: str) -> str:
    """Sanitize document IDs so slashes cannot create invalid Firestore path segments."""
    return doc_id.replace("/", "__")


def invalidate_collection_cache(collection: str) -> None:
    """Clear cached collection listing immediately upon writes."""
    _COLLECTION_CACHE.pop(collection, None)


def save_document(collection: str, doc_id: str, data: Dict[str, Any]) -> bool:
    """Persist a document to Firestore and mirror in cache. Returns True if persisted."""
    safe_id = _safe_doc_id(doc_id)
    _TRANSIENT_STORE.setdefault(collection, {})[doc_id] = dict(data)
    invalidate_collection_cache(collection)
    try:
        db = get_firestore_client()
        db.collection(collection).document(safe_id).set(data)
        return True
    except (FirebaseNotConfiguredError, Exception) as exc:
        logger.info("Firestore unavailable writing %s/%s (%s); kept in transient store.", collection, safe_id, exc)
        return False


def get_document(collection: str, doc_id: str) -> Optional[Dict[str, Any]]:
    """Retrieve a single document by ID from local cache, Firestore, or transient store."""
    cached_local = _TRANSIENT_STORE.get(collection, {}).get(doc_id)
    if cached_local is not None:
        return cached_local

    safe_id = _safe_doc_id(doc_id)
    try:
        db = get_firestore_client()
        doc = db.collection(collection).document(safe_id).get()
        if doc.exists:
            data = doc.to_dict()
            _TRANSIENT_STORE.setdefault(collection, {})[doc_id] = data
            return data
    except (FirebaseNotConfiguredError, Exception) as exc:
        logger.info("Firestore unavailable reading %s/%s (%s).", collection, safe_id, exc)

    return None


def list_documents(
    collection: str,
    order_by_field: Optional[str] = None,
    descending: bool = True,
    limit: int = 50,
) -> Tuple[List[Dict[str, Any]], str]:
    """List documents from Firestore with write-through TTL caching."""
    now = time.time()
    cached_entry = _COLLECTION_CACHE.get(collection)
    if cached_entry is not None:
        cached_at, cached_docs, cached_source = cached_entry
        if (now - cached_at) < _CACHE_TTL_SECONDS:
            items = list(cached_docs)
            if order_by_field:
                items.sort(key=lambda item: item.get(order_by_field, 0) or 0, reverse=descending)
            return items[:limit], cached_source

    try:
        db = get_firestore_client()
        query = db.collection(collection)
        if order_by_field:
            direction = "DESCENDING" if descending else "ASCENDING"
            query = query.order_by(order_by_field, direction=direction)
        docs = [doc.to_dict() for doc in query.limit(max(limit, 100)).stream()]
        for d in docs:
            d_id = d.get("id") or d.get("briefing_id") or d.get("run_id") or d.get("dataset_id")
            if d_id:
                _TRANSIENT_STORE.setdefault(collection, {})[str(d_id)] = d
        _COLLECTION_CACHE[collection] = (now, docs, "firestore")
        return docs[:limit], "firestore"
    except (FirebaseNotConfiguredError, Exception) as exc:
        logger.info("Firestore unavailable listing %s (%s); reading transient store.", collection, exc)
        cached = list(_TRANSIENT_STORE.get(collection, {}).values())
        if order_by_field:
            cached.sort(key=lambda item: item.get(order_by_field, 0) or 0, reverse=descending)
        return cached[:limit], "transient_memory"


def update_document(
    collection: str,
    doc_id: str,
    updates: Dict[str, Any],
) -> Tuple[Optional[Dict[str, Any]], bool]:
    """Update fields on an existing document in Firestore and cache."""
    existing = get_document(collection, doc_id)
    if existing is None:
        return None, False

    merged = {**existing, **updates}
    persisted = save_document(collection, doc_id, merged)
    return merged, persisted

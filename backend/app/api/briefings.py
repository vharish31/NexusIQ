import logging
import time
import uuid
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, HTTPException, status
from app.agents.briefing_agent import (
    get_briefing_agent,
    BriefingRequest,
    BriefingDocument,
)
from app.integrations.firebase_client import (
    get_firestore_client,
    FirebaseNotConfiguredError,
)

logger = logging.getLogger("nexusiq.api.briefings")
router = APIRouter(prefix="/briefings", tags=["Briefings"])

# Transient memory storage when Firestore is not yet configured
_IN_MEMORY_BRIEFINGS: Dict[str, Dict[str, Any]] = {}


@router.post(
    "/generate",
    response_model=Dict[str, Any],
    summary="Generate Pre-Meeting Briefing",
    description="Synthesizes open-source intelligence and trust evidence into an executive briefing for an upcoming meeting.",
)
async def generate_briefing(payload: BriefingRequest) -> Dict[str, Any]:
    try:
        agent = get_briefing_agent()
        briefing_doc: BriefingDocument = await agent.generate_briefing(payload)

        briefing_id = f"brf_{uuid.uuid4().hex[:10]}"
        record = {
            "briefing_id": briefing_id,
            "created_at": time.time(),
            **briefing_doc.model_dump(),
            "persisted_to_firestore": False,
        }

        # Attempt to save to Firestore
        try:
            firestore_db = get_firestore_client()
            firestore_db.collection("briefings").document(briefing_id).set(record)
            record["persisted_to_firestore"] = True
        except (FirebaseNotConfiguredError, Exception) as exc:
            logger.info("Firestore unavailable for briefing persistence (%s); using in-memory.", exc)

        _IN_MEMORY_BRIEFINGS[briefing_id] = record

        return {
            "status": "success",
            "briefing_id": briefing_id,
            "briefing": record,
        }
    except Exception as exc:
        logger.error("Failed to generate pre-meeting briefing: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Briefing generation failed: {str(exc)}",
        )


@router.get(
    "",
    summary="List Pre-Meeting Briefings",
    description="Retrieves pre-meeting intelligence briefings saved in Firestore.",
)
async def list_briefings(limit: int = 20) -> Dict[str, Any]:
    try:
        firestore_db = get_firestore_client()
        docs = (
            firestore_db.collection("briefings")
            .order_by("created_at", direction="DESCENDING")
            .limit(limit)
            .stream()
        )
        briefings = [doc.to_dict() for doc in docs]
        return {
            "status": "success",
            "source": "firestore",
            "count": len(briefings),
            "briefings": briefings,
        }
    except (FirebaseNotConfiguredError, Exception) as exc:
        logger.info("Firestore unavailable for briefings list: %s", exc)
        briefings = list(_IN_MEMORY_BRIEFINGS.values())
        return {
            "status": "success",
            "source": "transient_memory",
            "notice": "Firebase not connected; displaying transient session data.",
            "count": len(briefings),
            "briefings": briefings[:limit],
        }


@router.get(
    "/{briefing_id}",
    summary="Get Specific Briefing Dossier",
    description="Fetches full pre-meeting intelligence dossier by briefing ID.",
)
async def get_briefing(briefing_id: str) -> Dict[str, Any]:
    try:
        firestore_db = get_firestore_client()
        doc = firestore_db.collection("briefings").document(briefing_id).get()
        if doc.exists:
            return {"status": "success", "briefing": doc.to_dict()}
    except Exception:
        pass

    if briefing_id in _IN_MEMORY_BRIEFINGS:
        return {"status": "success", "briefing": _IN_MEMORY_BRIEFINGS[briefing_id]}

    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"Briefing dossier with ID '{briefing_id}' not found.",
    )


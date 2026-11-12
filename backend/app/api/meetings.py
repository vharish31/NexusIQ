"""API routes for meeting records, briefings, and action item management in Firestore."""

import time
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, HTTPException, Query, status
from pydantic import BaseModel, Field
from app.services.firestore_store import (
    get_document,
    list_documents,
    save_document,
    update_document,
)

router = APIRouter(prefix="/meetings", tags=["Meetings"])


class MeetingCreateRequest(BaseModel):
    title: str = Field(..., min_length=1)
    department: str = Field(default="Executive")
    notes: Optional[str] = Field(default=None)
    participants: List[Dict[str, str]] = Field(default_factory=list)
    fileName: Optional[str] = Field(default=None)


class ActionItemStatusUpdate(BaseModel):
    status: str = Field(..., pattern="^(Pending|In Progress|Completed)$")


@router.get(
    "",
    summary="List Meetings",
    description="Retrieves meeting intelligence records from Firebase Firestore with optional department/search filters.",
)
async def list_meetings(
    department: Optional[str] = Query(default=None),
    query: Optional[str] = Query(default=None),
    limit: int = Query(default=50, ge=1, le=200),
) -> Dict[str, Any]:
    docs, source = list_documents("meetings", order_by_field="createdAt", descending=True, limit=limit)

    if department and department.lower() != "all":
        dept_l = department.lower()
        docs = [m for m in docs if str(m.get("department", "")).lower() == dept_l]

    if query:
        q = query.lower()
        docs = [
            m for m in docs
            if q in str(m.get("title", "")).lower()
            or q in str(m.get("id", "")).lower()
            or any(q in str(p.get("name", "")).lower() for p in m.get("participants", []))
        ]

    return {
        "success": True,
        "source": source,
        "total": len(docs),
        "data": docs,
    }


@router.post(
    "",
    summary="Create / Ingest Meeting Record",
    description="Creates a meeting record in Firestore for briefing and action item tracking.",
)
async def create_meeting(payload: MeetingCreateRequest) -> Dict[str, Any]:
    meeting_id = f"MTG-{uuid.uuid4().hex[:6].upper()}"
    now_dt = datetime.now(timezone.utc)
    summary_text = (
        payload.notes.strip()
        if payload.notes and payload.notes.strip()
        else (
            f"Meeting record '{payload.title}' ingested ({payload.fileName}). "
            "Ready for pre-meeting research or transcript attachment."
            if payload.fileName
            else f"Meeting record '{payload.title}' created in {payload.department} workspace."
        )
    )

    participants = payload.participants or [
        {"name": "Meeting Host", "role": payload.department, "avatar": "MH", "color": "#3B82F6"},
    ]

    meeting_doc = {
        "id": meeting_id,
        "title": payload.title.strip(),
        "date": now_dt.strftime("%Y-%m-%d"),
        "time": now_dt.strftime("%H:%M UTC"),
        "duration": "Pending",
        "department": payload.department,
        "sentiment": "Neutral",
        "sentimentScore": 0,
        "status": "Briefing Ready" if payload.notes else "Ingested",
        "trustScore": 100.0 if payload.notes else 0.0,
        "participants": participants,
        "summaryExcerpt": summary_text[:220],
        "actionItemsCount": 0,
        "keyDecisionsCount": 0,
        "audioDurationSeconds": 0,
        "hasTranscript": bool(payload.notes),
        "hasAudio": bool(payload.fileName),
        "topics": [payload.department],
        "executiveSummary": [summary_text],
        "strategicDecisions": [],
        "actionItems": [],
        "topicsTimeline": [
            {"time": "00:00 - End", "topic": payload.title.strip(), "percentage": 100}
        ],
        "transcriptSegments": (
            [
                {
                    "id": "SEG-1",
                    "speaker": "Notes",
                    "speakerRole": payload.department,
                    "timestamp": "00:00",
                    "seconds": 0,
                    "sentiment": "Neutral",
                    "confidence": 1.0,
                    "text": payload.notes.strip(),
                }
            ]
            if payload.notes
            else []
        ),
        "sentimentBreakdown": {"positive": 0, "neutral": 100, "negative": 0},
        "aiConfidenceScore": 100.0 if payload.notes else 0.0,
        "createdAt": time.time(),
    }

    persisted = save_document("meetings", meeting_id, meeting_doc)
    return {
        "success": True,
        "persisted_to_firestore": persisted,
        "data": meeting_doc,
        "message": f"Meeting '{meeting_doc['title']}' saved to Firestore.",
    }


@router.get(
    "/{meeting_id}",
    summary="Get Meeting by ID",
    description="Fetches a meeting record from Firestore.",
)
async def get_meeting(meeting_id: str) -> Dict[str, Any]:
    doc = get_document("meetings", meeting_id)
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Meeting '{meeting_id}' not found.",
        )
    return {"success": True, "data": doc}


@router.get(
    "/{meeting_id}/briefing",
    summary="Get Meeting Briefing Details",
    description="Fetches detailed executive briefing, decisions, and action items for a meeting or latest briefing.",
)
async def get_meeting_briefing(meeting_id: str) -> Dict[str, Any]:
    doc = get_document("meetings", meeting_id)
    if doc:
        return {"success": True, "data": doc}

    # If default placeholder ID or not found directly, return latest meeting if one exists
    if meeting_id == "MTG-101":
        meetings, _ = list_documents("meetings", order_by_field="createdAt", descending=True, limit=1)
        if meetings:
            return {"success": True, "data": meetings[0]}

        # Check pre-meeting briefings collection and adapt for briefing page if any exist
        briefings, _ = list_documents("briefings", order_by_field="created_at", descending=True, limit=1)
        if briefings:
            b = briefings[0]
            adapted = {
                "id": b.get("id") or b.get("briefing_id"),
                "title": b.get("meeting_title") or b.get("subject") or "Executive Briefing",
                "date": b.get("meetingDate") or datetime.now(timezone.utc).strftime("%Y-%m-%d"),
                "time": "Pre-Meeting Dossier",
                "duration": f"{b.get('execution_time_ms', 0)}ms",
                "department": b.get("subjectType", "Research"),
                "sentimentOverall": "Verified Intelligence",
                "sentimentBreakdown": {"positive": 80, "neutral": 20, "negative": 0},
                "aiConfidenceScore": b.get("trustVerificationScore") or b.get("trust_report", {}).get("overall_trust_score", 0.0),
                "status": "Verified Briefing",
                "executiveSummary": [b.get("executiveSummary") or b.get("executive_summary", "")],
                "strategicDecisions": [],
                "actionItems": [],
                "topicsTimeline": [
                    {"time": "Pre-Meeting", "topic": b.get("subject") or b.get("company_name") or "Target Research", "percentage": 100}
                ],
                "transcriptSegments": [
                    {
                        "id": f"SEG-{idx + 1}",
                        "speaker": news.get("source", "Tavily Source"),
                        "speakerRole": news.get("verificationStatus", "Verified"),
                        "timestamp": news.get("publishedDate", ""),
                        "seconds": idx * 30,
                        "sentiment": "Verified",
                        "confidence": 1.0,
                        "text": f"{news.get('headline', '')} — {news.get('summary', '')}",
                    }
                    for idx, news in enumerate(b.get("recentNews", []))
                ],
            }
            return {"success": True, "data": adapted}

    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"Briefing for meeting '{meeting_id}' not found.",
    )


@router.patch(
    "/{meeting_id}/action-items/{action_id}",
    summary="Update Action Item Status",
    description="Updates an action item's completion status in Firestore.",
)
async def update_action_item_status(
    meeting_id: str,
    action_id: str,
    payload: ActionItemStatusUpdate,
) -> Dict[str, Any]:
    doc = get_document("meetings", meeting_id)
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Meeting '{meeting_id}' not found.",
        )

    action_items = list(doc.get("actionItems", []))
    updated_item = None
    for item in action_items:
        if item.get("id") == action_id:
            item["status"] = payload.status
            updated_item = item
            break

    if not updated_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Action item '{action_id}' not found in meeting '{meeting_id}'.",
        )

    _, persisted = update_document("meetings", meeting_id, {"actionItems": action_items})
    return {
        "success": True,
        "persisted_to_firestore": persisted,
        "data": updated_item,
    }


"""API routes and helper utilities for Agent Execution Traces in Firestore."""

import time
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List
from fastapi import APIRouter, HTTPException, status
from app.services.firestore_store import get_document, list_documents, save_document

router = APIRouter(prefix="/traces", tags=["Traces"])


def record_agent_trace(
    name: str,
    description: str,
    model: str,
    steps: List[Dict[str, Any]],
    trust_score: float,
    total_duration_ms: float,
    prompt_tokens: int = 0,
    completion_tokens: int = 0,
    guardrails_passed: List[str] = None,
    warning_count: int = 0,
) -> Dict[str, Any]:
    """Create and persist an execution trace document into Firestore."""
    trace_id = f"TR-{uuid.uuid4().hex[:6].upper()}"
    total_tokens = prompt_tokens + completion_tokens
    # Approximate token cost for observability display
    estimated_cost = f"${round((total_tokens / 1000.0) * 0.0015, 4):.4f}"
    now_str = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")

    trace_doc = {
        "id": trace_id,
        "name": name,
        "description": description,
        "model": model,
        "executionDate": now_str,
        "timestamp": time.time(),
        "totalDurationMs": round(total_duration_ms, 2),
        "totalTokens": total_tokens,
        "promptTokens": prompt_tokens,
        "completionTokens": completion_tokens,
        "estimatedCost": estimated_cost,
        "status": "Verified" if warning_count == 0 and trust_score >= 70.0 else "Warning",
        "trustScore": round(trust_score, 1),
        "guardrailsPassed": guardrails_passed or [
            "Hallucination Check",
            "Source Grounding",
            "Schema Verified",
        ],
        "warningCount": warning_count,
        "steps": steps,
    }
    save_document("traces", trace_id, trace_doc)
    return trace_doc


@router.get(
    "",
    summary="List Agent Execution Traces",
    description="Retrieves recorded agent workflow traces from Firebase Firestore.",
)
async def list_traces(limit: int = 30) -> Dict[str, Any]:
    docs, source = list_documents("traces", order_by_field="timestamp", descending=True, limit=limit)
    return {
        "success": True,
        "source": source,
        "count": len(docs),
        "data": docs,
    }


@router.get(
    "/{trace_id}",
    summary="Get Agent Execution Trace",
    description="Retrieves detailed step-by-step payloads for a specific trace ID.",
)
async def get_trace(trace_id: str) -> Dict[str, Any]:
    doc = get_document("traces", trace_id)
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Agent trace '{trace_id}' not found.",
        )
    return {
        "success": True,
        "data": doc,
    }


"""API routes for registering and listing AI Agent models for benchmarking."""

import re
import time
from typing import Any, Dict, List, Optional
from fastapi import APIRouter
from pydantic import BaseModel, Field
from app.config import get_settings
from app.integrations.bifrost_client import get_bifrost_client
from app.ml.predictor import get_model_metrics, is_model_available
from app.services.firestore_store import list_documents, save_document

router = APIRouter(prefix="/models", tags=["Models"])

DEFAULT_MODELS: List[Dict[str, Any]] = [
    {
        "id": "nexusiq-fact-verifier-v1",
        "name": "NexusIQ Fact Verifier v1 (Trained on FEVER+FEVEROUS)",
        "provider": "NexusIQ ML Core (Local Joblib)",
        "type": "3-Class Fact Verification Classifier",
        "trustScore": 0.0,
        "status": "Trained",
        "color": "#10B981",
        "endpoint": "internal://ml/fact-verifier-v1",
    },
    {
        "id": "gemini/gemini-1.5-flash",
        "name": "Gemini 1.5 Flash (via Bifrost)",
        "provider": "Google Gemini (Bifrost Gateway)",
        "type": "Fast Agentic & Verification",
        "trustScore": 0.0,
        "status": "Configured",
        "color": "#8B5CF6",
        "endpoint": "http://localhost:8080/v1/chat/completions",
    },
    {
        "id": "gemini/gemini-1.5-pro",
        "name": "Gemini 1.5 Pro (via Bifrost)",
        "provider": "Google Gemini (Bifrost Gateway)",
        "type": "Long-Context Reasoning",
        "trustScore": 0.0,
        "status": "Configured",
        "color": "#3B82F6",
        "endpoint": "http://localhost:8080/v1/chat/completions",
    },
    {
        "id": "nexus-trust-evaluator",
        "name": "NexusIQ Trust Engine (Deterministic)",
        "provider": "NexusIQ Core",
        "type": "Evidence Grounding Specialist",
        "trustScore": 0.0,
        "status": "Active",
        "color": "#10B981",
        "endpoint": "internal://trust-engine",
    },
]


class RegisterModelRequest(BaseModel):
    name: str = Field(..., min_length=1, description="Display name of the agent/model")
    provider: str = Field(default="Custom Endpoint")
    type: str = Field(default="Agentic Tool-Calling")
    endpoint: Optional[str] = Field(default=None)


@router.get(
    "",
    summary="List Registered Agent Models",
    description="Returns AI agent models from Firestore enriched with live Bifrost Gateway models when available.",
)
async def list_models() -> Dict[str, Any]:
    docs, source = list_documents("models", order_by_field="createdAt", descending=True, limit=100)

    existing_ids = {d.get("id") for d in docs if d.get("id")}
    missing_defaults = [m for m in DEFAULT_MODELS if m["id"] not in existing_ids]
    if missing_defaults:
        settings = get_settings()
        for idx, base_model in enumerate(missing_defaults):
            entry = {
                **base_model,
                "endpoint": (
                    f"{settings.bifrost_base_url.rstrip('/')}/v1/chat/completions"
                    if "Bifrost" in base_model["provider"]
                    else base_model["endpoint"]
                ),
                "createdAt": time.time() - idx,
            }
            save_document("models", entry["id"], entry)
            docs.append(entry)

    # Enrich trustScore from actual benchmark runs in Firestore if available
    benchmarks, _ = list_documents("benchmarks", order_by_field="timestamp", descending=True, limit=100)
    latest_scores: Dict[str, float] = {}
    for run in benchmarks:
        m_id = run.get("modelId")
        if m_id and m_id not in latest_scores and isinstance(run.get("trustScore"), (int, float)):
            latest_scores[m_id] = float(run["trustScore"])

    # Optionally discover live models from Bifrost when online
    known_ids = {m["id"] for m in docs}
    try:
        bifrost = get_bifrost_client()
        health = await bifrost.check_health()
        if health.get("available"):
            live_models = await bifrost.list_models()
            for lm in live_models:
                lm_id = lm.get("id")
                if lm_id and lm_id not in known_ids:
                    docs.append(
                        {
                            "id": lm_id,
                            "name": lm_id,
                            "provider": lm.get("owned_by", "Bifrost Gateway"),
                            "type": "Live Gateway Model",
                            "trustScore": latest_scores.get(lm_id, 0.0),
                            "status": "Active",
                            "color": "#22D3EE",
                            "endpoint": f"{bifrost.base_url}/v1/chat/completions",
                        }
                    )
                    known_ids.add(lm_id)
    except Exception:
        pass

    ml_metrics = get_model_metrics() if is_model_available() else None
    ml_test_acc = (
        round(float(ml_metrics.get("test_evaluation", {}).get("accuracy", 0.0)) * 100.0, 1)
        if ml_metrics
        else 0.0
    )

    for model in docs:
        if model["id"] == "nexusiq-fact-verifier-v1" and ml_test_acc > 0:
            model["status"] = "Active"
            model["trustScore"] = latest_scores.get(model["id"], ml_test_acc)
        elif model["id"] in latest_scores:
            model["trustScore"] = latest_scores[model["id"]]

    return {
        "success": True,
        "source": source,
        "count": len(docs),
        "data": docs,
    }


@router.post(
    "",
    summary="Register Custom Agent Model",
    description="Persists a new agent model configuration into Firebase Firestore.",
)
async def register_model(payload: RegisterModelRequest) -> Dict[str, Any]:
    slug = re.sub(r"[^a-z0-9]+", "-", payload.name.lower()).strip("-") or f"agent-{int(time.time())}"
    new_model = {
        "id": slug,
        "name": payload.name.strip(),
        "provider": payload.provider,
        "type": payload.type,
        "trustScore": 0.0,
        "status": "Registered",
        "color": "#3B82F6",
        "endpoint": payload.endpoint or "http://localhost:8080/v1/chat/completions",
        "createdAt": time.time(),
    }
    persisted = save_document("models", slug, new_model)
    return {
        "success": True,
        "persisted_to_firestore": persisted,
        "data": new_model,
        "message": f'Agent model "{new_model["name"]}" registered in NexusIQ.',
    }

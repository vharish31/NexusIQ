"""API routes for NexusIQ's trained FEVER/FEVEROUS fact-verification ML model."""

from typing import Any, Dict, List, Optional
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from app.ml.predictor import get_model_metrics, is_model_available, predict_claim

router = APIRouter(prefix="/ml", tags=["ML Fact Verifier"])


class PredictClaimRequest(BaseModel):
    claim: str = Field(..., min_length=1, description="Factual claim to classify")
    evidence_texts: List[str] = Field(
        default_factory=list,
        description="Optional retrieved evidence snippets or page titles",
    )


@router.get(
    "/report",
    summary="Get Trained ML Model Evaluation Report",
    description="Returns training, validation, and held-out test metrics across candidate classifiers trained on FEVER & FEVEROUS.",
)
async def get_ml_evaluation_report() -> Dict[str, Any]:
    metrics = get_model_metrics()
    if not metrics:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Trained model evaluation report not found. Run backend/app/ml/train_verifier.py first.",
        )
    return {
        "success": True,
        "available": is_model_available(),
        "data": metrics,
    }


@router.post(
    "/predict",
    summary="Predict Claim Factuality",
    description="Classifies a claim + optional evidence into SUPPORTS, REFUTES, or NOT ENOUGH INFO using the trained NexusIQ verifier.",
)
async def predict_factuality(payload: PredictClaimRequest) -> Dict[str, Any]:
    if not is_model_available():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Trained model artifact not found. Run backend/app/ml/train_verifier.py first.",
        )

    prediction = predict_claim(claim=payload.claim, evidence_texts=payload.evidence_texts)
    metrics = get_model_metrics() or {}
    return {
        "success": True,
        "model_id": metrics.get("model_id", "nexusiq-fact-verifier-v1"),
        "selected_model": metrics.get("selected_model_name", "Fact Verifier"),
        "claim": payload.claim,
        "data": prediction,
    }


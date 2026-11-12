"""Runtime inference loader for the trained NexusIQ FEVER/FEVEROUS fact-verification model."""

import json
import logging
import time
from functools import lru_cache
from pathlib import Path
from typing import Any, Dict, List, Optional

import joblib

from app.ml.features import extract_record_fields

logger = logging.getLogger("nexusiq.ml.predictor")

ARTIFACTS_DIR = Path(__file__).resolve().parent / "artifacts"
MODEL_PATH = ARTIFACTS_DIR / "fact_verifier_pipeline.joblib"
METRICS_PATH = ARTIFACTS_DIR / "model_metrics.json"


def is_model_available() -> bool:
    """Return True if the trained model artifact exists on disk."""
    return MODEL_PATH.exists()


@lru_cache()
def _load_pipeline():
    if not MODEL_PATH.exists():
        raise FileNotFoundError(f"Trained model artifact not found at {MODEL_PATH}")
    logger.info("Loading trained fact-verification pipeline from %s...", MODEL_PATH)
    return joblib.load(MODEL_PATH)


@lru_cache()
def get_model_metrics() -> Optional[Dict[str, Any]]:
    """Load the saved evaluation metrics report if available."""
    if not METRICS_PATH.exists():
        return None
    return json.loads(METRICS_PATH.read_text(encoding="utf-8"))


def predict_batch(records: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Predict verification labels ('SUPPORTS', 'REFUTES', 'NOT ENOUGH INFO') and
    class probabilities for a batch of raw dataset records or {claim, evidence_text} dicts.
    """
    if not records:
        return []

    pipeline = _load_pipeline()
    samples = [extract_record_fields(rec) for rec in records]
    t0 = time.perf_counter()
    preds = pipeline.predict(samples)
    probs = pipeline.predict_proba(samples)
    total_ms = round((time.perf_counter() - t0) * 1000, 2)
    per_sample_ms = round(total_ms / len(samples), 3)

    classes = [str(c) for c in pipeline.classes_]
    results: List[Dict[str, Any]] = []
    for pred, prob_row in zip(preds, probs):
        prob_map = {cls_name: round(float(p), 4) for cls_name, p in zip(classes, prob_row)}
        results.append(
            {
                "label": str(pred),
                "confidence": round(float(max(prob_row)), 4),
                "probabilities": prob_map,
                "latency_ms": per_sample_ms,
            }
        )
    return results


def predict_claim(
    claim: str,
    evidence_texts: Optional[List[str]] = None,
) -> Dict[str, Any]:
    """Predict factuality status and probability breakdown for a single claim."""
    joined_evidence = " | ".join(t.strip() for t in (evidence_texts or []) if t and t.strip())
    batch = predict_batch([{"claim": claim, "evidence_text": joined_evidence}])
    return batch[0]


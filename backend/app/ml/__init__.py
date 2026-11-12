"""Machine learning fact-verification and trust classification module for NexusIQ."""

from app.ml.features import extract_record_fields, build_feature_pipeline

__all__ = [
    "extract_record_fields",
    "build_feature_pipeline",
]


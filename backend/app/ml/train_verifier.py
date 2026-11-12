"""
Train and evaluate NexusIQ fact-verification classifiers on FEVER and FEVEROUS.

Follows strict ML practices:
- Uses fixed stratified development (train) / validation / test splits.
- Fits all TF-IDF vectorizers and feature scalers strictly on training data.
- Compares a naive baseline against multiple model families & regularization strengths.
- Evaluates Macro-F1, Weighted-F1, per-class metrics, confusion matrices, slice errors,
  95% bootstrap confidence intervals, and inference latency.
"""

import json
import logging
import sys
import time
from collections import Counter
from pathlib import Path
from typing import Any, Dict, List, Tuple

import joblib
import numpy as np
from sklearn.calibration import CalibratedClassifierCV
from sklearn.dummy import DummyClassifier
from sklearn.linear_model import LogisticRegression, SGDClassifier
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
)
from sklearn.pipeline import Pipeline
from sklearn.svm import LinearSVC

# Allow running directly as a script from repo root or backend/
BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.ml.features import build_feature_pipeline, extract_record_fields

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("nexusiq.ml.train")

CLASSES = ["SUPPORTS", "REFUTES", "NOT ENOUGH INFO"]
ARTIFACTS_DIR = Path(__file__).resolve().parent / "artifacts"
MODEL_PATH = ARTIFACTS_DIR / "fact_verifier_pipeline.joblib"
METRICS_PATH = ARTIFACTS_DIR / "model_metrics.json"


def _resolve_datasets_root() -> Path:
    candidates = [
        BACKEND_DIR.parent / "datasets",
        Path.cwd() / "datasets",
    ]
    for path in candidates:
        if path.exists():
            return path
    raise FileNotFoundError("Could not locate datasets/ directory.")


def load_split_data(
    datasets_root: Path,
    split_name: str,
) -> Tuple[List[Dict[str, Any]], List[str], List[Dict[str, Any]], Dict[str, Any]]:
    """
    Load FEVER and FEVEROUS records for a specific split ('development', 'validation', or 'test').
    Metadata (dataset source, challenge category) is returned separately for slice evaluation only.
    """
    X: List[Dict[str, Any]] = []
    y: List[str] = []
    meta: List[Dict[str, Any]] = []
    audit = {
        "total_lines": 0,
        "valid_records": 0,
        "skipped_invalid": 0,
        "missing_evidence_count": 0,
        "label_counts": Counter(),
        "dataset_counts": Counter(),
    }

    for ds_name in ("FEVER", "FEVEROUS"):
        file_path = datasets_root / "benchmark_suites" / ds_name / f"{split_name}.jsonl"
        if not file_path.exists():
            raise FileNotFoundError(f"Split file not found: {file_path}")

        with file_path.open("r", encoding="utf-8") as fh:
            for line in fh:
                if not line.strip():
                    continue
                audit["total_lines"] += 1
                try:
                    rec = json.loads(line)
                except json.JSONDecodeError:
                    audit["skipped_invalid"] += 1
                    continue

                label = rec.get("label")
                claim = rec.get("claim")
                if not claim or label not in CLASSES:
                    audit["skipped_invalid"] += 1
                    continue

                features_dict = extract_record_fields(rec, dataset_source=ds_name)
                X.append(features_dict)
                y.append(label)
                meta.append(
                    {
                        "dataset": ds_name,
                        "challenge": rec.get("challenge") or ("Text" if ds_name == "FEVER" else "Other"),
                    }
                )
                audit["valid_records"] += 1
                audit["label_counts"][label] += 1
                audit["dataset_counts"][ds_name] += 1
                if features_dict["has_evidence"] == 0:
                    audit["missing_evidence_count"] += 1

    audit["label_counts"] = dict(audit["label_counts"])
    audit["dataset_counts"] = dict(audit["dataset_counts"])
    return X, y, meta, audit


def bootstrap_confidence_intervals(
    y_true: np.ndarray,
    y_pred: np.ndarray,
    n_bootstrap: int = 500,
    seed: int = 42,
) -> Dict[str, List[float]]:
    """Compute 95% bootstrap confidence intervals for Accuracy and Macro-F1."""
    rng = np.random.default_rng(seed)
    n = len(y_true)
    acc_scores = np.empty(n_bootstrap, dtype=np.float64)
    f1_scores = np.empty(n_bootstrap, dtype=np.float64)

    for b in range(n_bootstrap):
        idx = rng.integers(0, n, size=n)
        yt = y_true[idx]
        yp = y_pred[idx]
        acc_scores[b] = accuracy_score(yt, yp)
        f1_scores[b] = f1_score(yt, yp, labels=CLASSES, average="macro", zero_division=0)

    return {
        "accuracy_95ci": [
            round(float(np.percentile(acc_scores, 2.5)), 4),
            round(float(np.percentile(acc_scores, 97.5)), 4),
        ],
        "macro_f1_95ci": [
            round(float(np.percentile(f1_scores, 2.5)), 4),
            round(float(np.percentile(f1_scores, 97.5)), 4),
        ],
    }


def evaluate_predictions(y_true: List[str], y_pred: np.ndarray) -> Dict[str, Any]:
    """Compute accuracy, macro/weighted F1, and per-class classification metrics."""
    acc = accuracy_score(y_true, y_pred)
    macro_f1 = f1_score(y_true, y_pred, labels=CLASSES, average="macro", zero_division=0)
    weighted_f1 = f1_score(y_true, y_pred, labels=CLASSES, average="weighted", zero_division=0)
    report = classification_report(
        y_true, y_pred, labels=CLASSES, output_dict=True, zero_division=0
    )
    cm = confusion_matrix(y_true, y_pred, labels=CLASSES).tolist()

    return {
        "accuracy": round(float(acc), 4),
        "macro_f1": round(float(macro_f1), 4),
        "weighted_f1": round(float(weighted_f1), 4),
        "confusion_matrix_labels": CLASSES,
        "confusion_matrix": cm,
        "per_class": {
            cls: {
                "precision": round(float(report[cls]["precision"]), 4),
                "recall": round(float(report[cls]["recall"]), 4),
                "f1": round(float(report[cls]["f1-score"]), 4),
                "support": int(report[cls]["support"]),
            }
            for cls in CLASSES
        },
    }


def slice_evaluation(
    y_true: List[str],
    y_pred: np.ndarray,
    meta: List[Dict[str, Any]],
) -> Dict[str, Any]:
    """Perform slice-based error analysis by dataset source and FEVEROUS challenge."""
    slices: Dict[str, Any] = {"by_dataset": {}, "by_challenge": {}}
    y_true_arr = np.array(y_true)

    for ds in ("FEVER", "FEVEROUS"):
        mask = np.array([m["dataset"] == ds for m in meta])
        if mask.any():
            yt = y_true_arr[mask]
            yp = y_pred[mask]
            slices["by_dataset"][ds] = {
                "samples": int(mask.sum()),
                "accuracy": round(float(accuracy_score(yt, yp)), 4),
                "macro_f1": round(float(f1_score(yt, yp, labels=CLASSES, average="macro", zero_division=0)), 4),
            }

    challenge_names = sorted({m["challenge"] for m in meta if m["dataset"] == "FEVEROUS"})
    for ch in challenge_names:
        mask = np.array([m["dataset"] == "FEVEROUS" and m["challenge"] == ch for m in meta])
        if mask.sum() >= 20:
            yt = y_true_arr[mask]
            yp = y_pred[mask]
            slices["by_challenge"][ch] = {
                "samples": int(mask.sum()),
                "accuracy": round(float(accuracy_score(yt, yp)), 4),
                "macro_f1": round(float(f1_score(yt, yp, labels=CLASSES, average="macro", zero_division=0)), 4),
            }

    return slices


def train_and_evaluate() -> Dict[str, Any]:
    """Execute full ML training, validation comparison, test evaluation, and artifact export."""
    overall_start = time.perf_counter()
    datasets_root = _resolve_datasets_root()

    logger.info("Loading datasets from %s...", datasets_root)
    X_train, y_train, _, train_audit = load_split_data(datasets_root, "development")
    X_val, y_val, _, val_audit = load_split_data(datasets_root, "validation")
    X_test, y_test, test_meta, test_audit = load_split_data(datasets_root, "test")

    logger.info(
        "Loaded splits -> train: %d, validation: %d, test: %d",
        len(X_train),
        len(X_val),
        len(X_test),
    )

    # STRICT FEATURIZATION ORDERING: fit ONLY on training split
    logger.info("Fitting TF-IDF & numeric feature pipeline strictly on training split...")
    feat_t0 = time.perf_counter()
    feature_pipeline = build_feature_pipeline()
    X_train_vec = feature_pipeline.fit_transform(X_train, y_train)
    X_val_vec = feature_pipeline.transform(X_val)
    X_test_vec = feature_pipeline.transform(X_test)
    featurization_sec = round(time.perf_counter() - feat_t0, 2)
    logger.info(
        "Feature matrix shape -> train: %s, val: %s, test: %s (%.2fs)",
        X_train_vec.shape,
        X_val_vec.shape,
        X_test_vec.shape,
        featurization_sec,
    )

    # Compare multiple candidate model families & regularization strengths
    candidates = [
        (
            "majority_baseline",
            "Dummy Majority Baseline",
            DummyClassifier(strategy="most_frequent"),
        ),
        (
            "sgd_log_loss",
            "SGD Classifier (Log-Loss, alpha=1e-5)",
            SGDClassifier(
                loss="log_loss",
                alpha=1e-5,
                max_iter=50,
                tol=1e-3,
                random_state=42,
            ),
        ),
        (
            "logreg_c05",
            "Logistic Regression (C=0.5, L2 Regularized)",
            LogisticRegression(
                C=0.5,
                max_iter=500,
                solver="lbfgs",
                random_state=42,
            ),
        ),
        (
            "logreg_c10",
            "Logistic Regression (C=1.0, L2 Regularized)",
            LogisticRegression(
                C=1.0,
                max_iter=500,
                solver="lbfgs",
                random_state=42,
            ),
        ),
        (
            "calibrated_linear_svc",
            "Calibrated LinearSVC (C=0.5)",
            CalibratedClassifierCV(
                estimator=LinearSVC(C=0.5, random_state=42),
                cv=3,
                method="sigmoid",
            ),
        ),
    ]

    model_comparisons: List[Dict[str, Any]] = []
    best_model_entry: Dict[str, Any] = {}
    best_val_f1 = -1.0
    best_clf = None

    for model_key, display_name, clf in candidates:
        t_fit = time.perf_counter()
        logger.info("Training candidate: %s...", display_name)
        clf.fit(X_train_vec, y_train)
        train_time = round(time.perf_counter() - t_fit, 2)

        t_inf = time.perf_counter()
        val_pred = clf.predict(X_val_vec)
        val_inf_ms = round((time.perf_counter() - t_inf) * 1000, 2)

        train_pred = clf.predict(X_train_vec)
        train_acc = round(float(accuracy_score(y_train, train_pred)), 4)
        val_metrics = evaluate_predictions(y_val, val_pred)

        overfit_gap = round(train_acc - val_metrics["accuracy"], 4)
        entry = {
            "model_key": model_key,
            "name": display_name,
            "train_time_seconds": train_time,
            "val_inference_ms_total": val_inf_ms,
            "val_latency_ms_per_sample": round(val_inf_ms / len(X_val), 4),
            "train_accuracy": train_acc,
            "overfit_gap": overfit_gap,
            "validation_metrics": val_metrics,
        }
        model_comparisons.append(entry)
        logger.info(
            "  %s -> Train Acc: %.4f | Val Acc: %.4f | Val Macro-F1: %.4f | Gap: %.4f (%.2fs)",
            display_name,
            train_acc,
            val_metrics["accuracy"],
            val_metrics["macro_f1"],
            overfit_gap,
            train_time,
        )

        # Select winning model strictly on Validation Macro-F1
        if val_metrics["macro_f1"] > best_val_f1:
            best_val_f1 = val_metrics["macro_f1"]
            best_model_entry = entry
            best_clf = clf

    # Final evaluation ONCE on held-out Test split
    logger.info(
        "Evaluating selected model '%s' on held-out test split (%d samples)...",
        best_model_entry["name"],
        len(X_test),
    )
    t_test = time.perf_counter()
    test_pred = best_clf.predict(X_test_vec)
    test_inf_ms = round((time.perf_counter() - t_test) * 1000, 2)
    test_metrics = evaluate_predictions(y_test, test_pred)
    test_ci = bootstrap_confidence_intervals(np.array(y_test), np.array(test_pred), n_bootstrap=400)
    test_slices = slice_evaluation(y_test, np.array(test_pred), test_meta)

    # Package full end-to-end Pipeline (feature_pipeline + winning classifier)
    full_pipeline = Pipeline(
        steps=[
            ("features", feature_pipeline),
            ("classifier", best_clf),
        ]
    )

    ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)
    joblib.dump(full_pipeline, MODEL_PATH, compress=3)
    model_size_mb = round(MODEL_PATH.stat().st_size / (1024 * 1024), 2)

    # Measure end-to-end raw text inference latency on 50 sample records
    t_e2e = time.perf_counter()
    _ = full_pipeline.predict_proba(X_test[:50])
    e2e_ms_per_sample = round(((time.perf_counter() - t_e2e) * 1000) / 50.0, 3)

    report = {
        "model_id": "nexusiq-fact-verifier-v1",
        "selected_model_key": best_model_entry["model_key"],
        "selected_model_name": best_model_entry["name"],
        "trained_at": time.strftime("%Y-%m-%d %H:%M:%S UTC", time.gmtime()),
        "total_pipeline_seconds": round(time.perf_counter() - overall_start, 2),
        "featurization_seconds": featurization_sec,
        "feature_dimensions": int(X_train_vec.shape[1]),
        "artifact_path": str(MODEL_PATH),
        "artifact_size_mb": model_size_mb,
        "e2e_inference_ms_per_claim": e2e_ms_per_sample,
        "classes": CLASSES,
        "dataset_audit": {
            "development": train_audit,
            "validation": val_audit,
            "test": test_audit,
        },
        "candidate_comparison": model_comparisons,
        "test_evaluation": {
            **test_metrics,
            "inference_ms_total": test_inf_ms,
            "confidence_intervals_95": test_ci,
            "slices": test_slices,
        },
    }

    METRICS_PATH.write_text(json.dumps(report, indent=2), encoding="utf-8")
    logger.info("Saved trained pipeline to %s (%.2f MB)", MODEL_PATH, model_size_mb)
    logger.info("Saved evaluation report to %s", METRICS_PATH)
    logger.info(
        "FINAL HELD-OUT TEST -> Accuracy: %.4f (95%% CI %s) | Macro-F1: %.4f (95%% CI %s)",
        test_metrics["accuracy"],
        test_ci["accuracy_95ci"],
        test_metrics["macro_f1"],
        test_ci["macro_f1_95ci"],
    )
    return report


if __name__ == "__main__":
    train_and_evaluate()


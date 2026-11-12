"""Dataset loader for NexusIQ FEVER and FEVEROUS benchmark suites."""

import json
import logging
import random
from functools import lru_cache
from pathlib import Path
from typing import Any, Dict, List, Optional

logger = logging.getLogger("nexusiq.services.dataset_loader")


def _get_datasets_root() -> Path:
    """Resolve datasets inside the backend deployment directory."""
    backend_root = Path(__file__).resolve().parents[2]
    return backend_root / "datasets"


DATASETS_ROOT = _get_datasets_root()


@lru_cache()
def load_manifests() -> Dict[str, Any]:
    """Load dataset and version manifests from datasets/manifests/."""
    datasets_path = DATASETS_ROOT / "manifests" / "datasets.json"
    versions_path = DATASETS_ROOT / "manifests" / "dataset_versions.json"

    if not datasets_path.exists():
        logger.warning("Dataset manifest not found at %s", datasets_path)
        return {"datasets": [], "versions": {}}

    datasets_data = json.loads(datasets_path.read_text(encoding="utf-8"))
    versions_data = (
        json.loads(versions_path.read_text(encoding="utf-8"))
        if versions_path.exists()
        else {}
    )
    return {
        "datasets": datasets_data.get("datasets", []),
        "versions": versions_data.get("datasets", {}),
        "manifest_version": versions_data.get("manifest_version", "1.0"),
        "created_date": versions_data.get("created_date"),
    }


def get_dataset_catalog() -> List[Dict[str, Any]]:
    """Return enriched dataset metadata merging datasets.json and dataset_versions.json."""
    manifests = load_manifests()
    versions = manifests.get("versions", {})
    catalog: List[Dict[str, Any]] = []

    for ds in manifests.get("datasets", []):
        ds_id = ds["dataset_id"]
        ver = versions.get(ds_id, {})
        catalog.append(
            {
                **ds,
                "split_counts": {
                    "development": ver.get("development_records", 0),
                    "validation": ver.get("validation_records", 0),
                    "test": ver.get("test_records", 0),
                },
                "random_seed": ver.get("random_seed", 42),
                "split_strategy": ver.get("split_strategy", "stratified_80_10_10"),
            }
        )
    return catalog


def get_benchmark_suites() -> List[Dict[str, Any]]:
    """
    Build standardized benchmark suite descriptors backed by FEVER & FEVEROUS splits.
    """
    catalog = get_dataset_catalog()
    suites: List[Dict[str, Any]] = []

    descriptions = {
        ("FEVER", "validation"): (
            "Faithfulness & Trust",
            "Text-based factual claim verification (SUPPORTS / REFUTES / NOT ENOUGH INFO) sampled from the stratified FEVER validation split.",
            "Low",
        ),
        ("FEVER", "test"): (
            "Context Grounding",
            "Held-out FEVER test vectors evaluating hallucination defense and evidence citation accuracy against Wikipedia claims.",
            "Verified",
        ),
        ("FEVEROUS", "validation"): (
            "Multi-hop Reasoning",
            "Structured table + unstructured text verification evaluating numerical, multi-hop, and entity disambiguation claims.",
            "Medium",
        ),
        ("FEVEROUS", "test"): (
            "Structured & Text Audit",
            "Held-out FEVEROUS test vectors measuring agent reliability across hybrid Wikipedia tables and prose.",
            "Verified",
        ),
    }

    for ds in catalog:
        ds_id = ds["dataset_id"]
        splits = ds.get("split_counts", {})
        for split_name in ("validation", "test"):
            count = splits.get(split_name, 0)
            category, desc, risk = descriptions.get(
                (ds_id, split_name),
                ("Fact Verification", ds.get("purpose", "Fact verification benchmark"), "Low"),
            )
            suites.append(
                {
                    "id": f"{ds_id.lower()}-{split_name}",
                    "name": f"{ds_id} {split_name.title()} Suite",
                    "datasetId": ds_id,
                    "split": split_name,
                    "category": category,
                    "testCasesCount": count,
                    "description": desc,
                    "lastRunDate": "Not yet run",
                    "passRate": 0.0,
                    "avgLatency": "—",
                    "riskLevel": risk,
                    "labels": ds.get("labels", []),
                    "evidenceType": ds.get("evidence_type", []),
                }
            )

    return suites


def resolve_suite_target(suite_id: str) -> Optional[Dict[str, str]]:
    """Map a suite_id (e.g. 'fever-validation' or 'FEVER') to (dataset_id, split)."""
    normalized = (suite_id or "").strip().lower()
    if normalized in ("fever", "fever-validation", "suite-hallucination"):
        return {"dataset_id": "FEVER", "split": "validation"}
    if normalized == "fever-test":
        return {"dataset_id": "FEVER", "split": "test"}
    if normalized == "fever-development":
        return {"dataset_id": "FEVER", "split": "development"}
    if normalized in ("feverous", "feverous-validation", "suite-reasoning"):
        return {"dataset_id": "FEVEROUS", "split": "validation"}
    if normalized == "feverous-test":
        return {"dataset_id": "FEVEROUS", "split": "test"}
    if normalized == "feverous-development":
        return {"dataset_id": "FEVEROUS", "split": "development"}

    # Fallback: default to FEVER validation for any other UI suite alias so benchmarks always use real data
    return {"dataset_id": "FEVER", "split": "validation"}


def sample_records(
    dataset_id: str,
    split: str = "validation",
    sample_size: int = 20,
    seed: int = 42,
) -> List[Dict[str, Any]]:
    """
    Stream and reservoir-sample records from a local JSONL benchmark split.
    Avoids loading huge JSONL files into memory.
    """
    ds_upper = dataset_id.upper()
    file_path = DATASETS_ROOT / "benchmark_suites" / ds_upper / f"{split}.jsonl"
    if not file_path.exists():
        logger.warning("Benchmark split file not found: %s", file_path)
        return []

    k = max(1, min(int(sample_size), 500))
    rng = random.Random(seed)
    reservoir: List[str] = []

    with file_path.open("r", encoding="utf-8") as fh:
        for idx, line in enumerate(fh):
            if not line.strip():
                continue
            if idx < k:
                reservoir.append(line)
            else:
                j = rng.randint(0, idx)
                if j < k:
                    reservoir[j] = line

    return [json.loads(raw_line) for raw_line in reservoir]


def extract_evidence_snippets(record: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Normalize evidence entries from FEVER or FEVEROUS records into TrustEngine format.
    """
    raw_ev = record.get("evidence", [])
    normalized: List[Dict[str, Any]] = []

    if not isinstance(raw_ev, list):
        return normalized

    for item in raw_ev:
        # FEVEROUS format: {"content": [...], "context": {key: [...]}}
        if isinstance(item, dict):
            context = item.get("context", {})
            snippets: List[str] = []
            if isinstance(context, dict):
                for vals in context.values():
                    if isinstance(vals, list):
                        snippets.extend(str(v) for v in vals if v)
            content_text = " ".join(snippets) or " ".join(str(c) for c in item.get("content", []))
            if content_text.strip():
                normalized.append(
                    {
                        "url": f"https://en.wikipedia.org/wiki/{record.get('id', 'feverous')}",
                        "title": f"FEVEROUS Evidence ({record.get('challenge', 'Structured')})",
                        "content": content_text,
                    }
                )
        # FEVER format: [[ann_id, ev_id, page_title, sent_idx], ...]
        elif isinstance(item, list):
            for entry in item:
                if isinstance(entry, list) and len(entry) >= 3 and entry[2]:
                    page_title = str(entry[2]).replace("_", " ").replace("-LRB-", "(").replace("-RRB-", ")")
                    normalized.append(
                        {
                            "url": f"https://en.wikipedia.org/wiki/{entry[2]}",
                            "title": page_title,
                            "content": f"{page_title} {record.get('claim', '')}",
                        }
                    )

    return normalized

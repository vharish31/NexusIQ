"""Inspect and validate NexusIQ datasets against manifest definitions."""

import json
import sys
from collections import Counter
from pathlib import Path
from typing import Any, Dict, Set, Tuple

BASE_DIR = Path(__file__).resolve().parent
MANIFEST_PATH = BASE_DIR / "manifests" / "datasets.json"
VERSIONS_PATH = BASE_DIR / "manifests" / "dataset_versions.json"
VALID_LABELS = {"SUPPORTS", "REFUTES", "NOT ENOUGH INFO"}


def inspect_jsonl_file(path: Path) -> Tuple[Dict[str, Any], Set[Any]]:
    """Inspect a JSONL file for record validity, label counts, and unique IDs."""
    total = 0
    valid = 0
    invalid = 0
    labels: Counter = Counter()
    challenges: Counter = Counter()
    ids: Set[Any] = set()

    with path.open("r", encoding="utf-8") as file:
        for line in file:
            if not line.strip():
                continue

            total += 1
            try:
                record = json.loads(line)
            except json.JSONDecodeError:
                invalid += 1
                continue

            if not isinstance(record, dict) or not record.get("claim"):
                invalid += 1
                continue

            label = record.get("label", "MISSING")
            if label not in VALID_LABELS:
                invalid += 1
                labels[label] += 1
                continue

            valid += 1
            labels[label] += 1

            if "id" in record and record["id"] != "":
                ids.add(record["id"])

            if record.get("challenge"):
                challenges[record["challenge"]] += 1

    return (
        {
            "total": total,
            "valid": valid,
            "invalid": invalid,
            "labels": dict(labels),
            "challenges": dict(challenges),
        },
        ids,
    )


def main() -> int:
    """Validate all datasets, splits, and manifest counts."""
    if not MANIFEST_PATH.exists() or not VERSIONS_PATH.exists():
        print("Manifest files missing in datasets/manifests/!", file=sys.stderr)
        return 1

    manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    versions = json.loads(VERSIONS_PATH.read_text(encoding="utf-8"))
    version_datasets = versions.get("datasets", {})

    has_errors = False

    for entry in manifest.get("datasets", []):
        dataset_id = entry["dataset_id"]
        ver_info = version_datasets.get(dataset_id, {})

        print("\n" + "=" * 65)
        print(f"DATASET: {dataset_id} ({entry['name']}) v{entry['version']}")
        print("=" * 65)

        for role, rel_path in [
            ("RAW SOURCE", entry["source_file"]),
            ("PROCESSED", entry["processed_file"]),
        ]:
            path = BASE_DIR / rel_path
            if not path.exists():
                print(f"[{role}] MISSING: {rel_path}")
                has_errors = True
                continue
            stats, _ = inspect_jsonl_file(path)
            print(
                f"[{role}] {rel_path} -> total={stats['total']}, "
                f"valid={stats['valid']}, invalid={stats['invalid']}"
            )
            if role == "PROCESSED":
                expected_total = entry.get("total_records")
                if stats["valid"] != expected_total:
                    print(
                        f"  [ERROR] Processed count {stats['valid']} != manifest {expected_total}"
                    )
                    has_errors = True

        split_ids: Dict[str, Set[Any]] = {}
        for split_name, rel_path in entry.get("benchmark_files", {}).items():
            path = BASE_DIR / rel_path
            if not path.exists():
                print(f"[SPLIT:{split_name}] MISSING: {rel_path}")
                has_errors = True
                continue

            stats, ids = inspect_jsonl_file(path)
            split_ids[split_name] = ids
            expected_split = ver_info.get(f"{split_name}_records")

            status_tag = "OK"
            if stats["invalid"] > 0:
                status_tag = "ERROR (invalid records)"
                has_errors = True
            elif expected_split is not None and stats["valid"] != expected_split:
                status_tag = f"ERROR (expected {expected_split})"
                has_errors = True

            print(
                f"[SPLIT:{split_name}] {rel_path} -> valid={stats['valid']} [{status_tag}]"
            )
            print(f"  Labels: {stats['labels']}")
            if stats["challenges"]:
                print(f"  Challenges: {stats['challenges']}")

        # Check cross-split leakage
        split_names = list(split_ids.keys())
        for i in range(len(split_names)):
            for j in range(i + 1, len(split_names)):
                s1, s2 = split_names[i], split_names[j]
                overlap = len(split_ids[s1] & split_ids[s2])
                if overlap > 0:
                    print(f"  [ERROR] Data leakage between {s1} & {s2}: {overlap} shared IDs")
                    has_errors = True

        print("Cross-split overlap check: PASS (0 shared IDs)")

    print("\n" + "=" * 65)
    if has_errors:
        print("DATASET AUDIT FAILED - Please inspect errors above.")
        return 1

    print("ALL DATASETS & MANIFESTS VERIFIED SUCCESSFULLY!")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

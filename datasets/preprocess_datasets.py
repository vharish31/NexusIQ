"""Preprocess raw FEVER and FEVEROUS datasets into validated JSONL files."""

import json
from collections import Counter
from pathlib import Path
from typing import Dict

BASE_DIR = Path(__file__).resolve().parent
VALID_LABELS = {"SUPPORTS", "REFUTES", "NOT ENOUGH INFO"}

DATASETS: Dict[str, Dict[str, Path]] = {
    "FEVER": {
        "input": BASE_DIR / "raw" / "FEVER" / "train.jsonl",
        "output": BASE_DIR / "processed" / "FEVER" / "train.jsonl",
    },
    "FEVEROUS": {
        "input": BASE_DIR / "raw" / "FEVEROUS" / "feverous_train_challenges.jsonl",
        "output": BASE_DIR / "processed" / "FEVEROUS" / "train.jsonl",
    },
}


def preprocess_dataset(name: str, input_path: Path, output_path: Path) -> Dict[str, object]:
    """Validate records from a raw JSONL dataset and write valid rows to output_path."""
    if not input_path.exists():
        raise FileNotFoundError(f"Raw dataset file not found for {name}: {input_path}")

    output_path.parent.mkdir(parents=True, exist_ok=True)

    total = 0
    valid = 0
    skipped = 0
    labels: Counter = Counter()

    with input_path.open("r", encoding="utf-8") as source, \
         output_path.open("w", encoding="utf-8") as target:

        for line in source:
            if not line.strip():
                continue

            total += 1

            try:
                record = json.loads(line)
            except (json.JSONDecodeError, TypeError):
                skipped += 1
                continue

            if not isinstance(record, dict):
                skipped += 1
                continue

            if not record.get("claim") or record.get("label") not in VALID_LABELS:
                skipped += 1
                continue

            # Preserve the original record and evidence structure.
            target.write(json.dumps(record, ensure_ascii=False) + "\n")
            valid += 1
            labels[record["label"]] += 1

    return {
        "name": name,
        "total": total,
        "valid": valid,
        "skipped": skipped,
        "labels": dict(labels),
        "output": str(output_path),
    }


def main() -> None:
    """Run preprocessing for all configured datasets."""
    for name, paths in DATASETS.items():
        print(f"\nProcessing {name}...")
        summary = preprocess_dataset(name, paths["input"], paths["output"])
        print("Total:", summary["total"])
        print("Valid:", summary["valid"])
        print("Skipped:", summary["skipped"])
        print("Labels:", summary["labels"])
        print("Saved:", summary["output"])

    print("\nDataset preprocessing completed!")


if __name__ == "__main__":
    main()

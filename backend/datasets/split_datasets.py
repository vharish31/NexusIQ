"""Create deterministic 80/10/10 stratified benchmark splits for FEVER and FEVEROUS."""

import json
import random
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any, Dict, List

BASE_DIR = Path(__file__).resolve().parent
SEED = 42
DATASETS = ["FEVER", "FEVEROUS"]


def split_dataset(dataset: str, seed: int = SEED) -> Dict[str, int]:
    """Read processed dataset and write stratified development/validation/test splits."""
    source = BASE_DIR / "processed" / dataset / "train.jsonl"
    if not source.exists():
        raise FileNotFoundError(f"Processed dataset file not found for {dataset}: {source}")

    output_dir = BASE_DIR / "benchmark_suites" / dataset
    output_dir.mkdir(parents=True, exist_ok=True)

    records: List[Dict[str, Any]] = []
    with source.open("r", encoding="utf-8") as file:
        for line in file:
            if line.strip():
                records.append(json.loads(line))

    # Group by label to preserve label proportions across splits.
    groups: Dict[str, List[Dict[str, Any]]] = defaultdict(list)
    for record in records:
        groups[record["label"]].append(record)

    development: List[Dict[str, Any]] = []
    validation: List[Dict[str, Any]] = []
    test: List[Dict[str, Any]] = []

    rng = random.Random(seed)

    for _, items in groups.items():
        rng.shuffle(items)

        n = len(items)
        test_count = round(n * 0.10)
        validation_count = round(n * 0.10)

        test.extend(items[:test_count])
        validation.extend(items[test_count:test_count + validation_count])
        development.extend(items[test_count + validation_count:])

    # Shuffle final partitions deterministically.
    rng.shuffle(development)
    rng.shuffle(validation)
    rng.shuffle(test)

    partitions = {
        "development.jsonl": development,
        "validation.jsonl": validation,
        "test.jsonl": test,
    }

    print(f"\n{dataset}")
    print("-" * 40)

    counts: Dict[str, int] = {}
    for filename, items in partitions.items():
        path = output_dir / filename
        with path.open("w", encoding="utf-8") as file:
            for record in items:
                file.write(json.dumps(record, ensure_ascii=False) + "\n")

        counts[filename] = len(items)
        print(f"{filename}: {len(items)} records")
        print("Labels:", dict(Counter(r["label"] for r in items)))

    print("Total:", len(records))
    return counts


def main() -> None:
    """Generate benchmark splits for all configured datasets."""
    for dataset in DATASETS:
        split_dataset(dataset, seed=SEED)

    print("\nAll dataset splits created successfully!")


if __name__ == "__main__":
    main()

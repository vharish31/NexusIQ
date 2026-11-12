# NexusIQ Benchmark Datasets

Structured factual verification datasets used by **NexusIQ** to benchmark AI agent reliability, groundedness, and hallucination rates.

## Directory Structure

```text
datasets/
├── raw/                         # Unmodified upstream source files (.jsonl)
│   ├── FEVER/
│   │   └── train.jsonl
│   └── FEVEROUS/
│       └── feverous_train_challenges.jsonl
├── processed/                   # Validated & cleaned records preserving evidence schemas
│   ├── FEVER/
│   │   └── train.jsonl
│   └── FEVEROUS/
│       └── train.jsonl
├── benchmark_suites/            # Stratified 80/10/10 evaluation splits (seed=42)
│   ├── FEVER/
│   │   ├── development.jsonl    # 116,357 records (80%)
│   │   ├── validation.jsonl     #  14,546 records (10%)
│   │   └── test.jsonl           #  14,546 records (10%)
│   └── FEVEROUS/
│       ├── development.jsonl    #  57,031 records (80%)
│       ├── validation.jsonl     #   7,130 records (10%)
│       └── test.jsonl           #   7,130 records (10%)
├── manifests/                   # Machine-readable catalog & version tracking
│   ├── datasets.json
│   └── dataset_versions.json
├── preprocess_datasets.py       # Cleans raw files into processed/
├── split_datasets.py            # Generates stratified splits in benchmark_suites/
├── inspect_datasets.py          # Validates counts, schemas, and zero cross-split leakage
├── .gitignore                   # Excludes large .jsonl payloads from Git
└── README.md
```

## Datasets Summary

| Dataset | Full Name | Valid Records | Evidence Types | Labels | License |
| :--- | :--- | :---: | :--- | :--- | :--- |
| **FEVER** | Fact Extraction and VERification | `145,449` | Text | `SUPPORTS`, `REFUTES`, `NOT ENOUGH INFO` | CC-BY-SA-3.0 |
| **FEVEROUS** | Fact Extraction and VERification Over Unstructured and Structured information | `71,291` | Text, Tables | `SUPPORTS`, `REFUTES`, `NOT ENOUGH INFO` | CC-BY-SA-3.0 |

## Usage

Run commands from the repository root (`d:\NexusIQ`) using the backend virtual environment:

1. **Validate & Inspect All Datasets and Manifests**:
   ```powershell
   .\backend\venv\Scripts\python.exe datasets\inspect_datasets.py
   ```
2. **Re-run Preprocessing** *(raw -> processed)*:
   ```powershell
   .\backend\venv\Scripts\python.exe datasets\preprocess_datasets.py
   ```
3. **Regenerate Benchmark Splits** *(processed -> benchmark_suites, seed=42)*:
   ```powershell
   .\backend\venv\Scripts\python.exe datasets\split_datasets.py
   ```


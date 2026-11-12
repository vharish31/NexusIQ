
"""Download NexusIQ benchmark datasets from GitHub Releases."""

import urllib.request
from pathlib import Path

BASE_URL = (
    "https://github.com/vharish31/NexusIQ/"
    "releases/download/datasets-v1/"
)

BACKEND_DIR = Path(__file__).resolve().parent
DATASETS_DIR = BACKEND_DIR / "datasets" / "benchmark_suites"

FILES = {
    "FEVER": [
        "FEVER-development.jsonl",
        "FEVER-validation.jsonl",
        "FEVER-test.jsonl",
    ],
    "FEVEROUS": [
        "FEVEROUS-development.jsonl",
        "FEVEROUS-validation.jsonl",
        "FEVEROUS-test.jsonl",
    ],
}


def download_file(asset_name, dataset_name):
    destination_dir = DATASETS_DIR / dataset_name
    destination_dir.mkdir(parents=True, exist_ok=True)

    # Remove dataset prefix from the downloaded filename.
    output_name = asset_name.replace(dataset_name + "-", "")
    destination = destination_dir / output_name

    if destination.exists() and destination.stat().st_size > 0:
        print(f"Already exists: {destination}")
        return

    url = BASE_URL + asset_name
    temporary_file = destination.with_suffix(".jsonl.tmp")

    print(f"Downloading {asset_name}...")

    request = urllib.request.Request(
        url,
        headers={"User-Agent": "NexusIQ-Dataset-Downloader"},
    )

    try:
        with urllib.request.urlopen(request, timeout=600) as response:
            with temporary_file.open("wb") as output:
                while True:
                    chunk = response.read(1024 * 1024)
                    if not chunk:
                        break
                    output.write(chunk)

        if temporary_file.stat().st_size == 0:
            raise RuntimeError(f"Downloaded file is empty: {asset_name}")

        temporary_file.replace(destination)
        print(f"Downloaded successfully: {destination}")

    except Exception:
        temporary_file.unlink(missing_ok=True)
        raise


def main():
    for dataset_name, assets in FILES.items():
        for asset in assets:
            download_file(asset, dataset_name)

    print("\nAll NexusIQ benchmark datasets are ready.")


if __name__ == "__main__":
    main()

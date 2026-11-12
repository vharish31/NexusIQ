"""API routes for benchmark dataset catalog, Firestore manifest sync, and sampling."""

import time
from typing import Any, Dict
from fastapi import APIRouter, HTTPException, Query, status
from app.services.dataset_loader import get_dataset_catalog, sample_records
from app.services.firestore_store import list_documents, save_document

router = APIRouter(prefix="/datasets", tags=["Datasets"])


@router.get(
    "",
    summary="List Registered Benchmark Datasets",
    description="Returns dataset metadata from Firestore synced with local FEVER/FEVEROUS manifests.",
)
async def list_datasets() -> Dict[str, Any]:
    catalog = get_dataset_catalog()
    docs, source = list_documents("datasets", limit=50)

    if not docs and catalog:
        # Sync lightweight metadata docs (2 documents) into Firestore automatically
        persisted_any = False
        for ds in catalog:
            ds_doc = {**ds, "synced_at": time.time()}
            if save_document("datasets", ds["dataset_id"], ds_doc):
                persisted_any = True
            docs.append(ds_doc)
        source = "firestore" if persisted_any else "local_manifest"

    return {
        "success": True,
        "source": source,
        "count": len(docs),
        "data": docs,
    }


@router.post(
    "/sync",
    summary="Sync Dataset Manifests to Firestore",
    description="Registers local dataset manifests and split counts into the Firestore datasets collection.",
)
async def sync_datasets_to_firestore() -> Dict[str, Any]:
    catalog = get_dataset_catalog()
    synced = []
    persisted_count = 0

    for ds in catalog:
        ds_doc = {**ds, "synced_at": time.time()}
        if save_document("datasets", ds["dataset_id"], ds_doc):
            persisted_count += 1
        synced.append(ds_doc)

    return {
        "success": True,
        "synced_count": len(synced),
        "persisted_to_firestore": persisted_count == len(synced),
        "data": synced,
    }


@router.get(
    "/{dataset_id}/samples",
    summary="Sample Benchmark Records",
    description="Streams and returns sample claims from a local FEVER or FEVEROUS split without loading the entire file.",
)
async def get_dataset_samples(
    dataset_id: str,
    split: str = Query(default="validation", pattern="^(development|validation|test)$"),
    limit: int = Query(default=10, ge=1, le=50),
    seed: int = Query(default=42),
) -> Dict[str, Any]:
    records = sample_records(dataset_id=dataset_id, split=split, sample_size=limit, seed=seed)
    if not records:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No records found for dataset '{dataset_id}' split '{split}'.",
        )
    return {
        "success": True,
        "dataset_id": dataset_id.upper(),
        "split": split,
        "count": len(records),
        "data": records,
    }


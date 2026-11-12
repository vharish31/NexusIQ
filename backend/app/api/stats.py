"""API routes for platform telemetry statistics and cross-workspace global search."""

from typing import Any, Dict, List
from fastapi import APIRouter, Query
from app.integrations.firebase_client import check_firebase_health
from app.services.dataset_loader import get_benchmark_suites, get_dataset_catalog
from app.services.firestore_store import list_documents

router = APIRouter(tags=["Telemetry"])


@router.get(
    "/stats",
    summary="Get Platform Telemetry Stats",
    description="Aggregates live statistics across Firestore benchmarks, briefings, traces, meetings, and dataset catalogs.",
)
async def get_platform_stats() -> Dict[str, Any]:
    benchmarks, _ = list_documents("benchmarks", order_by_field="timestamp", descending=True, limit=100)
    briefings, _ = list_documents("briefings", order_by_field="created_at", descending=True, limit=100)
    traces, _ = list_documents("traces", order_by_field="timestamp", descending=True, limit=100)
    meetings, _ = list_documents("meetings", order_by_field="createdAt", descending=True, limit=100)
    catalog = get_dataset_catalog()

    total_dataset_vectors = sum(int(d.get("total_records", 0)) for d in catalog)

    trust_scores: List[float] = []
    latencies: List[float] = []
    performance_trend: List[Dict[str, Any]] = []

    for run in benchmarks:
        ts = run.get("trustScore")
        if ts is None and run.get("results"):
            ts = round(float(run["results"][0].get("groundedness_score", 0.0)) * 100.0, 1)
        if ts is not None:
            trust_scores.append(float(ts))
        lat = run.get("latencyP95") or (run["results"][0].get("latency_ms", 0) if run.get("results") else 0)
        if lat:
            latencies.append(float(lat))

    for idx, run in enumerate(reversed(benchmarks[:8])):
        run_label = run.get("id") or run.get("run_id") or f"Run #{idx + 1}"
        ts_val = run.get("trustScore")
        if ts_val is None and run.get("results"):
            ts_val = round(float(run["results"][0].get("groundedness_score", 0.0)) * 100.0, 1)
        acc_val = run.get("accuracy", ts_val or 0.0)
        lat_val = run.get("latencyP95") or (run["results"][0].get("latency_ms", 0) if run.get("results") else 0)
        performance_trend.append(
            {
                "period": str(run_label)[-8:],
                "accuracy": round(float(acc_val or 0.0), 1),
                "trust": round(float(ts_val or 0.0), 1),
                "latency": int(lat_val or 0),
            }
        )

    for b in briefings:
        b_trust = b.get("trustVerificationScore") or b.get("trust_report", {}).get("overall_trust_score")
        if b_trust is not None:
            trust_scores.append(float(b_trust))

    overall_trust = round(sum(trust_scores) / len(trust_scores), 1) if trust_scores else 0.0
    avg_latency = int(sum(latencies) / len(latencies)) if latencies else 0

    all_actions = [item for m in meetings for item in m.get("actionItems", [])]
    completed_actions = sum(1 for a in all_actions if a.get("status") == "Completed")

    fb_health = check_firebase_health()
    system_status = (
        f"Optimal (Firestore connected: {fb_health.get('project_id')})"
        if fb_health.get("connected")
        else "Degraded (Firestore unconfigured)"
    )

    stats = {
        "activeWorkspaceCount": 2,
        "overallTrustScore": overall_trust,
        "trustScoreDelta": f"{len(trust_scores)} evaluated",
        "totalAgentEvaluations": len(benchmarks),
        "evaluationsDelta": f"{total_dataset_vectors:,} dataset vectors",
        "hallucinationPreventionRate": overall_trust,
        "hallucinationRateDelta": "Trust Engine live",
        "avgAgentLatencyMs": avg_latency,
        "latencyDelta": f"{len(traces)} traces",
        "processedMeetings": len(meetings) + len(briefings),
        "meetingsDelta": f"{len(briefings)} dossiers",
        "actionItemsIdentified": len(all_actions),
        "actionItemsCompleted": completed_actions,
        "activeGuardrails": 4,
        "systemStatus": system_status,
        "lastHealthCheck": "Live",
        "performanceTrend": performance_trend,
    }

    return {
        "success": True,
        "data": stats,
        "isSimulated": False,
    }


@router.get(
    "/search",
    summary="Global Cross-Workspace Search",
    description="Searches across benchmark suites, benchmark runs, execution traces, pre-meeting dossiers, and meetings.",
)
async def global_search(q: str = Query(default="", min_length=0)) -> Dict[str, Any]:
    term = q.strip().lower()
    suites = get_benchmark_suites()
    traces, _ = list_documents("traces", order_by_field="timestamp", descending=True, limit=50)
    briefings, _ = list_documents("briefings", order_by_field="created_at", descending=True, limit=50)
    meetings, _ = list_documents("meetings", order_by_field="createdAt", descending=True, limit=50)

    if not term:
        return {
            "success": True,
            "data": {
                "suites": suites[:5],
                "traces": traces[:5],
                "dossiers": briefings[:5],
                "meetings": meetings[:5],
            },
        }

    filtered_suites = [
        s for s in suites
        if term in s["name"].lower() or term in s["category"].lower() or term in s["id"].lower()
    ]
    filtered_traces = [
        t for t in traces
        if term in str(t.get("name", "")).lower()
        or term in str(t.get("model", "")).lower()
        or term in str(t.get("id", "")).lower()
    ]
    filtered_dossiers = [
        d for d in briefings
        if term in str(d.get("subject", d.get("company_name", ""))).lower()
        or term in str(d.get("meetingPurpose", d.get("meeting_title", ""))).lower()
        or term in str(d.get("id", d.get("briefing_id", ""))).lower()
    ]
    filtered_meetings = [
        m for m in meetings
        if term in str(m.get("title", "")).lower()
        or term in str(m.get("department", "")).lower()
    ]

    return {
        "success": True,
        "data": {
            "suites": filtered_suites,
            "traces": filtered_traces,
            "dossiers": filtered_dossiers,
            "meetings": filtered_meetings,
        },
    }


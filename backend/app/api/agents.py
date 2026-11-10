import logging
from typing import Any, Dict, List
from fastapi import APIRouter, HTTPException, status
from app.agents.research_agent import get_research_agent, ResearchRequest, ResearchResult
from app.agents.evidence_agent import (
    get_evidence_agent,
    EvidenceEvaluationRequest,
    EvidenceEvaluationResponse,
)

logger = logging.getLogger("nexusiq.api.agents")
router = APIRouter(prefix="/agents", tags=["Agents"])


@router.get(
    "",
    summary="List Registered AI Agents",
    description="Returns metadata, operational status, and descriptions of all AI agents in NexusIQ.",
)
async def list_agents() -> Dict[str, Any]:
    return {
        "status": "success",
        "count": 3,
        "agents": [
            {
                "id": "research-agent",
                "name": "Research Agent",
                "role": "Pre-Meeting Intelligence Gathering",
                "description": "Searches external web sources for attendee background, company news, and executive briefings.",
                "tools": ["tavily_search_api", "bifrost_ai_gateway"],
            },
            {
                "id": "evidence-agent",
                "name": "Evidence Agent",
                "role": "Fact Verification & Source Triangulation",
                "description": "Cross-references claims against trusted sources and assigns credibility weights.",
                "tools": ["trust_engine"],
            },
            {
                "id": "briefing-agent",
                "name": "Briefing Agent",
                "role": "Executive Briefing Synthesis",
                "description": "Synthesizes research and verified evidence into actionable pre-meeting dossiers.",
                "tools": ["bifrost_ai_gateway", "trust_engine"],
            },
        ],
    }


@router.post(
    "/research",
    response_model=ResearchResult,
    summary="Execute Pre-Meeting Research",
    description="Gathers open-source intelligence on a target person, company, or topic.",
)
async def run_research(payload: ResearchRequest) -> ResearchResult:
    try:
        agent = get_research_agent()
        return await agent.execute(payload)
    except Exception as exc:
        logger.error("Research execution failed: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Research agent encountered an error: {str(exc)}",
        )


@router.post(
    "/evidence",
    response_model=EvidenceEvaluationResponse,
    summary="Evaluate Evidence for Claims",
    description="Cross-references proposed assertions against source documents using the NexusIQ Trust Engine.",
)
async def run_evidence_evaluation(
    payload: EvidenceEvaluationRequest,
) -> EvidenceEvaluationResponse:
    try:
        agent = get_evidence_agent()
        return await agent.evaluate(payload)
    except Exception as exc:
        logger.error("Evidence evaluation failed: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Evidence evaluation failed: {str(exc)}",
        )


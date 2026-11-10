import logging
import time
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field
from app.services.trust_engine import get_trust_engine, TrustScoreReport

logger = logging.getLogger("nexusiq.agents.evidence")


class EvidenceItem(BaseModel):
    """An individual piece of corroborated evidence."""
    claim: str
    source_url: str
    source_title: Optional[str] = None
    confidence: float = Field(default=0.0, ge=0.0, le=1.0)
    snippet: Optional[str] = None


class EvidenceEvaluationRequest(BaseModel):
    """Request payload to extract and evaluate evidence for claims."""
    claims: List[str] = Field(..., description="List of factual claims or briefing statements")
    raw_sources: List[Dict[str, Any]] = Field(
        default_factory=list,
        description="List of search result dictionaries containing url, title, content",
    )


class EvidenceEvaluationResponse(BaseModel):
    """Corroborated evidence response with Trust Engine audit."""
    claims_count: int
    trust_report: TrustScoreReport
    evidence_items: List[EvidenceItem]
    execution_time_ms: float


class EvidenceAgent:
    """
    Evidence Agent for NexusIQ.
    Extracts, links, and cross-references source evidence against proposed assertions.
    """

    def __init__(self):
        self.trust_engine = get_trust_engine()

    async def evaluate(self, request: EvidenceEvaluationRequest) -> EvidenceEvaluationResponse:
        """Evaluates given claims against provided source material."""
        start_time = time.perf_counter()

        # Run Trust Engine evaluation
        trust_report = self.trust_engine.evaluate_claims(
            claims=request.claims,
            evidences=request.raw_sources,
        )

        evidence_items: List[EvidenceItem] = []
        for evaluation in trust_report.evaluations:
            for src in evaluation.supporting_sources:
                evidence_items.append(
                    EvidenceItem(
                        claim=evaluation.claim,
                        source_url=src.url,
                        source_title=src.title,
                        confidence=evaluation.confidence_score,
                        snippet=src.snippet,
                    )
                )

        duration_ms = round((time.perf_counter() - start_time) * 1000, 2)

        return EvidenceEvaluationResponse(
            claims_count=len(request.claims),
            trust_report=trust_report,
            evidence_items=evidence_items,
            execution_time_ms=duration_ms,
        )


_evidence_agent_instance = EvidenceAgent()


def get_evidence_agent() -> EvidenceAgent:
    """Returns singleton EvidenceAgent."""
    return _evidence_agent_instance


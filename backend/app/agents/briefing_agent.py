import logging
import time
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field
from app.agents.research_agent import get_research_agent, ResearchRequest
from app.agents.evidence_agent import get_evidence_agent, EvidenceEvaluationRequest
from app.integrations.bifrost_client import get_bifrost_client, BifrostConnectionError, BifrostAPIError
from app.services.trust_engine import TrustScoreReport

logger = logging.getLogger("nexusiq.agents.briefing")


class BriefingRequest(BaseModel):
    """Input payload to generate a pre-meeting intelligence briefing."""
    meeting_title: str = Field(..., description="Title of the upcoming meeting")
    attendees: List[str] = Field(
        default_factory=list,
        description="Names or email domains of participants",
    )
    company_name: Optional[str] = Field(
        default=None,
        description="Target company or client name",
    )
    meeting_goals: List[str] = Field(
        default_factory=list,
        description="User's primary objectives for the meeting",
    )


class TalkingPoint(BaseModel):
    category: str
    content: str
    grounded: bool
    citation_url: Optional[str] = None


class BriefingDocument(BaseModel):
    meeting_title: str
    company_name: Optional[str] = None
    executive_summary: str
    key_attendee_insights: List[str] = Field(default_factory=list)
    talking_points: List[TalkingPoint] = Field(default_factory=list)
    strategic_risks: List[str] = Field(default_factory=list)
    trust_report: TrustScoreReport
    synthesis_mode: str  # "bifrost_llm" or "deterministic_evidence_compilation"
    execution_time_ms: float


class BriefingAgent:
    """
    Briefing Agent for NexusIQ.
    Synthesizes pre-meeting research and evidence into a structured, trust-scored executive briefing.
    Uses Bifrost AI Gateway for LLM synthesis if available; falls back to verified evidence compilation.
    Never fabricates mock LLM output.
    """

    def __init__(self):
        self.research_agent = get_research_agent()
        self.evidence_agent = get_evidence_agent()
        self.bifrost = get_bifrost_client()

    async def generate_briefing(self, request: BriefingRequest) -> BriefingDocument:
        """Generates an executive briefing document."""
        start_time = time.perf_counter()

        # Step 1: Research target company or participants
        target = request.company_name or (request.attendees[0] if request.attendees else request.meeting_title)
        research_req = ResearchRequest(
            target_name=target,
            target_type="company" if request.company_name else "topic",
            context_keywords=request.meeting_goals,
            max_sources=5,
        )
        research_result = await self.research_agent.execute(research_req)

        # Step 2: Formulate candidate claims and talking points
        candidate_claims: List[str] = list(research_result.key_findings)
        if not candidate_claims and research_result.summary:
            candidate_claims.append(research_result.summary)

        # Step 3: Run Evidence Agent and Trust Engine evaluation
        raw_sources = [
            {"url": s.url, "title": s.title, "content": s.snippet}
            for s in research_result.sources
        ]
        evidence_resp = await self.evidence_agent.evaluate(
            EvidenceEvaluationRequest(
                claims=candidate_claims,
                raw_sources=raw_sources,
            )
        )

        talking_points: List[TalkingPoint] = []
        for eval_item in evidence_resp.trust_report.evaluations:
            best_citation = (
                eval_item.supporting_sources[0].url
                if eval_item.supporting_sources
                else None
            )
            talking_points.append(
                TalkingPoint(
                    category="Intelligence Finding",
                    content=eval_item.claim,
                    grounded=eval_item.verified,
                    citation_url=best_citation,
                )
            )

        # Step 4: Attempt LLM executive synthesis via Bifrost AI Gateway if available
        synthesis_mode = "deterministic_evidence_compilation"
        executive_summary = (
            f"Pre-meeting intelligence compiled for '{request.meeting_title}'. "
            f"Based on {len(research_result.sources)} gathered sources with an overall "
            f"trust score of {evidence_resp.trust_report.overall_trust_score}%."
        )

        try:
            bifrost_health = await self.bifrost.check_health()
            if bifrost_health.get("available"):
                llm_prompt = [
                    {
                        "role": "system",
                        "content": (
                            "You are the NexusIQ Executive Pre-Meeting Intelligence Assistant. "
                            "Synthesize only the provided factual evidence into a concise, 2-paragraph executive briefing."
                        ),
                    },
                    {
                        "role": "user",
                        "content": (
                            f"Meeting: {request.meeting_title}\n"
                            f"Target: {target}\n"
                            f"Findings: {research_result.summary}\n"
                            f"Key Points: {candidate_claims}"
                        ),
                    },
                ]
                llm_response = await self.bifrost.chat_completion(
                    messages=llm_prompt,
                    temperature=0.3,
                )
                choices = llm_response.get("choices", [])
                if choices and "message" in choices[0]:
                    executive_summary = choices[0]["message"].get("content", executive_summary)
                    synthesis_mode = "bifrost_llm"
        except (BifrostConnectionError, BifrostAPIError, Exception) as bifrost_err:
            logger.info(
                "Bifrost Gateway not available (%s); defaulting to verified evidence compilation.",
                bifrost_err,
            )

        duration_ms = round((time.perf_counter() - start_time) * 1000, 2)

        return BriefingDocument(
            meeting_title=request.meeting_title,
            company_name=request.company_name,
            executive_summary=executive_summary,
            key_attendee_insights=research_result.key_findings,
            talking_points=talking_points,
            strategic_risks=[
                "Verify unconfirmed claims before quoting directly in discussion.",
                f"Trust groundedness: {evidence_resp.trust_report.hallucination_risk} risk.",
            ],
            trust_report=evidence_resp.trust_report,
            synthesis_mode=synthesis_mode,
            execution_time_ms=duration_ms,
        )


_briefing_agent_instance = BriefingAgent()


def get_briefing_agent() -> BriefingAgent:
    """Returns singleton BriefingAgent."""
    return _briefing_agent_instance


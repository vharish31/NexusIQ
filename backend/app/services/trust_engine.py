import logging
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

logger = logging.getLogger("nexusiq.services.trust_engine")


class SourceEvidence(BaseModel):
    """Source reference used to verify a claim or insight."""
    url: str
    title: Optional[str] = None
    domain: Optional[str] = None
    credibility_weight: float = Field(default=1.0, ge=0.0, le=1.0)
    snippet: Optional[str] = None


class VerificationResult(BaseModel):
    """Result of claim verification and trust evaluation."""
    claim: str
    verified: bool
    confidence_score: float = Field(..., ge=0.0, le=1.0)
    supporting_sources: List[SourceEvidence] = Field(default_factory=list)
    risk_factors: List[str] = Field(default_factory=list)


class TrustScoreReport(BaseModel):
    """Comprehensive trust report for a briefing or agent benchmark run."""
    overall_trust_score: float = Field(..., ge=0.0, le=100.0)
    groundedness_score: float = Field(..., ge=0.0, le=1.0)
    hallucination_risk: str  # "LOW", "MEDIUM", "HIGH"
    verified_claims_count: int
    unverified_claims_count: int
    evaluations: List[VerificationResult] = Field(default_factory=list)
    metadata: Dict[str, Any] = Field(default_factory=dict)


class TrustEngine:
    """
    NexusIQ Trust Engine.
    Evaluates evidence groundedness, computes factual trust scores,
    and detects potential hallucinations in pre-meeting briefings and agent benchmark runs.
    """

    TRUSTED_DOMAINS = {
        "linkedin.com": 0.95,
        "bloomberg.com": 0.95,
        "reuters.com": 0.95,
        "sec.gov": 1.0,
        "wsj.com": 0.95,
        "ft.com": 0.95,
        "techcrunch.com": 0.85,
        "github.com": 0.90,
    }

    def compute_source_credibility(self, domain: Optional[str]) -> float:
        """Determines the baseline credibility weight for an information source."""
        if not domain:
            return 0.5
        domain_lower = domain.lower()
        for trusted_domain, score in self.TRUSTED_DOMAINS.items():
            if trusted_domain in domain_lower:
                return score
        if domain_lower.endswith(".gov") or domain_lower.endswith(".edu"):
            return 0.95
        if domain_lower.endswith(".org"):
            return 0.80
        return 0.65

    def evaluate_claims(
        self,
        claims: List[str],
        evidences: List[Dict[str, Any]],
    ) -> TrustScoreReport:
        """
        Cross-checks a list of briefing claims against collected evidence.
        Produces a TrustScoreReport with verified claims, risk assessment, and score.
        """
        evaluations: List[VerificationResult] = []
        verified_count = 0

        # Build lookup set of evidence keywords and sources
        evidence_sources: List[SourceEvidence] = []
        evidence_text_corpus = ""

        for ev in evidences:
            url = ev.get("url", "")
            title = ev.get("title", "")
            snippet = ev.get("content", "") or ev.get("snippet", "")
            domain = url.split("/")[2] if "://" in url else url

            cred_weight = self.compute_source_credibility(domain)
            source = SourceEvidence(
                url=url,
                title=title,
                domain=domain,
                credibility_weight=cred_weight,
                snippet=snippet[:300] if snippet else None,
            )
            evidence_sources.append(source)
            evidence_text_corpus += f" {title} {snippet}".lower()

        for claim in claims:
            claim_lower = claim.lower()
            words = [w for w in claim_lower.split() if len(w) > 3]

            # Matching score based on keyword overlap with evidence corpus
            matching_sources: List[SourceEvidence] = []
            risk_factors: List[str] = []

            for source in evidence_sources:
                source_text = f"{source.title or ''} {source.snippet or ''}".lower()
                matches = sum(1 for w in words if w in source_text)
                if matches >= max(2, int(len(words) * 0.3)):
                    matching_sources.append(source)

            if matching_sources:
                confidence = min(
                    1.0,
                    sum(s.credibility_weight for s in matching_sources) / len(matching_sources),
                )
                verified = confidence >= 0.6
            else:
                confidence = 0.2
                verified = False
                risk_factors.append("No direct corroborating evidence found in gathered sources.")

            if verified:
                verified_count += 1

            evaluations.append(
                VerificationResult(
                    claim=claim,
                    verified=verified,
                    confidence_score=round(confidence, 2),
                    supporting_sources=matching_sources,
                    risk_factors=risk_factors,
                )
            )

        total_claims = len(claims) if claims else 1
        groundedness = round(verified_count / total_claims, 2)
        overall_score = round(groundedness * 100.0, 1)

        if overall_score >= 80.0:
            hallucination_risk = "LOW"
        elif overall_score >= 50.0:
            hallucination_risk = "MEDIUM"
        else:
            hallucination_risk = "HIGH"

        return TrustScoreReport(
            overall_trust_score=overall_score,
            groundedness_score=groundedness,
            hallucination_risk=hallucination_risk,
            verified_claims_count=verified_count,
            unverified_claims_count=len(claims) - verified_count,
            evaluations=evaluations,
            metadata={"total_sources_evaluated": len(evidence_sources)},
        )


_trust_engine_instance = TrustEngine()


def get_trust_engine() -> TrustEngine:
    """Returns the singleton TrustEngine service."""
    return _trust_engine_instance


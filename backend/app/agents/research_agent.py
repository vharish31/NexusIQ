import logging
import time
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field
from app.integrations.tavily_client import get_tavily_client, TavilyError
from app.integrations.bifrost_client import get_bifrost_client, BifrostError

logger = logging.getLogger("nexusiq.agents.research")


class ResearchRequest(BaseModel):
    """Input payload for pre-meeting attendee or company research."""
    target_name: str = Field(..., description="Name of company or person to research")
    target_type: str = Field(
        default="company",
        description="Target type: 'company', 'person', or 'topic'",
    )
    context_keywords: List[str] = Field(
        default_factory=list,
        description="Additional keywords, e.g. meeting topic, industry, recent announcements",
    )
    max_sources: int = Field(default=5, ge=1, le=15)


class SearchSource(BaseModel):
    title: str
    url: str
    snippet: str
    score: Optional[float] = None


class ResearchResult(BaseModel):
    """Output from the Research Agent."""
    target_name: str
    target_type: str
    summary: str
    sources: List[SearchSource] = Field(default_factory=list)
    key_findings: List[str] = Field(default_factory=list)
    execution_time_ms: float
    raw_query: str


class ResearchAgent:
    """
    Research Agent for NexusIQ.
    Executes deep pre-meeting intelligence searches via Tavily and structures findings.
    Optionally orchestrates with Bifrost AI Gateway for query refinement when available.
    """

    def __init__(self):
        self.tavily = get_tavily_client()
        self.bifrost = get_bifrost_client()

    async def execute(self, request: ResearchRequest) -> ResearchResult:
        """Runs the research pipeline against the specified target."""
        start_time = time.perf_counter()

        query_terms = [request.target_name]
        if request.context_keywords:
            query_terms.extend(request.context_keywords)
        query = " ".join(query_terms)

        logger.info("Research Agent executing search for: %s", query)

        sources: List[SearchSource] = []
        key_findings: List[str] = []
        summary = ""

        try:
            search_response = await self.tavily.search(
                query=query,
                search_depth="advanced" if request.max_sources > 5 else "basic",
                max_results=request.max_sources,
                include_answer=True,
            )

            if "answer" in search_response and search_response["answer"]:
                summary = search_response["answer"]

            for item in search_response.get("results", []):
                snippet = item.get("content", "")
                sources.append(
                    SearchSource(
                        title=item.get("title", "Untitled"),
                        url=item.get("url", ""),
                        snippet=snippet,
                        score=item.get("score"),
                    )
                )
                if snippet:
                    sentences = [s.strip() for s in snippet.split(".") if len(s.strip()) > 30]
                    if sentences:
                        key_findings.append(sentences[0])

            if not summary and sources:
                summary = f"Gathered {len(sources)} public intelligence sources for {request.target_name}."

        except TavilyError as tavily_err:
            logger.warning("Tavily search failed or unconfigured: %s", tavily_err)
            summary = (
                f"Intelligence search could not be completed: {str(tavily_err)}. "
                "Ensure TAVILY_API_KEY is properly configured."
            )

        duration_ms = round((time.perf_counter() - start_time) * 1000, 2)

        return ResearchResult(
            target_name=request.target_name,
            target_type=request.target_type,
            summary=summary or f"No intelligence findings available for {request.target_name}.",
            sources=sources,
            key_findings=key_findings[:5],
            execution_time_ms=duration_ms,
            raw_query=query,
        )


_research_agent_instance = ResearchAgent()


def get_research_agent() -> ResearchAgent:
    """Returns singleton ResearchAgent."""
    return _research_agent_instance


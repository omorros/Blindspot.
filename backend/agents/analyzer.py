"""
Analyzer Agent — Cross-references all agent data to produce GapCards.

WHAT IT DOES:
- Takes the raw output from Scout, VoC, and Jobs agents
- Sends it all to Claude with a carefully crafted prompt
- Claude identifies market gaps by triangulating across all three sources
- Outputs structured GapCards with confidence scores

WHY CROSS-REFERENCING IS THE KEY DIFFERENTIATOR:
- Any tool can search the web. What makes Blindspot special is TRIANGULATION.
- A gap that shows up in ALL THREE signals (no competitors + customer complaints + no hiring)
  has much higher confidence than a gap found by just one signal.
- This is what we visualize with the triangulation bars on each GapCard.

THE CONFIDENCE FORMULA (explained to Claude):
- All 3 signals agree → 8-10 confidence
- 2 of 3 signals agree → 5-8 confidence
- Only 1 signal → 3-5 confidence
- Contradictory signals → reduce by 2 points
"""
import logging
from typing import List

from backend.llm import analyze_with_claude
from backend.models import AgentResult, GapCard, TriangulationSignal, EvidenceSource

logger = logging.getLogger(__name__)

ANALYZER_SYSTEM_PROMPT = """You are a market gap analyst at a top venture capital firm. You're given three data sources about a market:

1. **Scout Data**: Competitive landscape — who exists, what categories they're in
2. **VoC Data**: Voice of Customer — complaints, pain points, unmet needs from Reddit/forums
3. **Jobs Data**: Hiring signals — what companies are building, what roles are missing

Your job: CROSS-REFERENCE these three sources to identify market gaps (opportunities where demand exists but supply doesn't).

CONFIDENCE SCORING:
- 8-10: Gap confirmed by ALL THREE sources (no competitors + customer complaints + no hiring for it)
- 5-8: Gap confirmed by TWO sources
- 3-5: Gap suggested by ONE source only
- Reduce by 2 if any source contradicts the gap

Return ONLY valid JSON:
```json
{
  "gaps": [
    {
      "id": 1,
      "title": "Short, specific gap title",
      "description": "2-3 sentences explaining the opportunity. Be specific about WHY this is a gap.",
      "confidence": 8.5,
      "opportunity_size": "Large",
      "evidence": [
        {"title": "Evidence title", "url": "source URL", "snippet": "Key quote or data point"}
      ],
      "triangulation": [
        {"source": "scout", "strength": 0.9, "label": "Strong signal", "detail": "0/14 competitors offer this"},
        {"source": "voc", "strength": 0.85, "label": "Strong signal", "detail": "47 complaints about this"},
        {"source": "jobs", "strength": 0.6, "label": "Moderate signal", "detail": "2 related roles found"}
      ],
      "risk_flags": ["Risk 1", "Risk 2"]
    }
  ],
  "market_summary": "2-3 sentences summarizing the overall market landscape and top opportunity",
  "companies_found": <number>,
  "complaints_found": <number>,
  "jobs_analyzed": <number>
}
```

Identify 3-5 gaps. Rank by confidence (highest first). Be specific and evidence-based.
Every claim must tie back to data from at least one of the three sources.
The opportunity_size should be "Small", "Medium", or "Large" based on market potential."""


async def run_analyzer(
    industry: str,
    geography: str,
    scout_result: AgentResult,
    voc_result: AgentResult,
    jobs_result: AgentResult,
) -> dict:
    """
    Cross-reference all agent results to produce market gap analysis.

    This is the BRAIN of Blindspot — it connects dots across three
    independent data sources to find opportunities no single source reveals.

    Returns:
        dict with 'gaps', 'market_summary', 'companies_found', etc.
    """
    user_prompt = _build_cross_reference_prompt(
        industry, geography, scout_result, voc_result, jobs_result
    )

    analysis = await analyze_with_claude(ANALYZER_SYSTEM_PROMPT, user_prompt)
    return analysis


def _build_cross_reference_prompt(
    industry: str,
    geography: str,
    scout: AgentResult,
    voc: AgentResult,
    jobs: AgentResult,
) -> str:
    """
    Build a comprehensive prompt with data from all three agents.

    The prompt is structured so Claude can easily see the connections
    between different data sources — that's what enables triangulation.
    """
    prompt = f"# Market Gap Analysis: {industry} in {geography}\n\n"

    # ── Scout Data ──────────────────────────────────────────────
    prompt += "## 1. Competitive Landscape (Scout Agent)\n"
    if scout.success:
        data = scout.data
        companies = data.get("companies", [])
        prompt += f"**{len(companies)} companies identified.**\n\n"

        for company in companies:
            if isinstance(company, dict):
                prompt += f"- **{company.get('name', 'Unknown')}** ({company.get('category', 'N/A')}): {company.get('description', '')}\n"

        categories = data.get("categories", {})
        if categories:
            prompt += f"\nCategory breakdown: {categories}\n"

        category_gaps = data.get("category_gaps", [])
        if category_gaps:
            prompt += f"Potential category gaps noted: {category_gaps}\n"

        prompt += f"Estimated total funding: {data.get('total_funding', 'Unknown')}\n"
    else:
        prompt += f"*Scout agent failed: {scout.error}*\n"

    # ── VoC Data ────────────────────────────────────────────────
    prompt += "\n## 2. Voice of Customer (VoC Agent)\n"
    if voc.success:
        data = voc.data
        complaints = data.get("complaints", [])
        prompt += f"**{data.get('total_complaints', len(complaints))} complaints analyzed.**\n\n"

        themes = data.get("themes", {})
        if themes:
            prompt += "Pain point themes (ranked by frequency):\n"
            for theme, count in sorted(themes.items(), key=lambda x: x[1], reverse=True):
                prompt += f"- **{theme}**: {count} complaints\n"

        prompt += "\nSample complaints:\n"
        for complaint in complaints[:8]:
            if isinstance(complaint, dict):
                source = complaint.get("source", "Unknown")
                text = complaint.get("text", "")
                upvotes = complaint.get("upvotes", 0)
                prompt += f"- [{source}] \"{text}\" ({upvotes} upvotes)\n"

        top_pain = data.get("top_pain_point", "")
        if top_pain:
            prompt += f"\nTop pain point: {top_pain}\n"
    else:
        prompt += f"*VoC agent failed: {voc.error}*\n"

    # ── Jobs Data ───────────────────────────────────────────────
    prompt += "\n## 3. Hiring Signals (Jobs Agent)\n"
    if jobs.success:
        data = jobs.data
        postings = data.get("postings", [])
        prompt += f"**{data.get('total_jobs', len(postings))} job postings analyzed.**\n\n"

        for posting in postings:
            if isinstance(posting, dict):
                prompt += f"- **{posting.get('title', '')}** at {posting.get('company', 'Unknown')}: {posting.get('signal', '')}\n"

        hiring_gaps = data.get("hiring_gaps", [])
        if hiring_gaps:
            prompt += "\nHiring gaps (roles NO company is hiring for):\n"
            for gap in hiring_gaps:
                prompt += f"- {gap}\n"

        signals = data.get("market_signals", [])
        if signals:
            prompt += "\nMarket signals from hiring:\n"
            for signal in signals:
                prompt += f"- {signal}\n"
    else:
        prompt += f"*Jobs agent failed: {jobs.error}*\n"

    prompt += "\n---\n"
    prompt += "Now cross-reference ALL THREE sources above to identify market gaps. "
    prompt += "A strong gap should have evidence from multiple sources. "
    prompt += "Rank gaps by confidence score."

    return prompt

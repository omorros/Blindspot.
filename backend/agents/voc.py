"""
Voice of Customer (VoC) Agent — Finds unmet needs from real user complaints.

WHAT IT DOES:
1. Searches Reddit, Trustpilot, and forums for complaints/frustrations
2. Scrapes top threads to get full context (not just snippets)
3. Uses Claude to categorize complaints into themes with counts

WHY THIS IS THE MOST IMPORTANT AGENT:
- Real customer pain = real market opportunity
- "47 Reddit threads cite pricing opacity" is more convincing than any market report
- VCs (Cherry Ventures) care about demand signals over supply analysis
- Upvote counts serve as a proxy for how widely felt the pain is

QUERY STRATEGY:
- Reddit-specific: "site:reddit.com {industry} {geography} frustrated OR complaint OR wish"
- Review sites: "site:trustpilot.com {industry} {geography} review"
- General forums: "{industry} problems {geography} forum 2024"
"""
import logging
from typing import Callable, Awaitable

from mcp import ClientSession
from backend.mcp_client import BrightDataMCP
from backend.llm import analyze_with_claude
from backend.models import AgentResult

logger = logging.getLogger(__name__)

VOC_SYSTEM_PROMPT = """You are a customer research analyst. Given Reddit threads, reviews, and forum posts, identify unmet needs and pain points in this market.

Return ONLY valid JSON in this exact format:
```json
{
  "complaints": [
    {
      "source": "Reddit r/subreddit or Trustpilot",
      "text": "Direct quote or close paraphrase of the complaint",
      "upvotes": <number or 0 if unknown>,
      "url": "source URL if available"
    }
  ],
  "themes": {
    "Theme name": <number of complaints matching this theme>
  },
  "total_complaints": <total unique complaints found>,
  "top_pain_point": "The single biggest unmet need, stated clearly",
  "sentiment_summary": "1-2 sentences on overall market sentiment"
}
```

Focus on SPECIFIC, ACTIONABLE complaints — not vague dissatisfaction.
Group similar complaints into themes. Count how many complaints match each theme.
Rank themes by complaint count (most common first)."""


async def run_voc(
    industry: str,
    geography: str,
    mcp: BrightDataMCP,
    session: ClientSession,
    emit: Callable[[str], Awaitable[None]],
) -> AgentResult:
    """
    Run the Voice of Customer Agent.

    Searches Reddit, Trustpilot, and forums for customer pain points,
    then uses Claude to categorize them into actionable themes.
    """
    try:
        # ── Step 1: Search for complaints ───────────────────────
        await emit("Searching Reddit and review sites...")

        queries = [
            f"site:reddit.com {industry} {geography} frustrated OR complaint OR \"I wish\" OR \"why can't\"",
            f"{industry} {geography} problems complaints reviews 2024",
        ]

        search_results = await mcp.search_batch(session, queries)
        await emit(f"Found {len(search_results)} discussion threads")

        # ── Step 2: Scrape top discussion threads ───────────────
        urls = _extract_discussion_urls(search_results, max_urls=6)
        await emit(f"Reading {len(urls)} threads for full context...")

        scraped = await mcp.scrape_batch(
            session, urls,
            emit=emit,
        )

        await emit("Analyzing customer pain points...")

        # ── Step 3: Claude analysis ─────────────────────────────
        user_prompt = _build_voc_prompt(industry, geography, search_results, scraped)
        analysis = await analyze_with_claude(VOC_SYSTEM_PROMPT, user_prompt)

        themes_count = len(analysis.get("themes", {}))
        complaint_count = analysis.get("total_complaints", 0)
        await emit(f"Identified {themes_count} pain themes from {complaint_count} complaints")

        return AgentResult(
            agent="voc",
            success=True,
            data=analysis,
        )

    except Exception as e:
        logger.error(f"VoC agent failed: {e}")
        await emit(f"VoC encountered an error: {str(e)[:100]}")
        return AgentResult(agent="voc", success=False, data={}, error=str(e))


def _extract_discussion_urls(search_results: list, max_urls: int = 6) -> list:
    """
    Extract URLs, prioritizing Reddit and review sites.
    Reddit threads and Trustpilot reviews give us the richest complaint data.
    """
    priority_domains = ["reddit.com", "trustpilot.com", "quora.com"]
    priority_urls = []
    other_urls = []
    seen = set()

    for result in search_results:
        url = None
        if isinstance(result, dict):
            url = result.get("url") or result.get("link") or result.get("href")
        if not url or url in seen:
            continue
        seen.add(url)

        if any(domain in url for domain in priority_domains):
            priority_urls.append(url)
        else:
            other_urls.append(url)

    # Prioritize Reddit/Trustpilot, fill remaining with other results
    return (priority_urls + other_urls)[:max_urls]


def _build_voc_prompt(
    industry: str, geography: str, search_results: list, scraped: dict
) -> str:
    """Build the analysis prompt with all complaint data."""
    prompt = f"Analyze customer complaints and unmet needs in **{industry}** in **{geography}**.\n\n"

    prompt += "## Search Results (titles and snippets)\n"
    for i, result in enumerate(search_results[:20]):
        if isinstance(result, dict):
            title = result.get("title", "")
            url = result.get("url", result.get("link", ""))
            desc = result.get("description", result.get("snippet", ""))
            prompt += f"{i+1}. [{title}]({url}) — {desc}\n"

    prompt += "\n## Full Thread/Review Content\n"
    for url, content in scraped.items():
        # Truncate to ~2000 chars — Reddit threads can be very long
        truncated = content[:2000] if content else "(no content)"
        prompt += f"\n### {url}\n{truncated}\n"

    return prompt

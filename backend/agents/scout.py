"""
Scout Agent — Maps the competitive landscape.

WHAT IT DOES:
1. Searches for companies in the given industry + geography
2. Scrapes top company websites to understand what they do
3. Sends all data to Claude to produce a structured competitive map

WHY THIS MATTERS:
- To find market GAPS, you first need to know what EXISTS
- The scout shows us which categories are crowded and which are empty
- "0/14 competitors offer X" is powerful gap evidence

QUERY STRATEGY:
- Two search queries run in parallel (batch):
  1. Direct: "{industry} companies {geography}"  → finds existing players
  2. Funding: "{industry} startups {geography} funding" → finds funded companies
- We scrape the top 5-8 company sites for deeper understanding
"""
import logging
from typing import Callable, Awaitable

from mcp import ClientSession
from backend.mcp_client import BrightDataMCP
from backend.llm import analyze_with_claude
from backend.models import AgentResult

logger = logging.getLogger(__name__)

# System prompt tells Claude exactly what structured output we need
SCOUT_SYSTEM_PROMPT = """You are a competitive intelligence analyst. Given web search results and scraped company data, produce a structured competitive landscape analysis.

Return ONLY valid JSON in this exact format:
```json
{
  "companies": [
    {
      "name": "Company Name",
      "url": "https://...",
      "description": "What they do in 1-2 sentences",
      "category": "Category label (e.g., Pet Food, Pet Insurance)"
    }
  ],
  "categories": {
    "Category Name": <count of companies in this category>
  },
  "total_funding": "Estimated total funding as string, e.g. '$2.3B estimated'",
  "category_gaps": ["Categories that seem underserved or missing based on market size"],
  "key_observations": ["2-3 bullet points about the competitive landscape"]
}
```

Be thorough but concise. Include 8-15 companies. Group them into clear categories.
If you can't determine funding, estimate based on company stage/size."""


async def run_scout(
    industry: str,
    geography: str,
    mcp: BrightDataMCP,
    session: ClientSession,
    emit: Callable[[str], Awaitable[None]],
) -> AgentResult:
    """
    Run the Scout Agent.

    Args:
        industry: e.g., "pet tech"
        geography: e.g., "UK"
        mcp: BrightDataMCP instance (for search/scrape)
        session: Active MCP session
        emit: Async callback to send status updates to the UI

    Returns:
        AgentResult with competitive landscape data
    """
    try:
        # ── Step 1: Search ──────────────────────────────────────
        await emit("Searching for companies...")

        queries = [
            f"{industry} companies {geography} 2024 2025",
            f"{industry} startups {geography} funding raised",
        ]

        search_results = await mcp.search_batch(session, queries)
        await emit(f"Found {len(search_results)} search results")

        # ── Step 2: Extract and scrape top URLs ─────────────────
        urls = _extract_urls(search_results, max_urls=6)
        await emit(f"Scraping {len(urls)} company websites...")

        scraped = await mcp.scrape_batch(
            session, urls,
            emit=emit,  # Progress: "Scraped 3/6 sites..."
        )

        await emit("Analyzing competitive landscape...")

        # ── Step 3: Send to Claude for analysis ─────────────────
        user_prompt = _build_analysis_prompt(industry, geography, search_results, scraped)
        analysis = await analyze_with_claude(SCOUT_SYSTEM_PROMPT, user_prompt)

        company_count = len(analysis.get("companies", []))
        await emit(f"Mapped {company_count} companies across {len(analysis.get('categories', {}))} categories")

        return AgentResult(
            agent="scout",
            success=True,
            data=analysis,
        )

    except Exception as e:
        logger.error(f"Scout agent failed: {e}")
        await emit(f"Scout encountered an error: {str(e)[:100]}")
        return AgentResult(agent="scout", success=False, data={}, error=str(e))


def _extract_urls(search_results: list, max_urls: int = 6) -> list:
    """
    Extract unique URLs from search results.
    Filters out aggregator sites to focus on actual company websites.
    """
    skip_domains = {"wikipedia.org", "crunchbase.com", "linkedin.com", "facebook.com", "twitter.com"}
    urls = []
    seen = set()

    for result in search_results:
        url = None
        if isinstance(result, dict):
            url = result.get("url") or result.get("link") or result.get("href")
        if not url or url in seen:
            continue
        # Skip aggregator/social sites — we want actual company sites
        if any(domain in url for domain in skip_domains):
            continue
        seen.add(url)
        urls.append(url)
        if len(urls) >= max_urls:
            break

    return urls


def _build_analysis_prompt(
    industry: str, geography: str, search_results: list, scraped: dict
) -> str:
    """
    Build the user prompt for Claude with all gathered data.
    We include both search results AND scraped content so Claude has full context.
    """
    prompt = f"Analyze the competitive landscape for **{industry}** in **{geography}**.\n\n"

    prompt += "## Search Results\n"
    for i, result in enumerate(search_results[:20]):
        if isinstance(result, dict):
            title = result.get("title", "")
            url = result.get("url", result.get("link", ""))
            desc = result.get("description", result.get("snippet", ""))
            prompt += f"{i+1}. [{title}]({url}) — {desc}\n"

    prompt += "\n## Scraped Company Websites\n"
    for url, content in scraped.items():
        # Truncate content to avoid token limits — first 1500 chars is usually enough
        truncated = content[:1500] if content else "(no content)"
        prompt += f"\n### {url}\n{truncated}\n"

    return prompt

"""
Jobs Agent — Analyzes hiring signals to identify market opportunities.

WHAT IT DOES:
1. Searches job boards for roles in the target industry
2. Scrapes job postings for details about what companies are building
3. Uses Claude to identify what's being hired for AND what's NOT

WHY HIRING SIGNALS MATTER:
- Companies hire for what they're building → shows market direction
- GAPS in hiring are even more interesting:
  "No one is hiring comparison engineers" → no one is building comparison tools
- Job descriptions reveal internal pain points companies are trying to solve
- It's a signal that can't be faked (companies spend real money on hiring)

QUERY STRATEGY:
- Job boards: "{industry} jobs {geography} site:linkedin.com OR site:indeed.com"
- Startup jobs: "{industry} startup hiring {geography} 2024"
"""
import logging
from typing import Callable, Awaitable

from mcp import ClientSession
from backend.mcp_client import BrightDataMCP
from backend.llm import analyze_with_claude
from backend.models import AgentResult

logger = logging.getLogger(__name__)

JOBS_SYSTEM_PROMPT = """You are a labor market analyst. Given job postings and hiring data, identify what companies are building, what skills they need, and — critically — what GAPS exist in hiring.

Return ONLY valid JSON in this exact format:
```json
{
  "postings": [
    {
      "title": "Job title",
      "company": "Company name",
      "url": "Job URL if available",
      "signal": "What this hiring tells us about market direction (1 sentence)"
    }
  ],
  "hiring_gaps": [
    "Description of roles/capabilities that NO company is hiring for — these indicate whitespace"
  ],
  "hot_skills": ["Skills appearing in 3+ postings — shows market demand"],
  "total_jobs": <number of SPECIFIC job postings you can cite — only count ones you actually see in the data, NOT general search result counts>,
  "market_signals": [
    "2-3 key takeaways about what the hiring landscape reveals"
  ]
}
```

Focus on WHAT THE HIRING PATTERN REVEALS about market opportunities.
The most valuable insight is what companies are NOT hiring for — that's the gap."""


async def run_jobs(
    industry: str,
    geography: str,
    mcp: BrightDataMCP,
    session: ClientSession,
    emit: Callable[[str], Awaitable[None]],
) -> AgentResult:
    """
    Run the Jobs Agent.

    Searches for job postings and analyzes hiring patterns to identify
    what companies are building (and what they're NOT building).
    """
    try:
        # ── Step 1: Search job postings ─────────────────────────
        await emit("Searching job boards...")

        queries = [
            f"{industry} jobs {geography} site:linkedin.com OR site:indeed.com",
            f"{industry} startup hiring {geography} 2024 2025",
        ]

        search_results = await mcp.search_batch(session, queries)
        await emit(f"Found {len(search_results)} job-related results")

        # ── Step 2: Scrape top job postings ─────────────────────
        urls = _extract_job_urls(search_results, max_urls=5)
        await emit(f"Reading {len(urls)} job postings...")

        scraped = await mcp.scrape_batch(
            session, urls,
            emit=emit,
        )

        await emit("Analyzing hiring patterns...")

        # ── Step 3: Claude analysis ─────────────────────────────
        user_prompt = _build_jobs_prompt(industry, geography, search_results, scraped)
        analysis = await analyze_with_claude(JOBS_SYSTEM_PROMPT, user_prompt)

        jobs_count = analysis.get("total_jobs", 0)
        gaps_count = len(analysis.get("hiring_gaps", []))
        await emit(f"Analyzed {jobs_count} postings, found {gaps_count} hiring gaps")

        return AgentResult(
            agent="jobs",
            success=True,
            data=analysis,
        )

    except Exception as e:
        logger.error(f"Jobs agent failed: {e}")
        await emit(f"Jobs encountered an error: {str(e)[:100]}")
        return AgentResult(agent="jobs", success=False, data={}, error=str(e))


def _extract_job_urls(search_results: list, max_urls: int = 5) -> list:
    """Extract job posting URLs, prioritizing actual job boards."""
    priority_domains = ["linkedin.com", "indeed.com", "glassdoor.com", "wellfound.com"]
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

    return (priority_urls + other_urls)[:max_urls]


def _build_jobs_prompt(
    industry: str, geography: str, search_results: list, scraped: dict
) -> str:
    """Build the analysis prompt with job posting data."""
    prompt = f"Analyze hiring patterns in **{industry}** in **{geography}**.\n\n"

    prompt += "## Job Search Results\n"
    for i, result in enumerate(search_results[:20]):
        if isinstance(result, dict):
            title = result.get("title", "")
            url = result.get("url", result.get("link", ""))
            desc = result.get("description", result.get("snippet", ""))
            prompt += f"{i+1}. [{title}]({url}) — {desc}\n"

    prompt += "\n## Full Job Posting Details\n"
    for url, content in scraped.items():
        truncated = content[:1500] if content else "(no content)"
        prompt += f"\n### {url}\n{truncated}\n"

    return prompt

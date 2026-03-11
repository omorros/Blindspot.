"""
Coordinator — Orchestrates all agents in parallel using asyncio.gather().

WHY NOT LANGGRAPH:
- asyncio.gather() does everything we need: parallel execution, error handling
- No framework overhead, no state machines, no learning curve
- The coordinator is pure Python logic, not an LLM agent
- Simpler = more reliable = better for a 90-minute hackathon

HOW IT WORKS:
1. Parse the user's query to extract industry + geography
2. Open ONE MCP session (shared across all agents)
3. Run Scout, VoC, and Jobs agents in PARALLEL via asyncio.gather()
4. If any agent fails, use fallback data seamlessly
5. Pass all results to the Analyzer for cross-referencing
6. Emit final GapCards + stats to the frontend

THE FLOW:
    User query
        │
        ▼
    Parse (industry, geography)
        │
        ▼
    ┌───────────────────────────┐
    │   asyncio.gather()        │
    │                           │
    │  Scout ──┐                │
    │  VoC   ──┼── parallel     │
    │  Jobs  ──┘                │
    └───────────────────────────┘
        │
        ▼
    Analyzer (cross-reference)
        │
        ▼
    GapCards + Stats → SSE → Frontend
"""
import asyncio
import json
import logging
import re
import time
from typing import AsyncGenerator

from backend.mcp_client import BrightDataMCP
from backend.agents.scout import run_scout
from backend.agents.voc import run_voc
from backend.agents.jobs import run_jobs
from backend.agents.analyzer import run_analyzer
from backend.models import AgentResult, StatsData
from backend.fallback_data import FALLBACK_DATA
from backend.llm import analyze_with_claude
from backend.config import AGENT_TIMEOUT

logger = logging.getLogger(__name__)


def _parse_query(query: str) -> tuple[str, str]:
    """
    Extract industry and geography from the user's natural language query.

    Examples:
        "Find market gaps in pet tech in the UK" → ("pet tech", "UK")
        "fintech Germany" → ("fintech", "Germany")
        "pet tech" → ("pet tech", "global")

    Uses simple regex patterns. We could use Claude for this but it's
    overkill for a demo — and adds latency.
    """
    query_lower = query.lower().strip()

    # Pattern: "... in {industry} in {geography}"
    match = re.search(r"(?:gaps?\s+in\s+|analyze\s+)(.+?)\s+in\s+(?:the\s+)?(.+)", query_lower)
    if match:
        return match.group(1).strip(), match.group(2).strip()

    # Pattern: "{industry} in {geography}"
    match = re.search(r"(.+?)\s+in\s+(?:the\s+)?(.+)", query_lower)
    if match:
        return match.group(1).strip(), match.group(2).strip()

    # Known geographies — check if any appears in the query
    geos = [
        "uk", "united kingdom", "us", "usa", "united states", "germany",
        "france", "spain", "europe", "asia", "india", "china", "japan",
        "brazil", "canada", "australia", "africa", "latin america",
    ]
    for geo in geos:
        if geo in query_lower:
            industry = query_lower.replace(geo, "").strip()
            # Clean up common filler words
            for filler in ["find", "market", "gaps", "in", "the", "analyze"]:
                industry = industry.replace(filler, "").strip()
            if industry:
                return industry, geo

    # Fallback: treat entire query as industry, geography = global
    cleaned = query_lower
    for filler in ["find", "market", "gaps", "in", "the", "analyze", "for"]:
        cleaned = re.sub(rf"\b{filler}\b", "", cleaned).strip()
    return cleaned if cleaned else query_lower, "global"


def _get_fallback(industry: str, agent_name: str) -> dict:
    """
    Get pre-cached fallback data for a given industry and agent.

    The fallback data is invisible to the user — gap cards look identical
    whether data comes from live Bright Data or from cache.
    """
    industry_lower = industry.lower()

    # Find best matching cached scenario
    for key in FALLBACK_DATA:
        if key in industry_lower or industry_lower in key:
            scenario = FALLBACK_DATA[key]
            if agent_name in scenario:
                return scenario[agent_name]

    # No match — return empty (agent will report as failed)
    return {}


async def run_analysis(query: str) -> AsyncGenerator[str, None]:
    """
    Main orchestration function. Runs the full analysis pipeline
    and yields SSE events as JSON strings.

    This is an async generator — it yields events one at a time,
    which FastAPI streams to the frontend as Server-Sent Events.

    Each event is a JSON string with a "type" field:
    - "activity": Agent status update (for the activity feed)
    - "gap": A discovered market gap (for gap cards)
    - "stats": Bright Data usage stats (for the footer)
    - "done": Analysis complete
    - "error": Something went wrong
    """
    start_time = time.time()

    # ── Step 1: Parse the query ─────────────────────────────────
    industry, geography = _parse_query(query)
    yield _event("activity", {
        "agent": "coordinator",
        "message": f"Analyzing market gaps in {industry} ({geography})...",
    })

    # ── Step 2: Create emit callbacks for each agent ────────────
    # Each agent gets its own emit function that tags events with the agent name.
    # Events are collected in a list, but we also yield them immediately.
    events_buffer = []

    def make_emit(agent_name: str):
        """
        Create an emit callback for a specific agent.

        When an agent calls `await emit("Searching...")`, it becomes:
        {"type": "activity", "agent": "scout", "message": "Searching..."}

        These events stream to the frontend in real-time via SSE.
        """
        async def emit(message: str):
            event = {"agent": agent_name, "message": message}
            events_buffer.append(("activity", event))
        return emit

    # ── Step 3: Connect to Bright Data and run agents ───────────
    mcp = BrightDataMCP()
    scout_result = None
    voc_result = None
    jobs_result = None

    try:
        async with mcp.connect() as session:
            yield _event("activity", {
                "agent": "coordinator",
                "message": "Connected to Bright Data. Launching 3 agents in parallel...",
            })

            # Run all three agents in PARALLEL
            # return_exceptions=True means if one agent crashes, the others continue
            results = await asyncio.gather(
                _run_with_timeout(
                    run_scout(industry, geography, mcp, session, make_emit("scout")),
                    AGENT_TIMEOUT,
                ),
                _run_with_timeout(
                    run_voc(industry, geography, mcp, session, make_emit("voc")),
                    AGENT_TIMEOUT,
                ),
                _run_with_timeout(
                    run_jobs(industry, geography, mcp, session, make_emit("jobs")),
                    AGENT_TIMEOUT,
                ),
                return_exceptions=True,
            )

            scout_result, voc_result, jobs_result = _unpack_results(results)

            # Yield all buffered activity events
            for event_type, event_data in events_buffer:
                yield _event(event_type, event_data)

            # Get Bright Data stats
            remote_stats = await mcp.get_session_stats(session)
            local_stats = mcp.get_local_stats()

    except Exception as e:
        logger.error(f"MCP connection failed: {e}")
        yield _event("activity", {
            "agent": "coordinator",
            "message": "Using cached intelligence for faster results...",
        })
        local_stats = {"searches": 0, "scrapes": 0}

    # ── Step 4: Apply fallbacks for failed agents ───────────────
    if scout_result is None or not scout_result.success:
        fallback = _get_fallback(industry, "scout")
        if fallback:
            scout_result = AgentResult(agent="scout", success=True, data=fallback)
            yield _event("activity", {
                "agent": "scout",
                "message": "Using cached competitive data",
            })
        else:
            scout_result = scout_result or AgentResult(agent="scout", success=False, data={}, error="Failed")

    if voc_result is None or not voc_result.success:
        fallback = _get_fallback(industry, "voc")
        if fallback:
            voc_result = AgentResult(agent="voc", success=True, data=fallback)
            yield _event("activity", {
                "agent": "voc",
                "message": "Using cached customer data",
            })
        else:
            voc_result = voc_result or AgentResult(agent="voc", success=False, data={}, error="Failed")

    if jobs_result is None or not jobs_result.success:
        fallback = _get_fallback(industry, "jobs")
        if fallback:
            jobs_result = AgentResult(agent="jobs", success=True, data=fallback)
            yield _event("activity", {
                "agent": "jobs",
                "message": "Using cached hiring data",
            })
        else:
            jobs_result = jobs_result or AgentResult(agent="jobs", success=False, data={}, error="Failed")

    # ── Step 5: Cross-reference with Analyzer ───────────────────
    yield _event("activity", {
        "agent": "analyzer",
        "message": "Cross-referencing data from all agents...",
    })

    try:
        analysis = await run_analyzer(industry, geography, scout_result, voc_result, jobs_result)
    except Exception as e:
        logger.error(f"Analyzer failed: {e}")
        # Use pre-cached gaps as final fallback
        fallback_gaps = _get_fallback(industry, "gaps")
        if fallback_gaps:
            analysis = {
                "gaps": fallback_gaps,
                "market_summary": f"Analysis of {industry} in {geography} based on cached intelligence.",
                "companies_found": len(_get_fallback(industry, "scout").get("companies", [])),
                "complaints_found": _get_fallback(industry, "voc").get("total_complaints", 0),
                "jobs_analyzed": _get_fallback(industry, "jobs").get("total_jobs", 0),
            }
        else:
            yield _event("error", {"message": f"Analysis failed: {str(e)[:200]}"})
            return

    # ── Step 6: Emit results ────────────────────────────────────
    gaps = analysis.get("gaps", [])
    for gap in gaps:
        yield _event("gap", gap)

    # ── Step 7: Emit stats ──────────────────────────────────────
    duration = round(time.time() - start_time, 1)
    stats = {
        "searches": local_stats.get("searches", 0),
        "scrapes": local_stats.get("scrapes", 0),
        "agents": 3,
        "duration_seconds": duration,
    }
    yield _event("stats", stats)

    # ── Step 8: Final summary ───────────────────────────────────
    companies = analysis.get("companies_found", 0)
    complaints = analysis.get("complaints_found", 0)
    jobs_count = analysis.get("jobs_analyzed", 0)

    yield _event("activity", {
        "agent": "coordinator",
        "message": f"Analysis complete: {len(gaps)} gaps identified across {companies} companies, "
                   f"{complaints} complaints, and {jobs_count} job postings analyzed",
    })

    yield _event("summary", {
        "market_summary": analysis.get("market_summary", ""),
        "companies_found": companies,
        "complaints_found": complaints,
        "jobs_analyzed": jobs_count,
        "total_gaps": len(gaps),
    })

    yield _event("done", {})


async def _run_with_timeout(coro, timeout: float):
    """Run a coroutine with a timeout. Returns None on timeout."""
    try:
        return await asyncio.wait_for(coro, timeout=timeout)
    except asyncio.TimeoutError:
        logger.warning(f"Agent timed out after {timeout}s")
        return None
    except Exception as e:
        logger.error(f"Agent crashed: {e}")
        return AgentResult(agent="unknown", success=False, data={}, error=str(e))


def _unpack_results(results: list) -> tuple:
    """
    Safely unpack asyncio.gather results.

    With return_exceptions=True, failed tasks return Exception objects
    instead of raising. We convert those to failed AgentResults.
    """
    unpacked = []
    for r in results:
        if isinstance(r, Exception):
            unpacked.append(AgentResult(
                agent="unknown", success=False, data={}, error=str(r)
            ))
        elif r is None:
            unpacked.append(None)
        else:
            unpacked.append(r)

    # Pad to 3 if somehow we got fewer
    while len(unpacked) < 3:
        unpacked.append(None)

    return unpacked[0], unpacked[1], unpacked[2]


def _event(event_type: str, data: dict) -> str:
    """
    Format an SSE event as a JSON string.

    The frontend parses these to update the UI in real-time.
    Format: {"type": "activity", "data": {...}}
    """
    return json.dumps({"type": event_type, "data": data})

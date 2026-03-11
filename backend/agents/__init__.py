"""
Blindspot Agents — each agent gathers a different type of market intelligence.

ARCHITECTURE:
- Scout Agent: Maps the competitive landscape (who's in this market?)
- VoC Agent: Voice of Customer — finds pain points from Reddit, Trustpilot, etc.
- Jobs Agent: Analyzes hiring signals (what are companies building/missing?)
- Analyzer Agent: Cross-references all data to identify market gaps

Each agent:
1. Receives an MCP session (Bright Data connection) and an emit callback
2. Searches the web for relevant data
3. Scrapes top results for deeper content
4. Sends everything to Claude for structured analysis
5. Returns an AgentResult with structured data

The agents run IN PARALLEL via asyncio.gather() in the coordinator.
This is what makes our approach powerful — 3 different research angles simultaneously.
"""
from backend.agents.scout import run_scout
from backend.agents.voc import run_voc
from backend.agents.jobs import run_jobs
from backend.agents.analyzer import run_analyzer

__all__ = ["run_scout", "run_voc", "run_jobs", "run_analyzer"]

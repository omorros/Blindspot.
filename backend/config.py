"""
Configuration — loads secrets from .env file.

WHY THIS PATTERN:
- API keys should NEVER be hardcoded in source code (they'd leak via git)
- .env files are in .gitignore, so they stay local
- python-dotenv loads them into os.environ at startup
- This module reads them once and exports as constants
"""
import os
from dotenv import load_dotenv

# Load .env file from the backend directory
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

# API Keys
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
BRIGHTDATA_TOKEN = os.getenv("BRIGHTDATA_TOKEN", "")

# Bright Data MCP endpoint (hosted — zero infrastructure needed)
# This URL connects to Bright Data's MCP server via Server-Sent Events transport
BRIGHTDATA_MCP_URL = f"https://mcp.brightdata.com/sse?token={BRIGHTDATA_TOKEN}"

# Claude model to use for analysis
CLAUDE_MODEL = os.getenv("CLAUDE_MODEL", "claude-sonnet-4-20250514")

# Timeouts
MCP_CALL_TIMEOUT = 20  # seconds — if a Bright Data call takes longer, use fallback
AGENT_TIMEOUT = 45     # seconds — if a full agent takes longer, use fallback

# Blindspot

**Multi-agent AI system that identifies untapped market opportunities** by orchestrating specialized agents in parallel — scraping, cross-referencing, and scoring live web signals to deliver ranked, evidence-backed market gap analysis in under 60 seconds.

Built for VCs, product teams, and strategy consultants who need rapid market intelligence without weeks of manual research.

## How It Works

1. Enter a natural language query like *"Find market gaps in pet tech in the UK"*
2. Three specialized agents launch in parallel, each researching a different signal:
   - **Scout** — maps the competitive landscape (companies, categories, funding)
   - **VoC** — mines customer pain points from Reddit, Trustpilot, and forums
   - **Jobs** — analyzes hiring patterns to detect what companies are and aren't building
3. An **Analyzer** agent cross-references all three sources to identify gaps where demand exists but supply doesn't
4. Results are ranked by confidence using **evidence triangulation** — gaps confirmed by multiple independent sources score higher

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, React 18, TypeScript, Tailwind CSS |
| Backend | FastAPI, Python 3.11+ |
| Real-time | Server-Sent Events (SSE) |
| LLM | Claude Sonnet 4 (Anthropic API) |
| Web Intelligence | Bright Data MCP Server |
| Orchestration | `asyncio.gather()` |

## Architecture

```
User Query
    |
    v
FastAPI /analyze (SSE stream)
    |
    v
Coordinator
    |
    +-- Scout Agent ----> Bright Data MCP (search + scrape) --> Claude --> Competitive Map
    |
    +-- VoC Agent ------> Bright Data MCP (search + scrape) --> Claude --> Pain Points
    |
    +-- Jobs Agent -----> Bright Data MCP (search + scrape) --> Claude --> Hiring Signals
    |
    v (all 3 in parallel)
Analyzer Agent --> Claude (cross-reference) --> Ranked GapCards
    |
    v
SSE stream --> Frontend Dashboard
```

## Confidence Scoring

Gaps are scored by how many independent signals converge:

- **8-10**: All 3 agents agree (no competitors + customer complaints + no hiring)
- **5-8**: 2 agents agree
- **3-5**: Single source only
- **-2 penalty** if sources contradict

## Features

- **Real-time activity feed** — watch agents work with color-coded status updates
- **Evidence triangulation bars** — see signal strength from each agent per gap
- **Investment Memo export** — one-click VC-ready format with copy-to-clipboard
- **Bright Data usage stats** — searches, pages scraped, duration displayed in footer
- **Fault tolerance** — graceful fallback to cached data if any agent times out

## Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- [Anthropic API key](https://console.anthropic.com/)
- [Bright Data MCP token](https://brightdata.com/)

### Backend

```bash
cd backend
python -m venv ../venv
source ../venv/bin/activate   # Windows: ..\venv\Scripts\activate
pip install -r requirements.txt
```

Create `backend/.env`:

```env
ANTHROPIC_API_KEY=sk-ant-...
BRIGHTDATA_TOKEN=...
```

```bash
python -m uvicorn main:app --reload --port 8055
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:3000** and try: *"Find market gaps in pet tech in the UK"*

### Verify

```bash
curl http://localhost:8055/health
# {"status": "ok", "service": "blindspot"}
```

## Project Structure

```
blindspot/
├── backend/
│   ├── main.py              # FastAPI app, CORS, SSE endpoint
│   ├── coordinator.py       # Agent orchestration & fallback handling
│   ├── config.py            # Environment variables & timeouts
│   ├── mcp_client.py        # Bright Data MCP wrapper
│   ├── llm.py               # Async Anthropic client + JSON extraction
│   ├── models.py            # Pydantic v2 models
│   ├── fallback_data.py     # Pre-cached demo data
│   └── agents/
│       ├── scout.py         # Competitive landscape mapping
│       ├── voc.py           # Voice of Customer (Reddit, forums)
│       ├── jobs.py          # Hiring signal analysis
│       └── analyzer.py      # Cross-reference & gap ranking
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx     # Main UI
│   │   │   ├── layout.tsx   # Root layout & theme
│   │   │   └── globals.css  # CSS variables & animations
│   │   ├── components/
│   │   │   ├── SearchInput.tsx
│   │   │   ├── ActivityFeed.tsx
│   │   │   ├── ActivityItem.tsx
│   │   │   ├── AgentStatusCards.tsx
│   │   │   ├── GapCard.tsx
│   │   │   ├── ConfidenceBadge.tsx
│   │   │   ├── InvestmentMemo.tsx
│   │   │   └── StatsFooter.tsx
│   │   ├── hooks/
│   │   │   └── useSSE.ts   # SSE stream handler
│   │   └── types/
│   │       └── index.ts    # TypeScript interfaces
│   └── package.json
│
└── CLAUDE.md
```

## License

MIT

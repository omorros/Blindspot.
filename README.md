# Blindspot

Multi-agent AI system that identifies untapped market opportunities by orchestrating specialized agents in parallel — scraping, cross-referencing, and scoring live web signals to deliver ranked, evidence-backed market gap analysis in under 60 seconds.

## How It Works

```mermaid
flowchart LR
    Q["Enter a query"] --> C[Coordinator]
    C --> S["Scout Agent"]
    C --> V["VoC Agent"]
    C --> J["Jobs Agent"]

    S -->|"Companies, categories, funding"| A[Analyzer]
    V -->|"Pain points, complaints"| A
    J -->|"Hiring patterns, skill gaps"| A

    A -->|"Ranked GapCards"| UI["Dashboard"]

    style S fill:#172554,stroke:#3b82f6,color:#bfdbfe
    style V fill:#2e1065,stroke:#8b5cf6,color:#ddd6fe
    style J fill:#451a03,stroke:#f59e0b,color:#fef3c7
    style A fill:#052e16,stroke:#10b981,color:#d1fae5
```

Three agents run in parallel, each researching a different signal:

- **Scout** — maps the competitive landscape (companies, categories, funding)
- **VoC** — mines customer pain points from Reddit, Trustpilot, and forums
- **Jobs** — analyzes hiring patterns to detect what's being built and what isn't

An **Analyzer** cross-references all three to find gaps where demand exists but supply doesn't.

## Architecture

```mermaid
sequenceDiagram
    participant U as User
    participant FE as Next.js
    participant API as FastAPI
    participant BD as Bright Data MCP
    participant LLM as Claude

    U->>FE: Search query
    FE->>API: POST /analyze

    par Parallel execution
        API->>BD: Scout: search + scrape
        BD-->>API: Company data
        API->>LLM: Analyze landscape
        LLM-->>API: Structured JSON
    and
        API->>BD: VoC: search + scrape
        BD-->>API: Forum threads
        API->>LLM: Categorize complaints
        LLM-->>API: Structured JSON
    and
        API->>BD: Jobs: search + scrape
        BD-->>API: Job postings
        API->>LLM: Extract signals
        LLM-->>API: Structured JSON
    end

    API->>LLM: Cross-reference all 3
    LLM-->>API: Ranked GapCards

    API-->>FE: SSE stream
    FE-->>U: Live dashboard
```

## Evidence Triangulation

```mermaid
flowchart TD
    subgraph Sources["Independent Signals"]
        S["Scout: 0/14 competitors offer X"]
        V["VoC: 47 Reddit threads complain about X"]
        J["Jobs: No companies hiring for X"]
    end

    S & V & J --> T{Triangulation}

    T -->|"All 3 agree"| H["Confidence 8-10"]
    T -->|"2 agree"| M["Confidence 5-8"]
    T -->|"1 source"| L["Confidence 3-5"]

    style H fill:#052e16,stroke:#10b981,color:#d1fae5
    style M fill:#451a03,stroke:#f59e0b,color:#fef3c7
    style L fill:#1e1b4b,stroke:#818cf8,color:#e0e7ff
```

Gaps confirmed by multiple independent sources score higher. Contradictory signals apply a -2 penalty.

## SSE Event Flow

```mermaid
flowchart LR
    Start((Start)) --> Activity
    Activity -->|"Agent status updates"| Gap
    Gap -->|"Market gap cards"| Summary
    Summary -->|"Aggregate analysis"| Stats
    Stats -->|"Usage metrics"| Done((Done))
    Activity -.->|"On failure"| Error((Error))
```

| Event | Payload | Purpose |
|-------|---------|---------|
| `activity` | `{ agent, message }` | Real-time agent progress |
| `gap` | `{ id, title, confidence, triangulation[] }` | Market gap discovery |
| `summary` | `{ market_summary, companies_found }` | Aggregate analysis |
| `stats` | `{ searches, scrapes, duration }` | API usage metrics |
| `done` | `{}` | Stream complete |

## Fault Tolerance

```mermaid
flowchart TD
    A[Agent runs] --> C{Success?}
    C -->|Yes| D[Use live data]
    C -->|Timeout / Error| F[Load cached data]
    D & F --> AN[Analyzer]
    AN --> R[GapCards]

    style F fill:#451a03,stroke:#f59e0b,color:#fef3c7
```

- Each agent has a 45s timeout
- `asyncio.gather(return_exceptions=True)` — one failure doesn't crash others
- Cached fallback data substitutes seamlessly

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, React 18, TypeScript, Tailwind CSS |
| Backend | FastAPI, Python 3.11+ |
| Real-time | Server-Sent Events (SSE) |
| LLM | Claude Sonnet 4 (Anthropic API) |
| Web Intelligence | Bright Data MCP Server |
| Orchestration | `asyncio.gather()` |

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
│   ├── fallback_data.py     # Cached fallback data
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
│   │   │   └── useSSE.ts
│   │   └── types/
│   │       └── index.ts
│   └── package.json
│
└── CLAUDE.md
```

## License

MIT

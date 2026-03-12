# Blindspot

**Multi-agent AI system that identifies untapped market opportunities** by orchestrating three specialized agents in parallel — scraping, cross-referencing, and scoring live web signals to deliver ranked, evidence-backed market gap analysis in under 60 seconds.

Built for VCs, product teams, and strategy consultants who need rapid market intelligence without weeks of manual research.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, React 18, TypeScript, Tailwind CSS |
| UI Components | shadcn/ui + Magic UI |
| Animations | Motion (Framer Motion) |
| Backend | FastAPI, Python 3.11+, Uvicorn |
| Real-time | Server-Sent Events (SSE) |
| LLM | Claude Sonnet 4 (Anthropic API) |
| Web Intelligence | Bright Data MCP |
| Orchestration | Pure `asyncio.gather()` — no framework overhead |

## Architecture

```mermaid
flowchart LR
    subgraph Input
        User([User])
    end

    subgraph Frontend
        FE[Next.js]
    end

    subgraph Backend
        API[FastAPI] --> Coord[Coordinator]
        Coord --> Par{{"asyncio.gather()"}}
    end

    subgraph Agents["Parallel Agents"]
        direction TB
        Scout[Scout Agent]
        VoC[VoC Agent]
        Jobs[Jobs Agent]
    end

    subgraph Services
        direction TB
        MCP[Bright Data MCP]
        LLM[Claude Sonnet 4]
    end

    subgraph Analysis
        Analyzer[Analyzer Agent]
    end

    User -->|Query| FE
    FE -->|POST /analyze| API
    Par --> Agents
    Agents --> MCP
    Agents --> LLM
    Agents -->|Results| Analyzer
    Analyzer --> LLM
    Analyzer -->|GapCards via SSE| FE

    style Scout fill:#172554,stroke:#3b82f6,color:#bfdbfe
    style VoC fill:#2e1065,stroke:#8b5cf6,color:#ddd6fe
    style Jobs fill:#451a03,stroke:#f59e0b,color:#fef3c7
    style Analyzer fill:#052e16,stroke:#10b981,color:#d1fae5
    style Par fill:#1e1b4b,stroke:#818cf8,color:#e0e7ff
```

## Agent Pipeline

```mermaid
sequenceDiagram
    participant U as User
    participant FE as Frontend
    participant API as FastAPI
    participant C as Coordinator
    participant S as Scout
    participant V as VoC
    participant J as Jobs
    participant A as Analyzer
    participant BD as Bright Data
    participant CL as Claude

    U->>FE: Enter query
    FE->>API: POST /analyze
    API->>C: Start analysis

    par Parallel Agent Execution
        C->>S: Run scout
        S->>BD: search_batch (companies)
        BD-->>S: Search results
        S->>BD: scrape_batch (top URLs)
        BD-->>S: Page content
        S->>CL: Analyze landscape
        CL-->>S: Structured JSON
        S-->>FE: SSE: activity events
    and
        C->>V: Run VoC
        V->>BD: search_batch (Reddit, forums)
        BD-->>V: Search results
        V->>BD: scrape_batch (threads)
        BD-->>V: Page content
        V->>CL: Categorize complaints
        CL-->>V: Structured JSON
        V-->>FE: SSE: activity events
    and
        C->>J: Run Jobs
        J->>BD: search_batch (job boards)
        BD-->>J: Search results
        J->>BD: scrape_batch (postings)
        BD-->>J: Page content
        J->>CL: Extract signals
        CL-->>J: Structured JSON
        J-->>FE: SSE: activity events
    end

    C->>A: Cross-reference all results
    A->>CL: Triangulate gaps
    CL-->>A: Ranked GapCards
    A-->>FE: SSE: gap + summary + stats
    FE-->>U: Dashboard with results
```

## Data Flow & Triangulation

```mermaid
flowchart LR
    subgraph Scout["Scout Agent"]
        S1[Companies found]
        S2[Category gaps]
        S3[Funding landscape]
    end

    subgraph VoC["VoC Agent"]
        V1[Customer complaints]
        V2[Pain point themes]
        V3[Sentiment analysis]
    end

    subgraph Jobs["Jobs Agent"]
        J1[Hiring patterns]
        J2[Missing roles]
        J3[Hot skills]
    end

    S1 & S2 & S3 --> Tri{Analyzer Agent}
    V1 & V2 & V3 --> Tri
    J1 & J2 & J3 --> Tri

    Tri --> GC[GapCards]

    GC --> Conf[Confidence 0-10]
    GC --> Size[Opportunity Size]
    GC --> Ev[Evidence Links]
    GC --> Risk[Risk Flags]

    style Scout fill:#172554,stroke:#3b82f6,color:#bfdbfe
    style VoC fill:#2e1065,stroke:#8b5cf6,color:#ddd6fe
    style Jobs fill:#451a03,stroke:#f59e0b,color:#fef3c7
    style Tri fill:#052e16,stroke:#10b981,color:#d1fae5
```

**Confidence scoring:**
- **8–10**: All 3 agents agree
- **5–8**: 2 agents agree
- **3–5**: Single source only
- **−2 penalty** if sources contradict

## Project Structure

```
blindspot/
├── backend/
│   ├── main.py                 # FastAPI app, CORS, SSE /analyze endpoint
│   ├── coordinator.py          # Agent orchestration, query parsing, fallbacks
│   ├── config.py               # Environment variables & timeouts
│   ├── mcp_client.py           # Bright Data MCP wrapper
│   ├── llm.py                  # Async Anthropic client + JSON extraction
│   ├── models.py               # Pydantic v2 models
│   ├── fallback_data.py        # Pre-cached demo data
│   ├── requirements.txt
│   └── agents/
│       ├── scout.py            # Competitive landscape mapping
│       ├── voc.py              # Voice of Customer (Reddit, forums)
│       ├── jobs.py             # Hiring signal analysis
│       └── analyzer.py         # Cross-reference & gap ranking
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx        # Main UI (landing ↔ dashboard)
│   │   │   ├── layout.tsx      # Root layout, fonts, theme
│   │   │   └── globals.css     # CSS variables, custom scrollbar
│   │   ├── components/
│   │   │   ├── SearchInput.tsx
│   │   │   ├── ActivityFeed.tsx
│   │   │   ├── ActivityItem.tsx
│   │   │   ├── AgentStatusCards.tsx
│   │   │   ├── GapCard.tsx
│   │   │   ├── ConfidenceBadge.tsx
│   │   │   ├── InvestmentMemo.tsx
│   │   │   ├── StatsFooter.tsx
│   │   │   └── ui/            # shadcn + Magic UI components
│   │   ├── hooks/
│   │   │   └── useSSE.ts      # SSE stream handler
│   │   └── types/
│   │       └── index.ts       # TypeScript interfaces
│   ├── package.json
│   ├── tailwind.config.ts
│   └── components.json        # shadcn config
│
├── CLAUDE.md
└── market-gap-finder-prd.md   # Product requirements doc
```

## SSE Event Protocol

```mermaid
flowchart LR
    Start((Start)) --> Activity
    Activity -->|activity events| Gap
    Gap -->|gap events| Summary
    Summary -->|summary| Stats
    Stats -->|stats| Done((Done))
    Activity -.->|error| Error((Error))

    Activity[/"Activity\n agent status updates"/]
    Gap[/"Gap\n market gap cards"/]
    Summary[/"Summary\n aggregate analysis"/]
    Stats[/"Stats\n API usage"/]
```

| Event | Payload | Purpose |
|-------|---------|---------|
| `activity` | `{ agent, message, status }` | Real-time agent progress |
| `gap` | `{ id, title, confidence, triangulation[], ... }` | Market gap discovery |
| `summary` | `{ market_summary, companies_found, ... }` | Aggregate analysis |
| `stats` | `{ searches, scrapes, agents, duration }` | Bright Data usage |
| `error` | `{ message }` | Error reporting |
| `done` | `{}` | Stream complete |

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
CLAUDE_MODEL=claude-sonnet-4-20250514   # optional
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

Open **http://localhost:3000** and try: *"pet tech in the UK"*

### Verify

```bash
curl http://localhost:8055/health
# → {"status": "ok", "service": "blindspot"}
```

## Frontend States

```mermaid
stateDiagram-v2
    [*] --> Landing
    Landing: Logo + Search + Example Queries

    Landing --> Loading: Submit query
    Loading: Agent Status Cards + Activity Feed

    Loading --> Dashboard: Results received
    Dashboard: Split-pane layout

    state Dashboard {
        [*] --> GapCards
        GapCards: Ranked market gaps
        GapCards --> Memo: Toggle
        Memo: VC-ready investment memo
        Memo --> GapCards: Toggle
    }

    Dashboard --> Landing: New search
```

**Dashboard layout:**

| Left Panel (380px) | Right Panel (flex) |
|---|---|
| Agent status cards | GapCards or Investment Memo |
| Live activity feed | Market summary + stats |
| | Evidence triangulation bars |

## Agents In Detail

| Agent | Searches For | Sources | Output |
|-------|-------------|---------|--------|
| **Scout** | Companies, funding, categories | Company websites, Crunchbase | Competitor map, category gaps |
| **VoC** | Complaints, pain points, wishes | Reddit, Trustpilot, forums | Themed pain points, sentiment |
| **Jobs** | Hiring patterns, skill gaps | LinkedIn, Indeed | Hot skills, missing roles |
| **Analyzer** | Cross-signal patterns | All 3 agents above | Ranked GapCards with confidence |

## Fault Tolerance

```mermaid
flowchart TD
    Agent[Agent Execution] --> Check{Success?}
    Check -->|Yes| Use[Use live data]
    Check -->|No / Timeout 45s| Fallback[Load cached data]
    Use --> Analyzer
    Fallback --> Analyzer
    Analyzer --> User[GapCards to user]

    style Fallback fill:#451a03,stroke:#f59e0b,color:#fef3c7
```

- Each agent wrapped in a 45s timeout
- `asyncio.gather(return_exceptions=True)` — one failure doesn't crash others
- Pre-cached fallback data for demo scenarios (pet tech, fintech, dev tools)
- Fallback is invisible to users — same GapCard format

## Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| `asyncio.gather()` over LangGraph | Zero framework overhead, faster, simpler |
| SSE over WebSocket | One-directional stream, works through proxies |
| MCP over REST scraping | Standardized tool protocol, session management |
| Claude Sonnet 4 | Best reasoning-to-speed ratio for real-time analysis |
| No database | Stateless per-request — no persistence needed |
| Dark-only theme | Focused design, polished aesthetic |

## License

This project is proprietary. All rights reserved.

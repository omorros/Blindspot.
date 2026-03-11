# Blindspot — PRD

## Track
**Web MCP Agents** (powered by Bright Data)

## One-Liner
A multi-agent system that autonomously identifies untapped market opportunities in any industry vertical by scraping, cross-referencing, and scoring signals from the live web.

## The Problem
VCs, product teams, and strategy consultants spend weeks manually researching market gaps. They tab between Crunchbase, Reddit, Trustpilot, job boards, and company websites trying to answer: "Where is there demand with no supply?" This process is slow, incomplete, and biased by whatever sources the researcher happens to check.

## The Solution
A coordinated team of AI agents, each specialized in a different intelligence source, that autonomously research a market vertical in parallel and synthesize their findings into scored, evidence-backed gap opportunities — all triggered by a single natural language query.

---

## User Flow

1. User types: **"Find market gaps in [industry] in [geography]"**
   - Example: "Find market gaps in pet tech in the UK"
2. The system shows a **split-pane UI**:
   - **Left:** Chat interface for input and results
   - **Right:** Real-time agent activity feed (live stream of what each agent is doing)
3. Agents run in parallel (30–60 seconds), activity feed updates in real-time with:
   - Agent-specific avatars and colors (Scout=blue, VoC=purple, Jobs=orange, Analyzer=green)
   - Pulsing dot for active agents, checkmark for completed
   - Specific progress numbers ("Scraping 3/8 company sites...")
   - Staggered 200ms event emission for visual flow
4. Results are presented as **ranked gap cards** in the chat:
   - Gap title
   - Evidence summary (sources from each agent)
   - **Confidence triangulation bars** — visual bars per agent showing signal strength
   - Confidence score (1-10, how many independent signals converge)
   - Opportunity size estimate
5. **Bright Data usage stats** displayed in footer: searches, pages scraped, agents, total time
6. User can **drill down** conversationally:
   - "Tell me more about gap #2"
   - "What are the exact complaints about pet insurance?"
   - "Which companies are closest to filling this gap?"
7. Each drill-down triggers a focused re-scrape for deeper data
8. **"Generate Investment Memo"** button reformats gap analysis into a VC-ready one-page brief with copy-to-clipboard

---

## System Architecture

### Orchestration
**`asyncio.gather()`** with `return_exceptions=True` — no framework overhead. The Coordinator is pure Python orchestration code, not an LLM agent. Each specialist agent runs as an independent async function.

```
User Query → FastAPI /analyze (SSE) → Coordinator (Python asyncio)
                                          ├─ Scout Agent ──────→ Bright Data MCP (batch search + batch scrape) → Claude (analyze) → ScoutOutput
                                          ├─ VoC Agent ────────→ Bright Data MCP (batch search + batch scrape) → Claude (analyze) → VoCOutput
                                          └─ Jobs Agent ───────→ Bright Data MCP (batch search + batch scrape) → Claude (analyze) → JobsOutput
                                          │
                                          ▼ (all 3 in parallel via asyncio.gather)
                                          Analyzer Agent ──→ Claude (cross-reference all 3) → GapCards[]
                                          │
                                          ▼
                                     SSE stream → Next.js Frontend (split-pane: chat + activity feed)
```

Each agent opens its **own** MCP session (cannot share `ClientSession` across concurrent coroutines).

### Agents

#### 1. Coordinator (Python function, not LLM)
- **Role:** Receives user query, parses industry + geography, dispatches specialists via `asyncio.gather()`, collects results, handles fallbacks, feeds Analyzer
- **Implementation:** Pure Python async function
- **Error handling:** `return_exceptions=True` — if any agent fails, substitute pre-cached fallback data and continue

#### 2. Scout Agent (Competitive Landscape)
- **Role:** Maps existing players in the market
- **Bright Data MCP tools used:**
  - `search_engine_batch` — fire 2 queries simultaneously: `"{industry} companies {geography} 2025"` + `"top {industry} startups {geography}"`
  - `scrape_batch` — scrape top 5-8 company URLs at once (homepages, pricing pages, feature pages)
- **Output:** Structured list of companies with: name, URL, product offering, pricing model, key features, founding year, estimated size
- **System prompt focus:** Identify ALL notable companies in a market segment, extract what they offer and at what price point, flag any obvious feature gaps between competitors

#### 3. Voice of Customer (VoC) Agent
- **Role:** Finds unmet customer needs and pain points
- **Bright Data MCP tools used:**
  - `search_engine_batch` — fire 2 queries: `"site:reddit.com {industry} complaints {geography}"` + `"{industry} reviews trustpilot {geography}"`
  - `scrape_batch` — scrape top 5-8 Reddit threads, Trustpilot reviews, Google Play/App Store reviews, niche forums
- **Output:** Categorized pain points with: complaint category, frequency count, representative quotes, source URLs, sentiment severity
- **System prompt focus:** Extract genuine customer frustrations and unmet needs, distinguish between one-off complaints and systemic issues, categorize pain points thematically

#### 4. Jobs Signal Agent
- **Role:** Detects where companies are investing (and where they're NOT)
- **Bright Data MCP tools used:**
  - `search_engine_batch` — fire 2 queries: `"{industry} jobs hiring {geography} 2025"` + `"{industry} job openings {geography}"`
  - `scrape_batch` — scrape top 5-8 job listing pages
- **Output:** Hiring trends: which roles are hot (everyone hiring ML engineers = AI investment), which are cold (nobody hiring logistics = underserved), companies with unusual hiring spikes
- **System prompt focus:** Analyze job postings as investment signals, identify what capabilities companies are building vs ignoring, detect hiring surges that indicate strategic pivots

#### 5. Analyzer Agent
- **Role:** Cross-references all agent outputs to identify and score gaps
- **LLM:** Claude Sonnet 4 — needs strong reasoning
- **Tools:** None (pure analysis, receives data from other agents)
- **Output:** Ranked list of market gaps (3-5), each with:
  - **Gap title** — concise name
  - **Evidence triangulation** — which agents found supporting signals and what, with per-agent signal strength
  - **Confidence score** (1-10) — based on how many independent signals converge
  - **Opportunity assessment** — estimated demand strength and competitive vacuum
  - **Risk flags** — reasons the gap might exist intentionally (regulatory, technical, etc.)
  - **Sources** — key URLs used as evidence
- **System prompt focus:** Cross-reference competitive landscape, customer complaints, and hiring signals to find mismatches. A strong gap = customers want X + no company offers X + nobody is hiring to build X. Score gaps by evidence convergence, not assumption.

---

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | Next.js 14 + Tailwind CSS | Fast to build, SSR, good streaming support |
| Real-time | Server-Sent Events (SSE) via native `EventSource` | Simpler than WebSocket, one-direction is enough for activity feed |
| Backend | Python FastAPI + `sse-starlette` | Async-native, fast, lightweight |
| Agent orchestration | `asyncio.gather()` | Zero overhead, native Python, fault-tolerant with `return_exceptions=True` |
| LLM | Claude Sonnet 4 API (`AsyncAnthropic`) | Strong reasoning for analysis, fast enough for real-time |
| Web access | Bright Data MCP Server (hosted SSE) | Reliable scraping without blocks, batch tools for speed |
| MCP client | Python `mcp` package (`sse_client` + `ClientSession`) | Official MCP client, handles SSE transport |
| Data passing | In-memory `asyncio.Queue` per request | No database needed for a hackathon demo |

---

## SSE Event Format

```json
{"type": "agent_status", "agent": "scout", "status": "searching", "message": "Searching for pet tech companies in the UK..."}
{"type": "agent_status", "agent": "voc", "status": "scraping", "message": "Scraping 5 Reddit threads about pet tech complaints..."}
{"type": "agent_status", "agent": "scout", "status": "done", "message": "Found 14 pet tech companies in the UK"}
{"type": "gap_results", "gaps": [{...GapCard objects...}]}
{"type": "stats", "searches": 12, "scrapes": 18, "agents": 3, "duration_seconds": 47}
{"type": "analysis_complete", "summary": "Found 5 market gaps with high confidence"}
```

---

## File Structure

```
blindspot/
├── backend/
│   ├── main.py              # FastAPI app, CORS, SSE /analyze endpoint, /health
│   ├── config.py             # Env vars (ANTHROPIC_API_KEY, BRIGHTDATA_TOKEN)
│   ├── coordinator.py        # asyncio.gather orchestration, fallback handling
│   ├── mcp_client.py         # Bright Data MCP wrapper (brightdata_session, mcp_search_batch, mcp_scrape_batch)
│   ├── llm.py                # AsyncAnthropic wrapper
│   ├── models.py             # Pydantic models (AgentStatusEvent, GapCard, agent outputs)
│   ├── agents/
│   │   ├── __init__.py
│   │   ├── scout.py          # Competitive landscape
│   │   ├── voc.py            # Voice of Customer
│   │   ├── jobs.py           # Hiring signals
│   │   └── analyzer.py       # Cross-reference → ranked GapCards
│   ├── fallback_data.py      # Pre-cached results for "pet tech UK" + "fintech Germany"
│   ├── requirements.txt
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx      # Split-pane: ChatPanel (55%) + ActivityFeed (45%)
│   │   │   └── globals.css
│   │   ├── components/
│   │   │   ├── ChatPanel.tsx
│   │   │   ├── ActivityFeed.tsx
│   │   │   ├── GapCard.tsx          # With triangulation bars
│   │   │   ├── ActivityItem.tsx     # With agent avatars + pulse animation
│   │   │   ├── SearchInput.tsx
│   │   │   ├── ConfidenceBadge.tsx
│   │   │   ├── InvestmentMemo.tsx   # VC-ready export view
│   │   │   └── StatsFooter.tsx      # Bright Data usage stats display
│   │   ├── hooks/
│   │   │   └── useSSE.ts           # EventSource hook, dispatches by event type
│   │   └── types/
│   │       └── index.ts
│   ├── package.json
│   ├── next.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
└── market-gap-finder-prd.md
```

---

## Pre-Build Strategy (1-2 Weeks Before)

**Goal: Arrive with 95% of the code working. Use the 90 hackathon minutes to polish, not build.**

### Week 1: Core Pipeline
- [ ] Bright Data account + API token tested
- [ ] `mcp_client.py` — MCP connection working, `search_engine_batch` and `scrape_batch` tested, `result.content` shape confirmed
- [ ] `llm.py` — Claude API working with `AsyncAnthropic`
- [ ] `models.py` — all Pydantic models defined
- [ ] `agents/scout.py` — full working agent end-to-end (the template for all others)
- [ ] `agents/voc.py` — Reddit/Trustpilot queries, full working
- [ ] `agents/jobs.py` — job board queries, full working
- [ ] `agents/analyzer.py` — cross-reference prompt iterated and tested
- [ ] `coordinator.py` — `asyncio.gather()` running all 3 specialists + Analyzer
- [ ] `main.py` — FastAPI + SSE endpoint, full pipeline streaming events

### Week 2: Frontend + Polish
- [ ] Next.js + Tailwind setup with split-pane layout
- [ ] `useSSE.ts` hook receiving and dispatching events
- [ ] `SearchInput.tsx` + `ChatPanel.tsx` — input sends query, displays gap cards
- [ ] `ActivityFeed.tsx` + `ActivityItem.tsx` — agent colors, pulse dots, staggered events
- [ ] `GapCard.tsx` + `ConfidenceBadge.tsx` — styled with triangulation bars
- [ ] `InvestmentMemo.tsx` — VC-ready one-page format with copy-to-clipboard
- [ ] `StatsFooter.tsx` — Bright Data usage numbers via `session_stats` MCP tool
- [ ] `fallback_data.py` — 2 demo scenarios cached ("pet tech UK", "fintech Germany")
- [ ] End-to-end testing with real data
- [ ] System prompt iteration for gap quality
- [ ] Demo rehearsal

### During Hackathon (90 Minutes)
| Time | Task |
|------|------|
| 0-10 min | Setup, verify tokens, smoke test end-to-end |
| 10-25 min | Adjust search queries / MCP usage based on toolkit walkthrough learnings |
| 25-50 min | Run 3+ demo scenarios, iterate on prompts for better gap quality |
| 50-65 min | Polish: activity feed messages, gap card copy, animations |
| 65-80 min | Full demo rehearsal x3, time yourself, record backup video |
| 80-90 min | Pre-warm demo query, final check |

---

## Fallback Strategy (Demo Must Never Break)

| Layer | Trigger | Action |
|-------|---------|--------|
| Timeout | MCP call >15s | Cancel, use cached data for that agent, emit subtle warning |
| Agent failure | Exception in any agent | `return_exceptions=True` → substitute pre-cached output, other agents continue |
| Full MCP outage | Connection fails on first attempt | Switch entirely to `fallback_data.py`, activity feed shows realistic events with artificial delays |
| Nuclear | Everything breaks during demo | Switch to pre-recorded screen capture made 10 min before presenting |

Fallback is **invisible** to the audience — gap cards look identical whether live or cached. Activity feed emits "Using cached intelligence for faster results" as a subtle, non-alarming message.

---

## Demo Script (3 minutes)

### Opening (15 seconds)
"Every VC in this room has spent a week tab-switching between Crunchbase, Reddit, and LinkedIn trying to answer one question: where is there demand with no supply? Blindspot answers that in 60 seconds."

### Live Demo (2 minutes)
1. Type: "Find market gaps in pet tech in the UK"
2. Point at the activity feed: "Three specialized agents running in parallel. Scout maps every competitor. VoC scrapes Reddit and Trustpilot for customer pain points. Jobs analyzes hiring patterns to see where companies invest — and where they don't."
3. Results appear. Walk through Gap #1: "Confidence 9 out of 10. Customers complain about opaque pet insurance pricing — 47 Reddit threads. Scout found 14 companies but none offer a comparison tool. Zero companies hiring comparison-engine engineers. That's a triple-confirmed gap."
4. Show the triangulation bars: "You can see exactly which signals are strong and which are weak."
5. Type a follow-up: "Dig deeper into gap #1" → Show the drill-down working.
6. Click "Generate Investment Memo" → Show the VC-ready format.
7. Point at stats footer: "12 searches, 18 pages scraped, all in under a minute."

### Close (15 seconds)
"Three agents. Parallel execution. Cross-referenced evidence. Any vertical, any geography, under a minute. This is Blindspot — built with Bright Data's Web MCP and Claude. Cherry Ventures, your analysts called — they want their weekends back."

### Why This Wins
- **For judges:** Multi-agent orchestration with evidence triangulation, not a single-agent wrapper
- **For Bright Data:** Heaviest, most creative use of their MCP in the room — batch search, batch scrape, session stats, 3 agents in parallel
- **For Cherry Ventures:** This is literally what their analysts do — you're automating their workflow, and the Investment Memo export speaks their language
- **For the audience:** The real-time activity feed with colored agents working simultaneously is visually captivating

---

## Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| Bright Data MCP is slow/rate-limited | Use batch tools for speed, pre-test query patterns, 3-layer fallback system with cached demo data |
| LLM is slow for multiple agents | Run 3 specialists in parallel (not sequential), each makes one Claude call with all scraped data at once |
| Scraping returns garbage data | Test specific sites beforehand, know which URLs produce clean scrapes, agent validates/retries, fallback data ready |
| Demo breaks live | Pre-run demo query 10 min before, screen recording as backup, invisible fallback system |
| Another team builds something similar | Your edge: evidence triangulation visualization + Investment Memo export + Bright Data stats + real-time colored activity feed. Nobody else will have all four |

---

## Stretch Goals (Only If Time Permits During Hackathon)

1. **Google Trends Agent** — 4th signal: scrape Google Trends via Bright Data for gap keywords, boost confidence if trending UP, flag if DOWN. Adds temporal dimension no other team will have.
2. **Comparison view** — run two verticals side by side ("pet tech UK vs pet tech US")
3. **PDF export** of Investment Memo
4. **Confidence score breakdown** on hover — see which signals contributed what

---

## Success Metrics (For Judging)

1. **Does it actually work live?** — The demo must run end-to-end without pre-recorded results
2. **Is the Bright Data MCP usage impressive?** — 3 agents using batch search, batch scrape, and session stats — not just one search call
3. **Is the output actionable?** — Gap cards with triangulated evidence and Investment Memo export, not vague summaries
4. **Is the UX polished?** — Split-pane, colored agent activity feed with pulse animations, smooth conversational drill-down, stats footer
5. **Can I imagine paying for this?** — Cherry Ventures should think "I want this for my team"

---

## Dependencies

**Backend (`requirements.txt`):**
```
fastapi>=0.104.0
uvicorn>=0.24.0
sse-starlette>=1.8.0
anthropic>=0.40.0
mcp>=1.0.0
python-dotenv>=1.0.0
pydantic>=2.5.0
```

**Frontend:**
```
next@14, react, react-dom, tailwindcss, typescript
```

# Market Gap Finder — PRD

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
3. Agents run in parallel (30–60 seconds), activity feed updates in real-time
4. Results are presented as **ranked gap cards** in the chat:
   - Gap title
   - Evidence summary (sources from each agent)
   - Confidence score (how many independent signals converge)
   - Opportunity size estimate
5. User can **drill down** conversationally:
   - "Tell me more about gap #2"
   - "What are the exact complaints about pet insurance?"
   - "Which companies are closest to filling this gap?"
6. Each drill-down triggers a focused re-scrape for deeper data

---

## System Architecture

### Agents

#### 1. Coordinator Agent
- **Role:** Receives user query, decomposes into research tasks, delegates to specialists, synthesizes final output
- **LLM:** Claude Sonnet (or GPT-4o)
- **Tools:** None directly — orchestrates other agents
- **System prompt focus:** Break down market research queries into parallel sub-tasks, manage agent outputs, resolve conflicts, produce structured gap analysis

#### 2. Scout Agent (Competitive Landscape)
- **Role:** Maps existing players in the market
- **Bright Data MCP tools used:**
  - `search_engine` — find companies in the vertical
  - `scrape_as_markdown` — scrape company homepages, pricing pages, feature pages
- **Output:** Structured list of companies with: name, URL, product offering, pricing model, key features, founding year, estimated size
- **System prompt focus:** Identify ALL notable companies in a market segment, extract what they offer and at what price point, flag any obvious feature gaps between competitors

#### 3. Voice of Customer (VoC) Agent
- **Role:** Finds unmet customer needs and pain points
- **Bright Data MCP tools used:**
  - `search_engine` — find relevant Reddit threads, forum posts, review sites
  - `scrape_as_markdown` — scrape Reddit posts/comments, Trustpilot reviews, Google Play/App Store reviews, niche forums
- **Output:** Categorized pain points with: complaint category, frequency count, representative quotes, source URLs, sentiment severity
- **System prompt focus:** Extract genuine customer frustrations and unmet needs, distinguish between one-off complaints and systemic issues, categorize pain points thematically

#### 4. Jobs Signal Agent
- **Role:** Detects where companies are investing (and where they're NOT)
- **Bright Data MCP tools used:**
  - `search_engine` — find job listings in the vertical
  - `scrape_as_markdown` — scrape job board listings and descriptions
- **Output:** Hiring trends: which roles are hot (everyone hiring ML engineers = AI investment), which are cold (nobody hiring logistics = underserved), companies with unusual hiring spikes
- **System prompt focus:** Analyze job postings as investment signals, identify what capabilities companies are building vs ignoring, detect hiring surges that indicate strategic pivots

#### 5. Analyzer Agent
- **Role:** Cross-references all agent outputs to identify and score gaps
- **LLM:** Claude Sonnet (or GPT-4o) — needs strong reasoning
- **Tools:** None (pure analysis, receives data from other agents)
- **Output:** Ranked list of market gaps, each with:
  - **Gap title** — concise name
  - **Evidence triangulation** — which agents found supporting signals and what
  - **Confidence score** (1-10) — based on how many independent signals converge
  - **Opportunity assessment** — estimated demand strength and competitive vacuum
  - **Risk flags** — reasons the gap might exist intentionally (regulatory, technical, etc.)
- **System prompt focus:** Cross-reference competitive landscape, customer complaints, and hiring signals to find mismatches. A strong gap = customers want X + no company offers X + nobody is hiring to build X. Score gaps by evidence convergence, not assumption.

---

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | Next.js 14 + Tailwind CSS | Fast to build, SSR, good streaming support |
| Real-time | Server-Sent Events (SSE) | Simpler than WebSocket, one-direction is enough for activity feed |
| Backend | Python FastAPI | Async-native, fast, lightweight |
| Agent orchestration | LangGraph | Built for multi-agent state machines, handles parallel execution |
| LLM | Claude Sonnet 4 API (or GPT-4o) | Strong reasoning for analysis, fast enough for real-time |
| Web access | Bright Data MCP Server | The whole point — reliable scraping without blocks |
| Data passing | In-memory (Python dicts) | No database needed for a hackathon demo |

---

## Pre-Build Checklist (Before the Hackathon)

### Must Have Ready
- [ ] Bright Data account + API token tested
- [ ] MCP connection working — can search and scrape from Python
- [ ] FastAPI backend skeleton with SSE endpoint for streaming agent activity
- [ ] Next.js frontend with split-pane layout (chat left, activity feed right)
- [ ] SSE connection working between frontend and backend
- [ ] LangGraph agent graph skeleton — coordinator + 4 agents defined with placeholder prompts
- [ ] Basic message flow: user sends chat → backend receives → agents trigger → results stream back

### Prepare During Hackathon
- [ ] Fine-tune all 5 agent system prompts
- [ ] Wire up specific Bright Data MCP tool calls per agent
- [ ] Build the gap card UI component (title, evidence, score)
- [ ] Implement drill-down follow-up flow
- [ ] Test and rehearse 2-3 demo scenarios
- [ ] Polish activity feed messages to be engaging ("Scout Agent: Found 14 pet tech companies in the UK...")

### Nice-to-Have (If Time Permits)
- [ ] Export gap analysis as PDF
- [ ] Comparison view across multiple verticals
- [ ] Visualization of competitive landscape (simple chart)
- [ ] Confidence score breakdown (hover to see which signals contributed)

---

## Demo Script (3 minutes)

### Opening (15 seconds)
"Market research takes weeks. We built a team of AI agents that does it in 60 seconds. Let me show you."

### Live Demo (2 minutes)
1. Type: "Find market gaps in pet tech in the UK"
2. Point at the activity feed: "Each agent is specialized. Scout is mapping the competitive landscape. VoC is scraping customer complaints from Reddit and Trustpilot. Jobs is analyzing where companies are investing."
3. Results appear. Walk through Gap #1: "Look — customers are complaining about X, but none of the 14 companies we found actually offer it. And nobody is hiring for it either. That's a triple-confirmed gap."
4. Type a follow-up: "Dig deeper into gap #1" → Show the drill-down working.

### Close (30 seconds)
"Three agents. Parallel execution. Cross-referenced evidence. What took a strategy consultant a week, this does in under a minute. And it works for any vertical — fintech, edtech, healthtech — just ask."

### Why This Wins
- **For judges:** Multi-agent orchestration, not a single-agent wrapper
- **For Bright Data:** Heaviest, most creative use of their MCP in the room
- **For Cherry Ventures:** This is literally what their analysts do — you're automating their workflow
- **For the audience:** The real-time activity feed is visually captivating

---

## Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| Bright Data MCP is slow/rate-limited | Pre-test query patterns, cache results for demo scenarios, have fallback demo data |
| LLM is slow for 5 agents | Run specialist agents in parallel (not sequential), use faster model for specialists, stronger model only for Analyzer |
| Scraping returns garbage data | Test specific sites beforehand, know which URLs produce clean scrapes, have the agent validate/retry |
| Demo breaks live | Pre-run the exact demo query 10 minutes before presenting, have a screen recording as backup |
| Another team builds something similar | Your edge is the cross-referencing Analyzer + real-time activity feed + conversational drill-down. Nobody else will have all three |

---

## Project Name Candidates
- **GapFinder** (clean, obvious)
- **Whitespace** (the VC term for market gaps)
- **Blindspot** (what the tool reveals)
- **Uncharted** (discovery framing)

---

## Success Metrics (For Judging)

1. **Does it actually work live?** — The demo must run end-to-end without pre-recorded results
2. **Is the Bright Data MCP usage impressive?** — Multiple agents, multiple scraping patterns, not just one search call
3. **Is the output actionable?** — Gap cards with evidence, not vague summaries
4. **Is the UX polished?** — Split-pane, real-time feed, smooth conversational flow
5. **Can I imagine paying for this?** — Cherry Ventures should think "I want this for my team"

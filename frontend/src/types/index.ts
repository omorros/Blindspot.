/* ── Types matching the backend models ─────────────────
 *
 * These mirror the Pydantic models in backend/models.py.
 * When the backend sends JSON via SSE, we parse it into these types.
 */

export type AgentName = "scout" | "voc" | "jobs" | "analyzer" | "coordinator";

/** A single event in the activity feed */
export interface Activity {
  agent: AgentName;
  message: string;
  timestamp: number; // added client-side via Date.now()
}

/** One piece of supporting evidence for a gap */
export interface EvidenceSource {
  title: string;
  url: string;
  snippet: string;
}

/** How strongly each agent's data supports a gap */
export interface TriangulationSignal {
  source: string; // "scout" | "voc" | "jobs"
  strength: number; // 0–1
  label: string; // "Strong signal", "Moderate signal", "Weak signal"
  detail: string; // "0/14 competitors", "47 complaints", etc.
}

/** A discovered market gap — the main output */
export interface GapCard {
  id: number;
  title: string;
  description: string;
  confidence: number; // 0–10
  opportunity_size: string; // "Small" | "Medium" | "Large"
  evidence: EvidenceSource[];
  triangulation: TriangulationSignal[];
  risk_flags: string[];
}

/** Bright Data usage statistics */
export interface Stats {
  searches: number;
  scrapes: number;
  agents: number;
  duration_seconds: number;
}

/** High-level analysis summary */
export interface Summary {
  market_summary: string;
  companies_found: number;
  complaints_found: number;
  jobs_analyzed: number;
  total_gaps: number;
}

/** Agent display config — colors, icons, labels */
export const AGENT_CONFIG: Record<
  AgentName,
  { color: string; bg: string; icon: string; label: string }
> = {
  scout: {
    color: "text-blue-400",
    bg: "bg-blue-500",
    icon: "\uD83D\uDD0D",
    label: "Scout",
  },
  voc: {
    color: "text-violet-400",
    bg: "bg-violet-500",
    icon: "\uD83D\uDCAC",
    label: "VoC",
  },
  jobs: {
    color: "text-amber-400",
    bg: "bg-amber-500",
    icon: "\uD83D\uDCBC",
    label: "Jobs",
  },
  analyzer: {
    color: "text-emerald-400",
    bg: "bg-emerald-500",
    icon: "\uD83E\uDDE0",
    label: "Analyzer",
  },
  coordinator: {
    color: "text-neutral-400",
    bg: "bg-neutral-500",
    icon: "\u2699\uFE0F",
    label: "Blindspot",
  },
};

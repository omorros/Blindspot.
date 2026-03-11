/**
 * StatsFooter — Shows Bright Data usage statistics.
 *
 * This is Improvement 3 from the plan. A small footer bar that shows:
 *   Bright Data: 12 searches | 18 pages scraped | 3 agents | 47s total
 *
 * WHY THIS EXISTS:
 * Bright Data is judging. This makes their product usage VISIBLE.
 * No other team will think to show this — it's a subtle signal that
 * we understand and appreciate the sponsor's product.
 */
"use client";

import type { Stats } from "@/types";

interface Props {
  stats: Stats;
}

export default function StatsFooter({ stats }: Props) {
  return (
    <footer className="flex-none border-t border-neutral-800 bg-neutral-950 px-6 py-2.5 animate-fade_in">
      <div className="flex items-center justify-center gap-1.5 text-xs text-neutral-500">
        <span className="font-medium text-neutral-400">Powered by Bright Data</span>
        <span>&middot;</span>
        <span>{stats.searches} searches</span>
        <span>&middot;</span>
        <span>{stats.scrapes} pages scraped</span>
        <span>&middot;</span>
        <span>{stats.agents} agents</span>
        <span>&middot;</span>
        <span>{stats.duration_seconds}s</span>
      </div>
    </footer>
  );
}

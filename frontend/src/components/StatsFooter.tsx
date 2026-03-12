"use client";

import type { Stats } from "@/types";

interface Props {
  stats: Stats;
}

export default function StatsFooter({ stats }: Props) {
  return (
    <footer className="flex-none border-t border-[var(--border-subtle)] px-6 py-2.5 animate-fade_in">
      <div className="flex items-center justify-center gap-5 text-[11px] text-[var(--text-muted)]">
        <span className="text-[var(--text-tertiary)] font-medium">Bright Data</span>
        <span className="text-[var(--border)]">&bull;</span>
        <span>{stats.searches} searches</span>
        <span className="text-[var(--border)]">&bull;</span>
        <span>{stats.scrapes} scraped</span>
        <span className="text-[var(--border)]">&bull;</span>
        <span>{stats.agents} agents</span>
        <span className="text-[var(--border)]">&bull;</span>
        <span>{stats.duration_seconds}s</span>
      </div>
    </footer>
  );
}

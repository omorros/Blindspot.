"use client";

import type { Stats } from "@/types";

interface Props {
  stats: Stats;
}

export default function StatsFooter({ stats }: Props) {
  return (
    <footer className="flex-none border-t border-neutral-800/40 px-6 py-2 animate-fade_in">
      <div className="flex items-center justify-center gap-4 text-[10px] text-neutral-700 tracking-wide">
        <span>bright data</span>
        <span className="text-neutral-800">/</span>
        <span>{stats.searches} searches</span>
        <span className="text-neutral-800">/</span>
        <span>{stats.scrapes} scraped</span>
        <span className="text-neutral-800">/</span>
        <span>{stats.agents} agents</span>
        <span className="text-neutral-800">/</span>
        <span>{stats.duration_seconds}s</span>
      </div>
    </footer>
  );
}

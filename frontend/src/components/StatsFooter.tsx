"use client";

import type { Stats } from "@/types";
import { NumberTicker } from "@/components/ui/number-ticker";
import { BlurFade } from "@/components/ui/blur-fade";

interface Props {
  stats: Stats;
}

export default function StatsFooter({ stats }: Props) {
  return (
    <BlurFade delay={0} duration={0.3}>
      <footer className="flex-none border-t border-[var(--border-subtle)] px-6 py-2.5">
        <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)]">
          {/* Powered by badges */}
          <div className="flex items-center gap-3">
            <span className="text-[10px] uppercase tracking-[0.1em] text-[var(--text-muted)]">Powered by</span>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md border border-[var(--border-subtle)] bg-[var(--surface-raised)]/50">
              <svg className="w-3 h-3 text-[#cc785c]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
              </svg>
              <span className="text-[10px] font-medium text-[var(--text-tertiary)]">Bright Data</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md border border-[var(--border-subtle)] bg-[var(--surface-raised)]/50">
              <svg className="w-3 h-3 text-[#cc785c]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4.709 15.955l4.397-2.006a.4.4 0 01.543.188l.932 1.907a.4.4 0 01-.183.541l-4.397 2.006a.4.4 0 01-.543-.188l-.932-1.907a.4.4 0 01.183-.541z"/>
                <path d="M12.282 3.5c-4.043 0-7.32 3.278-7.32 7.32 0 1.621.527 3.12 1.42 4.334l1.1-.502a6.055 6.055 0 01-1.26-3.832c0-3.35 2.71-6.06 6.06-6.06s6.06 2.71 6.06 6.06-2.71 6.06-6.06 6.06a6.032 6.032 0 01-2.686-.63l-1.1.502a7.276 7.276 0 003.786 1.388v1.36h1.26v-1.36c4.043-.37 7.32-3.278 7.32-7.32 0-4.043-3.278-7.32-7.32-7.32h-.26z"/>
              </svg>
              <span className="text-[10px] font-medium text-[var(--text-tertiary)]">Claude</span>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4">
            <span>
              <NumberTicker value={stats.searches} className="text-[var(--text-secondary)] text-[11px]" />{" "}searches
            </span>
            <span className="text-[var(--border)]">&bull;</span>
            <span>
              <NumberTicker value={stats.scrapes} className="text-[var(--text-secondary)] text-[11px]" />{" "}scraped
            </span>
            <span className="text-[var(--border)]">&bull;</span>
            <span>
              <NumberTicker value={stats.agents} className="text-[var(--text-secondary)] text-[11px]" />{" "}agents
            </span>
            <span className="text-[var(--border)]">&bull;</span>
            <span>
              <NumberTicker value={stats.duration_seconds} decimalPlaces={1} className="text-[var(--text-secondary)] text-[11px]" />s
            </span>
          </div>
        </div>
      </footer>
    </BlurFade>
  );
}

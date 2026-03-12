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
        <div className="flex items-center justify-center gap-5 text-[11px] text-[var(--text-muted)]">
          <span className="text-[var(--text-tertiary)] font-medium">Bright Data</span>
          <span className="text-[var(--border)]">&bull;</span>
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
      </footer>
    </BlurFade>
  );
}

"use client";

import { useState } from "react";
import type { GapCard } from "@/types";
import { AGENT_CONFIG } from "@/types";

interface Props {
  gap: GapCard;
  rank: number;
}

export default function GapCardComponent({ gap, rank }: Props) {
  const [expanded, setExpanded] = useState(rank === 1);

  const scoreColor =
    gap.confidence >= 8
      ? "text-emerald-400"
      : gap.confidence >= 5
        ? "text-amber-400"
        : "text-red-400";

  const scoreBg =
    gap.confidence >= 8
      ? "bg-emerald-500/10 border-emerald-500/20"
      : gap.confidence >= 5
        ? "bg-amber-500/10 border-amber-500/20"
        : "bg-red-500/10 border-red-500/20";

  return (
    <div className="gap-card rounded-lg border border-[var(--border)] bg-[var(--surface-raised)] overflow-hidden">
      {/* Card Header — always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-5 py-4 flex items-start gap-4 text-left group"
      >
        {/* Rank number */}
        <span className="flex-none w-8 h-8 rounded-md bg-[var(--surface-overlay)] border border-[var(--border-subtle)]
                        flex items-center justify-center text-sm font-medium text-[var(--text-muted)] mt-0.5">
          {rank}
        </span>

        {/* Title + preview */}
        <div className="flex-1 min-w-0">
          <h3 className="font-serif text-base text-[var(--text-primary)] group-hover:text-white transition-colors leading-snug">
            {gap.title}
          </h3>
          {!expanded && (
            <p className="text-xs text-[var(--text-muted)] mt-1.5 line-clamp-2 leading-relaxed">
              {gap.description}
            </p>
          )}
        </div>

        {/* Score + size */}
        <div className="flex-none flex items-center gap-3 mt-0.5">
          <span className="text-[11px] uppercase tracking-wider text-[var(--text-muted)]">
            {gap.opportunity_size}
          </span>
          <span className={`text-sm font-medium tabular-nums px-2 py-0.5 rounded border ${scoreColor} ${scoreBg}`}>
            {gap.confidence.toFixed(1)}
          </span>
        </div>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="px-5 pb-5 border-t border-[var(--border-subtle)]">
          {/* Description */}
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed mt-4">
            {gap.description}
          </p>

          {/* Triangulation — Signal Strength */}
          {gap.triangulation?.length > 0 && (
            <div className="mt-5">
              <p className="text-[10px] uppercase tracking-[0.15em] text-[var(--text-muted)] font-medium mb-3">
                Evidence Triangulation
              </p>
              <div className="space-y-2.5">
                {gap.triangulation.map((signal) => {
                  const agentKey = signal.source as keyof typeof AGENT_CONFIG;
                  const config = AGENT_CONFIG[agentKey] || AGENT_CONFIG.coordinator;
                  const pct = Math.round(signal.strength * 100);

                  return (
                    <div key={signal.source} className="flex items-center gap-3">
                      <span className={`text-[11px] font-medium w-12 flex-none ${config.color}`}>
                        {config.label}
                      </span>
                      <div className="flex-1 h-1.5 bg-[var(--surface-overlay)] rounded-full max-w-[300px] relative overflow-hidden">
                        <div
                          className={`absolute top-0 left-0 h-full rounded-full tri-bar ${config.bg}`}
                          style={{ width: `${pct}%`, opacity: 0.7 }}
                        />
                      </div>
                      <span className="text-[11px] text-[var(--text-tertiary)] flex-shrink-0 max-w-[220px] truncate">
                        {signal.detail}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Sources */}
          {gap.evidence?.length > 0 && (
            <div className="mt-5">
              <p className="text-[10px] uppercase tracking-[0.15em] text-[var(--text-muted)] font-medium mb-2.5">
                Sources
              </p>
              <div className="space-y-1.5">
                {gap.evidence.map((source, i) => (
                  <a
                    key={i}
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-xs text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors leading-relaxed"
                  >
                    <span className="text-[var(--text-secondary)]">{source.title}</span>
                    {source.snippet && (
                      <>
                        <span className="text-[var(--text-muted)] mx-1">&mdash;</span>
                        <span>{source.snippet}</span>
                      </>
                    )}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Risks */}
          {gap.risk_flags?.length > 0 && (
            <div className="mt-5">
              <p className="text-[10px] uppercase tracking-[0.15em] text-[var(--text-muted)] font-medium mb-2.5">
                Risk Flags
              </p>
              <div className="space-y-1.5">
                {gap.risk_flags.map((risk, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-amber-500 text-xs mt-0.5 flex-none">!</span>
                    <p className="text-xs text-[var(--text-tertiary)] leading-relaxed">{risk}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

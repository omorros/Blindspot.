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
        : "text-neutral-500";

  return (
    <div className="border-b border-neutral-800/50 last:border-b-0">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full py-5 flex items-start gap-4 text-left group"
      >
        <span className="flex-none text-[11px] text-neutral-700 tabular-nums mt-0.5">
          {String(rank).padStart(2, "0")}
        </span>

        <div className="flex-1 min-w-0">
          <h3 className="font-serif text-[15px] text-neutral-100 group-hover:text-white transition-colors leading-snug">
            {gap.title}
          </h3>
          {!expanded && (
            <p className="text-[11px] text-neutral-600 mt-1.5 line-clamp-1">
              {gap.description}
            </p>
          )}
        </div>

        <div className="flex-none flex items-center gap-4 mt-0.5">
          <span className="text-[9px] uppercase tracking-[0.15em] text-neutral-700">
            {gap.opportunity_size}
          </span>
          <span className={`text-[13px] font-medium tabular-nums ${scoreColor}`}>
            {gap.confidence.toFixed(1)}
          </span>
        </div>
      </button>

      {expanded && (
        <div className="pl-10 pb-6 pr-4 space-y-5">
          <p className="text-[12px] text-neutral-400 leading-[1.75] max-w-xl">
            {gap.description}
          </p>

          {/* Triangulation */}
          {gap.triangulation?.length > 0 && (
            <div>
              <p className="text-[9px] uppercase tracking-[0.2em] text-neutral-700 mb-3">
                Signal
              </p>
              <div className="space-y-2.5">
                {gap.triangulation.map((signal) => {
                  const agentKey = signal.source as keyof typeof AGENT_CONFIG;
                  const config = AGENT_CONFIG[agentKey] || AGENT_CONFIG.coordinator;
                  const pct = Math.round(signal.strength * 100);

                  return (
                    <div key={signal.source} className="flex items-center gap-3">
                      <span className="text-[10px] text-neutral-600 w-8">
                        {config.label}
                      </span>
                      <div className="flex-1 h-px bg-neutral-800 max-w-[180px] relative">
                        <div
                          className="absolute top-0 left-0 h-px tri-bar bg-neutral-400"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-neutral-700 flex-shrink-0 max-w-[200px] truncate">
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
            <div>
              <p className="text-[9px] uppercase tracking-[0.2em] text-neutral-700 mb-2">
                Sources
              </p>
              {gap.evidence.map((source, i) => (
                <a
                  key={i}
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-[11px] py-0.5 text-neutral-600 hover:text-neutral-200 transition-colors"
                >
                  {source.title}
                  <span className="text-neutral-800"> / </span>
                  <span className="text-neutral-700">{source.snippet}</span>
                </a>
              ))}
            </div>
          )}

          {/* Risks */}
          {gap.risk_flags?.length > 0 && (
            <div>
              <p className="text-[9px] uppercase tracking-[0.2em] text-neutral-700 mb-2">
                Risks
              </p>
              {gap.risk_flags.map((risk, i) => (
                <p key={i} className="text-[11px] text-neutral-600 py-0.5">
                  {risk}
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

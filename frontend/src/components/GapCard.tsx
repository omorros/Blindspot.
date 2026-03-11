/**
 * GapCard — Displays a single market gap with all its evidence.
 *
 * This is the main output component. Each card shows:
 * 1. Title + confidence badge + opportunity size
 * 2. Description
 * 3. Triangulation bars — visual proof that multiple agents agree
 * 4. Evidence sources — clickable links to real data
 * 5. Risk flags — things that could go wrong
 *
 * The triangulation bars are the KEY differentiator:
 *   Scout  ●━━━━━━━━━━● Strong signal (0/14 competitors)
 *   VoC    ●━━━━━━━━━━● Strong signal (47 complaints)
 *   Jobs   ●━━━━━━━●   Moderate signal (2 related roles)
 *
 * Three colored bars. If all three are long/green = high confidence.
 */
"use client";

import { useState } from "react";
import type { GapCard } from "@/types";
import { AGENT_CONFIG } from "@/types";
import ConfidenceBadge from "./ConfidenceBadge";

interface Props {
  gap: GapCard;
  rank: number;
}

export default function GapCardComponent({ gap, rank }: Props) {
  const [expanded, setExpanded] = useState(rank === 1); // First card starts open

  const sizeColor =
    gap.opportunity_size === "Large"
      ? "text-emerald-400 bg-emerald-950/50"
      : gap.opportunity_size === "Medium"
        ? "text-amber-400 bg-amber-950/50"
        : "text-neutral-400 bg-neutral-800";

  return (
    <div className="bg-neutral-800/50 rounded-lg border border-neutral-700 overflow-hidden">
      {/* Header — always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-5 py-4 flex items-start gap-4 text-left hover:bg-neutral-800 transition-colors"
      >
        {/* Rank number */}
        <span className="flex-none text-xs font-medium text-neutral-500 mt-1">
          #{rank}
        </span>

        {/* Title + description preview */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-white leading-snug">
            {gap.title}
          </h3>
          {!expanded && (
            <p className="text-xs text-neutral-400 mt-1 truncate">
              {gap.description}
            </p>
          )}
        </div>

        {/* Right side: badge + size */}
        <div className="flex-none flex items-center gap-2.5">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${sizeColor}`}>
            {gap.opportunity_size}
          </span>
          <ConfidenceBadge score={gap.confidence} />
        </div>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="px-5 pb-5 space-y-4 border-t border-neutral-700">
          {/* Description */}
          <p className="text-sm text-neutral-300 leading-relaxed pt-4">
            {gap.description}
          </p>

          {/* Triangulation Bars */}
          {gap.triangulation && gap.triangulation.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-2.5">
                Evidence Triangulation
              </h4>
              <div className="space-y-2">
                {gap.triangulation.map((signal) => {
                  const agentKey = signal.source as keyof typeof AGENT_CONFIG;
                  const config = AGENT_CONFIG[agentKey] || AGENT_CONFIG.coordinator;
                  const widthPercent = Math.round(signal.strength * 100);

                  return (
                    <div key={signal.source} className="flex items-center gap-3">
                      <span className={`text-xs font-medium w-12 ${config.color}`}>
                        {config.label}
                      </span>
                      <div className="flex-1 h-2 bg-neutral-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full tri-bar ${config.bg}`}
                          style={{ width: `${widthPercent}%`, opacity: 0.8 }}
                        />
                      </div>
                      <span className="text-xs text-neutral-400 w-40 text-right truncate">
                        {signal.detail}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Evidence Sources */}
          {gap.evidence && gap.evidence.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-2">
                Sources
              </h4>
              <div className="space-y-1.5">
                {gap.evidence.map((source, i) => (
                  <a
                    key={i}
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-xs group"
                  >
                    <span className="text-neutral-200 group-hover:text-blue-400 transition-colors">
                      {source.title}
                    </span>
                    <span className="text-neutral-500 ml-1">
                      — {source.snippet}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Risk Flags */}
          {gap.risk_flags && gap.risk_flags.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-2">
                Risk Flags
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {gap.risk_flags.map((risk, i) => (
                  <span
                    key={i}
                    className="text-xs px-2 py-1 rounded-md bg-red-950/50 text-red-400"
                  >
                    {risk}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

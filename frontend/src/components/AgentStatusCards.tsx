"use client";

import type { Activity } from "@/types";
import { AGENT_CONFIG, type AgentName } from "@/types";
import { BorderBeam } from "@/components/ui/border-beam";

interface Props {
  activities: Activity[];
  isLoading: boolean;
}

const AGENTS: AgentName[] = ["scout", "voc", "jobs"];

const AGENT_DESCRIPTIONS: Record<string, string> = {
  scout: "Competitive landscape",
  voc: "Customer pain points",
  jobs: "Hiring signals",
};

const AGENT_BEAM_COLORS: Record<string, { from: string; to: string }> = {
  scout: { from: "#60a5fa", to: "#3b82f6" },
  voc: { from: "#a78bfa", to: "#8b5cf6" },
  jobs: { from: "#fbbf24", to: "#f59e0b" },
};

export default function AgentStatusCards({ activities, isLoading }: Props) {
  function getAgentState(agent: AgentName) {
    const agentActivities = activities.filter((a) => a.agent === agent);
    const latest = agentActivities[agentActivities.length - 1];
    const messageCount = agentActivities.length;

    const doneKeywords = ["Mapped", "Identified", "Analyzed", "cached", "error"];
    const isDone = latest
      ? doneKeywords.some((kw) => latest.message.includes(kw)) || !isLoading
      : false;
    const isActive = latest && !isDone && isLoading;
    const isWaiting = !latest && isLoading;

    return { latest, messageCount, isDone, isActive, isWaiting };
  }

  if (activities.length === 0 && !isLoading) return null;

  return (
    <div className="space-y-2">
      {AGENTS.map((agent) => {
        const config = AGENT_CONFIG[agent];
        const state = getAgentState(agent);
        const beamColors = AGENT_BEAM_COLORS[agent];

        return (
          <div
            key={agent}
            className={`relative rounded-xl overflow-hidden border px-4 py-3 transition-all duration-300 ${
              state.isDone
                ? "border-emerald-500/20 bg-emerald-500/5"
                : state.isActive
                  ? "border-[var(--border)] bg-[var(--surface-raised)]"
                  : "border-[var(--border-subtle)] bg-[var(--surface)]"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {/* Status indicator */}
                <div
                  className={`w-1.5 h-1.5 rounded-full flex-none transition-all duration-300 ${
                    state.isDone
                      ? "bg-emerald-500"
                      : state.isActive
                        ? `${config.bg} animate-pulse_dot`
                        : "bg-[var(--text-muted)]/30"
                  }`}
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-[var(--text-primary)]">
                      {config.label}
                    </span>
                    <span className="text-[11px] text-[var(--text-muted)]">
                      {AGENT_DESCRIPTIONS[agent]}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {state.isActive && (
                  <span className="text-[11px] text-[var(--text-muted)] tabular-nums">
                    {state.messageCount} steps
                  </span>
                )}
                {state.isDone && (
                  <span className="text-[11px] text-emerald-500 font-medium">Complete</span>
                )}
                {state.isWaiting && (
                  <span className="text-[11px] text-[var(--text-muted)]">Waiting...</span>
                )}
              </div>
            </div>

            {/* Latest message */}
            {state.latest && (
              <p className="text-[11px] text-[var(--text-tertiary)] mt-1.5 pl-4 truncate">
                {state.latest.message}
              </p>
            )}

            {/* Active border beam */}
            {state.isActive && (
              <BorderBeam
                size={60}
                duration={3}
                colorFrom={beamColors.from}
                colorTo={beamColors.to}
                borderWidth={1}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

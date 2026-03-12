"use client";

import type { Activity } from "@/types";
import { AGENT_CONFIG, type AgentName } from "@/types";

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

        return (
          <div
            key={agent}
            className={`rounded-lg border px-4 py-3 transition-all duration-300 ${
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
                  className={`w-2 h-2 rounded-full flex-none ${
                    state.isDone
                      ? "bg-emerald-500"
                      : state.isActive
                        ? `${config.bg} animate-pulse_dot`
                        : "bg-[var(--text-muted)]/40"
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
              <p className="text-[11px] text-[var(--text-tertiary)] mt-1.5 pl-[18px] truncate">
                {state.latest.message}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

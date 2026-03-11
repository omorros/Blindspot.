"use client";

import type { Activity } from "@/types";
import { AGENT_CONFIG, type AgentName } from "@/types";

interface Props {
  activities: Activity[];
  isLoading: boolean;
}

const AGENTS: AgentName[] = ["scout", "voc", "jobs"];

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
    <div className="grid grid-cols-3 gap-px bg-neutral-800/40 border border-neutral-800/40">
      {AGENTS.map((agent) => {
        const config = AGENT_CONFIG[agent];
        const state = getAgentState(agent);

        return (
          <div
            key={agent}
            className={`bg-[#0a0a0a] px-3 py-2.5 transition-all duration-500 ${
              state.isActive ? "bg-neutral-900/80" : ""
            }`}
          >
            {/* Agent name + status */}
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <div
                  className={`w-1 h-1 rounded-full ${
                    state.isDone
                      ? "bg-emerald-500"
                      : state.isActive
                        ? `${config.bg} animate-pulse_dot`
                        : "bg-neutral-800"
                  }`}
                />
                <span className="text-[10px] uppercase tracking-[0.12em] text-neutral-500">
                  {config.label}
                </span>
              </div>
              {state.isDone && (
                <span className="text-[9px] text-emerald-600">done</span>
              )}
              {state.isActive && (
                <span className="text-[9px] text-neutral-700">{state.messageCount}</span>
              )}
            </div>

            {/* Latest message */}
            <p className="text-[10px] text-neutral-600 truncate leading-relaxed h-3.5">
              {state.latest?.message || (state.isWaiting ? "..." : "")}
            </p>
          </div>
        );
      })}
    </div>
  );
}

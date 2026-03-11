"use client";

import type { Activity } from "@/types";
import { AGENT_CONFIG, type AgentName } from "@/types";

interface Props {
  activities: Activity[];
  isLoading: boolean;
}

const AGENTS: AgentName[] = ["scout", "voc", "jobs"];

export default function AgentStatusCards({ activities, isLoading }: Props) {
  // Get the latest message and completion status for each agent
  function getAgentState(agent: AgentName) {
    const agentActivities = activities.filter((a) => a.agent === agent);
    const latest = agentActivities[agentActivities.length - 1];
    const messageCount = agentActivities.length;

    // Agent is "done" if it has messages and the analysis is no longer loading,
    // or if its last message indicates completion (contains "Mapped", "Identified", "Analyzed")
    const doneKeywords = ["Mapped", "Identified", "Analyzed", "cached", "error"];
    const isDone = latest
      ? doneKeywords.some((kw) => latest.message.includes(kw)) || !isLoading
      : false;

    // Agent is "active" if it has messages and isn't done
    const isActive = latest && !isDone && isLoading;

    // Agent is "waiting" if analysis is loading but no messages yet
    const isWaiting = !latest && isLoading;

    return { latest, messageCount, isDone, isActive, isWaiting };
  }

  // Don't show cards until analysis starts
  if (activities.length === 0 && !isLoading) return null;

  return (
    <div className="space-y-2">
      {AGENTS.map((agent) => {
        const config = AGENT_CONFIG[agent];
        const state = getAgentState(agent);

        return (
          <div
            key={agent}
            className={`rounded-lg border px-3.5 py-2.5 transition-all duration-300 ${
              state.isDone
                ? "border-neutral-700/50 bg-neutral-800/30"
                : state.isActive
                  ? "border-neutral-600 bg-neutral-800/60"
                  : "border-neutral-800 bg-neutral-800/20"
            }`}
          >
            <div className="flex items-center justify-between">
              {/* Left: dot + name */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <div
                    className={`w-2 h-2 rounded-full ${config.bg} ${
                      state.isActive ? "animate-pulse_dot" : ""
                    } ${state.isDone ? "opacity-50" : ""}`}
                  />
                  {/* Ping ring for active agents */}
                  {state.isActive && (
                    <div
                      className={`absolute inset-0 w-2 h-2 rounded-full ${config.bg} animate-ping opacity-30`}
                    />
                  )}
                </div>
                <span className={`text-xs font-medium ${config.color}`}>
                  {config.label}
                </span>
              </div>

              {/* Right: status indicator */}
              <div className="flex items-center gap-1.5">
                {state.isDone && (
                  <svg
                    className="w-3.5 h-3.5 text-emerald-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
                {state.isActive && (
                  <span className="text-[10px] text-neutral-500">
                    {state.messageCount} steps
                  </span>
                )}
                {state.isWaiting && (
                  <span className="text-[10px] text-neutral-600">
                    waiting...
                  </span>
                )}
              </div>
            </div>

            {/* Latest message */}
            {state.latest && (
              <p className="text-[11px] text-neutral-400 mt-1 truncate leading-relaxed">
                {state.latest.message}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

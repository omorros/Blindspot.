/**
 * ActivityItem — A single row in the activity feed.
 *
 * Each agent has its own color and icon:
 * - Scout (blue magnifying glass): competitive research
 * - VoC (purple speech bubble): customer complaints
 * - Jobs (orange briefcase): hiring signals
 * - Analyzer (green brain): cross-referencing
 * - Coordinator (gray gear): orchestration
 *
 * Active agents show a pulsing dot. Completed ones show a static dot.
 */
"use client";

import type { Activity } from "@/types";
import { AGENT_CONFIG } from "@/types";

interface Props {
  activity: Activity;
  isLatest: boolean; // true for the most recent activity — shows pulsing dot
}

export default function ActivityItem({ activity, isLatest }: Props) {
  const config = AGENT_CONFIG[activity.agent] || AGENT_CONFIG.coordinator;

  return (
    <div className="flex items-start gap-2.5 py-1.5 animate-slide_up">
      {/* Agent dot — pulses if this is the latest event */}
      <div className="flex-none mt-1.5">
        <div
          className={`w-2 h-2 rounded-full ${config.bg} ${
            isLatest ? "animate-pulse_dot" : ""
          }`}
        />
      </div>

      {/* Message */}
      <div className="min-w-0">
        <span className={`text-xs font-medium ${config.color}`}>
          {config.label}
        </span>
        <p className="text-xs text-neutral-400 leading-relaxed">
          {activity.message}
        </p>
      </div>
    </div>
  );
}

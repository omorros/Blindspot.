"use client";

import type { Activity } from "@/types";
import { AGENT_CONFIG } from "@/types";

interface Props {
  activity: Activity;
  isLatest: boolean;
}

export default function ActivityItem({ activity, isLatest }: Props) {
  const config = AGENT_CONFIG[activity.agent] || AGENT_CONFIG.coordinator;

  return (
    <div className="flex items-start gap-2.5 py-1 animate-slide_up">
      <div
        className={`flex-none w-1.5 h-1.5 rounded-full mt-[5px] ${config.bg} ${
          isLatest ? "animate-pulse_dot" : "opacity-30"
        }`}
      />
      <p className="text-xs text-[var(--text-tertiary)] leading-relaxed">
        <span className={`${config.color} font-medium`}>{config.label}</span>
        <span className="text-[var(--text-muted)] mx-1.5">&middot;</span>
        <span>{activity.message}</span>
      </p>
    </div>
  );
}

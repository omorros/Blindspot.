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
    <div className="flex items-center gap-2 py-0.5 animate-slide_up">
      <div
        className={`flex-none w-1.5 h-1.5 rounded-full ${config.bg} ${
          isLatest ? "animate-pulse_dot" : "opacity-40"
        }`}
      />
      <p className="text-[11px] text-neutral-500 truncate">
        <span className={`${config.color} font-medium`}>{config.label}</span>
        {" "}
        {activity.message}
      </p>
    </div>
  );
}

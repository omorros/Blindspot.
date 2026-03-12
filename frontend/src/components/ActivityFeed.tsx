"use client";

import { useEffect, useRef } from "react";
import type { Activity } from "@/types";
import ActivityItem from "./ActivityItem";

interface Props {
  activities: Activity[];
  isLoading: boolean;
}

export default function ActivityFeed({ activities, isLoading }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Always scroll to bottom when new activities arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [activities]);

  return (
    <div
      ref={scrollRef}
      className="h-full overflow-y-auto activity-scroll px-5 pb-4 space-y-0"
    >
      {activities.map((activity, i) => (
        <ActivityItem
          key={`${activity.timestamp}-${i}`}
          activity={activity}
          isLatest={i === activities.length - 1 && isLoading}
        />
      ))}

      {isLoading && (
        <div className="flex items-center gap-1.5 pt-1.5 pl-0.5">
          <div className="w-1 h-1 rounded-full bg-neutral-600 animate-bounce" style={{ animationDelay: "0ms" }} />
          <div className="w-1 h-1 rounded-full bg-neutral-600 animate-bounce" style={{ animationDelay: "150ms" }} />
          <div className="w-1 h-1 rounded-full bg-neutral-600 animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      )}

      {/* Scroll anchor */}
      <div ref={bottomRef} />
    </div>
  );
}

/**
 * ActivityFeed — Scrollable list of agent status updates.
 *
 * This is the "live" side of the UI. As agents work in parallel,
 * their status messages appear here in real-time:
 *
 *   Scout    Searching for companies...
 *   VoC      Searching Reddit and review sites...
 *   Jobs     Searching job boards...
 *   Scout    Found 24 search results
 *   VoC      Found 18 discussion threads
 *   Scout    Scraping 6 company websites...
 *   ...
 *
 * The interleaved messages from different agents (shown in different colors)
 * are what makes the parallel execution VISIBLE to the audience.
 *
 * Auto-scrolls to bottom as new events arrive.
 */
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

  // Auto-scroll to bottom when new activities arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activities]);

  if (activities.length === 0 && !isLoading) {
    return (
      <div className="flex items-center justify-center h-full px-4">
        <p className="text-xs text-neutral-600 text-center">
          Agent activity will appear here as the analysis runs.
        </p>
      </div>
    );
  }

  return (
    <div
      ref={scrollRef}
      className="h-full overflow-y-auto activity-scroll px-4 py-3 space-y-0.5"
    >
      {activities.map((activity, i) => (
        <ActivityItem
          key={`${activity.timestamp}-${i}`}
          activity={activity}
          isLatest={i === activities.length - 1 && isLoading}
        />
      ))}

      {/* Loading indicator at bottom */}
      {isLoading && (
        <div className="flex items-center gap-2 pt-2">
          <div className="flex gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-neutral-600 animate-bounce" style={{ animationDelay: "0ms" }} />
            <div className="w-1.5 h-1.5 rounded-full bg-neutral-600 animate-bounce" style={{ animationDelay: "150ms" }} />
            <div className="w-1.5 h-1.5 rounded-full bg-neutral-600 animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        </div>
      )}
    </div>
  );
}

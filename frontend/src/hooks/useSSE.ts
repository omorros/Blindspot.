"use client";

import { useState, useCallback, useRef } from "react";
import type { Activity, GapCard, Stats, Summary } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8055";

export function useAnalysis() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [gaps, setGaps] = useState<GapCard[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  const analyze = useCallback(async (query: string) => {
    if (abortRef.current) abortRef.current.abort();

    setActivities([]);
    setGaps([]);
    setStats(null);
    setSummary(null);
    setError(null);
    setIsLoading(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const response = await fetch(`${API_URL}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `Server error: ${response.status}`);
      }

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Normalize line endings (Windows \r\n → \n)
        buffer = buffer.replace(/\r\n/g, "\n");

        // SSE events are separated by double newline
        const parts = buffer.split("\n\n");
        buffer = parts.pop() || "";

        for (const part of parts) {
          const trimmed = part.trim();
          if (!trimmed) continue;
          // Skip SSE comments (lines starting with :)
          if (trimmed.startsWith(":")) continue;
          processSSEEvent(trimmed);
        }
      }

      if (buffer.trim()) {
        processSSEEvent(buffer.trim());
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        setError(err.message || "Analysis failed");
      }
    } finally {
      setIsLoading(false);
      abortRef.current = null;
    }
  }, []);

  function processSSEEvent(block: string) {
    const lines = block.split("\n");
    let data: string | null = null;

    for (const line of lines) {
      // Skip comment lines
      if (line.startsWith(":")) continue;

      if (line.startsWith("data: ")) {
        data = line.slice(6);
      } else if (line.startsWith("data:")) {
        data = line.slice(5);
      }
    }

    if (!data) return;

    try {
      const parsed = JSON.parse(data);
      const eventType = parsed.type;
      const eventData = parsed.data;

      switch (eventType) {
        case "activity":
          setActivities((prev) => [
            ...prev,
            { ...eventData, timestamp: Date.now() },
          ]);
          break;
        case "gap":
          setGaps((prev) => [...prev, eventData]);
          break;
        case "stats":
          setStats(eventData);
          break;
        case "summary":
          setSummary(eventData);
          break;
        case "error":
          setError(eventData.message || "Unknown error");
          break;
        case "done":
          break;
      }
    } catch {
      // Ignore malformed events
    }
  }

  const reset = useCallback(() => {
    if (abortRef.current) abortRef.current.abort();
    setActivities([]);
    setGaps([]);
    setStats(null);
    setSummary(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return { activities, gaps, stats, summary, isLoading, error, analyze, reset };
}

/**
 * Main Page — Split-pane layout for Blindspot.
 *
 * LAYOUT:
 * ┌──────────────────────────────────────────────────┐
 * │  Header (logo + name)                            │
 * ├───────────────────┬──────────────────────────────┤
 * │                   │                              │
 * │   Left Panel      │   Right Panel                │
 * │   - Search input  │   - Gap Cards (default)      │
 * │   - Activity feed │   - Investment Memo (toggle)  │
 * │                   │                              │
 * ├───────────────────┴──────────────────────────────┤
 * │  Stats Footer                                    │
 * └──────────────────────────────────────────────────┘
 *
 * The split-pane layout is the visual signature of the app.
 * Left = "what's happening" (process), Right = "what we found" (results).
 */
"use client";

import { useState } from "react";
import { useAnalysis } from "@/hooks/useSSE";
import SearchInput from "@/components/SearchInput";
import ActivityFeed from "@/components/ActivityFeed";
import GapCardComponent from "@/components/GapCard";
import InvestmentMemo from "@/components/InvestmentMemo";
import StatsFooter from "@/components/StatsFooter";

export default function Home() {
  const { activities, gaps, stats, summary, isLoading, error, analyze, reset } =
    useAnalysis();
  const [showMemo, setShowMemo] = useState(false);

  const hasResults = gaps.length > 0;

  return (
    <div className="flex flex-col h-screen">
      {/* ── Header ──────────────────────────────────────── */}
      <header className="flex-none border-b border-neutral-800 bg-neutral-950 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <h1 className="text-lg font-semibold tracking-tight text-white">
              blindspot<span className="text-neutral-600">.</span>
            </h1>
          </div>

          {hasResults && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowMemo(!showMemo)}
                className="text-sm px-3 py-1.5 rounded-md border border-neutral-700 text-neutral-300 hover:bg-neutral-800 transition-colors"
              >
                {showMemo ? "Show Gap Cards" : "Investment Memo"}
              </button>
              <button
                onClick={reset}
                className="text-sm px-3 py-1.5 rounded-md text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800 transition-colors"
              >
                New Search
              </button>
            </div>
          )}
        </div>
      </header>

      {/* ── Main Content (split pane) ───────────────────── */}
      <div className="flex-1 flex min-h-0">
        {/* Left Panel — Search + Activity Feed */}
        <div className="w-[380px] flex-none border-r border-neutral-800 bg-neutral-950 flex flex-col">
          {/* Search Input */}
          <div className="flex-none p-4 border-b border-neutral-800/50">
            <SearchInput onSubmit={analyze} isLoading={isLoading} />
          </div>

          {/* Activity Feed */}
          <div className="flex-1 min-h-0">
            <ActivityFeed activities={activities} isLoading={isLoading} />
          </div>
        </div>

        {/* Right Panel — Results */}
        <div className="flex-1 min-h-0 overflow-y-auto bg-neutral-900">
          {/* Empty state */}
          {!hasResults && !isLoading && !error && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-md px-4">
                <h2 className="text-lg font-medium text-white mb-2">
                  Find your market blindspot
                </h2>
                <p className="text-sm text-neutral-500 leading-relaxed">
                  Enter an industry and geography to discover market gaps backed
                  by competitive analysis, customer complaints, and hiring signals.
                </p>
                <div className="mt-4 flex flex-wrap gap-2 justify-center">
                  {[
                    "pet tech in the UK",
                    "fintech in Germany",
                    "edtech in India",
                  ].map((q) => (
                    <button
                      key={q}
                      onClick={() => analyze(q)}
                      className="text-xs px-3 py-1.5 rounded-full border border-neutral-700 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200 hover:border-neutral-600 transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="p-6">
              <div className="bg-red-950/50 border border-red-900 rounded-lg p-4 text-sm text-red-400">
                {error}
              </div>
            </div>
          )}

          {/* Loading skeleton */}
          {isLoading && !hasResults && (
            <div className="p-6 space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-neutral-800 rounded-lg border border-neutral-700 p-6 animate-pulse"
                >
                  <div className="h-5 bg-neutral-700 rounded w-2/3 mb-3" />
                  <div className="h-3 bg-neutral-700/50 rounded w-full mb-2" />
                  <div className="h-3 bg-neutral-700/50 rounded w-4/5" />
                </div>
              ))}
            </div>
          )}

          {/* Gap Cards */}
          {hasResults && !showMemo && (
            <div className="p-6 space-y-4">
              {summary && (
                <div className="bg-neutral-800 rounded-lg border border-neutral-700 p-4 mb-2 animate-fade_in">
                  <p className="text-sm text-neutral-300 leading-relaxed">
                    {summary.market_summary}
                  </p>
                  <div className="flex gap-4 mt-3 text-xs text-neutral-500">
                    <span>{summary.companies_found} companies</span>
                    <span>{summary.complaints_found} complaints</span>
                    <span>{summary.jobs_analyzed} jobs</span>
                  </div>
                </div>
              )}
              {gaps.map((gap, i) => (
                <div
                  key={gap.id}
                  className="animate-fade_in"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <GapCardComponent gap={gap} rank={i + 1} />
                </div>
              ))}
            </div>
          )}

          {/* Investment Memo */}
          {hasResults && showMemo && (
            <div className="p-6">
              <InvestmentMemo gaps={gaps} summary={summary} />
            </div>
          )}
        </div>
      </div>

      {/* ── Stats Footer ────────────────────────────────── */}
      {stats && <StatsFooter stats={stats} />}
    </div>
  );
}

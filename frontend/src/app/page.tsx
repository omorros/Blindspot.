"use client";

import { useState } from "react";
import { useAnalysis } from "@/hooks/useSSE";
import SearchInput from "@/components/SearchInput";
import AgentStatusCards from "@/components/AgentStatusCards";
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
      {/* Header */}
      <header className="flex-none border-b border-neutral-800/60 px-6 py-3.5">
        <div className="flex items-center justify-between">
          <h1 className="font-serif text-[17px] font-semibold tracking-tight text-white">
            blindspot
          </h1>

          {hasResults && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowMemo(!showMemo)}
                className="text-[11px] tracking-wide uppercase text-neutral-500 hover:text-neutral-200 transition-colors"
              >
                {showMemo ? "Gaps" : "Memo"}
              </button>
              <span className="text-neutral-800">|</span>
              <button
                onClick={reset}
                className="text-[11px] tracking-wide uppercase text-neutral-600 hover:text-neutral-300 transition-colors"
              >
                Reset
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Split pane */}
      <div className="flex-1 flex min-h-0">
        {/* Left Panel */}
        <div className="w-[400px] flex-none border-r border-neutral-800/60 flex flex-col">
          <div className="flex-none px-5 pt-5 pb-4">
            <SearchInput onSubmit={analyze} isLoading={isLoading} />
          </div>

          {(isLoading || activities.length > 0) && (
            <div className="flex-none px-5 pb-3">
              <AgentStatusCards activities={activities} isLoading={isLoading} />
            </div>
          )}

          {activities.length > 0 && (
            <>
              <div className="flex-none px-5 pt-1 pb-2">
                <span className="text-[9px] uppercase tracking-[0.2em] text-neutral-700">
                  log
                </span>
              </div>
              <div className="flex-1 min-h-0">
                <ActivityFeed activities={activities} isLoading={isLoading} />
              </div>
            </>
          )}
        </div>

        {/* Right Panel */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          {/* Empty state */}
          {!hasResults && !isLoading && !error && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-sm">
                <h2 className="font-serif text-xl text-white mb-3">
                  Find the gap.
                </h2>
                <p className="text-[12px] text-neutral-600 leading-relaxed mb-6">
                  Three agents analyze competitive landscape, customer pain points,
                  and hiring signals in parallel. Results in under a minute.
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {[
                    "pet tech in the UK",
                    "fintech in Germany",
                    "developer tools in the UK",
                  ].map((q) => (
                    <button
                      key={q}
                      onClick={() => analyze(q)}
                      className="text-[11px] px-3 py-1.5 border border-neutral-800 text-neutral-500
                                 hover:border-neutral-600 hover:text-neutral-300 transition-all"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="p-8">
              <p className="text-[12px] text-red-400/80">{error}</p>
            </div>
          )}

          {/* Loading */}
          {isLoading && !hasResults && (
            <div className="px-10 py-8 max-w-2xl space-y-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse space-y-2">
                  <div className="h-3 bg-neutral-900 w-3/5" />
                  <div className="h-2 bg-neutral-900/60 w-full" />
                  <div className="h-2 bg-neutral-900/60 w-4/5" />
                </div>
              ))}
            </div>
          )}

          {/* Gap Cards */}
          {hasResults && !showMemo && (
            <div className="px-10 py-8 max-w-2xl">
              {summary && (
                <div className="mb-10 animate-fade_in">
                  <p className="text-[12px] text-neutral-500 leading-[1.7]">
                    {summary.market_summary}
                  </p>
                  <div className="flex gap-6 mt-4 text-[10px] text-neutral-700 uppercase tracking-wider">
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
                  style={{ animationDelay: `${i * 120}ms`, animationFillMode: "both" }}
                >
                  <GapCardComponent gap={gap} rank={i + 1} />
                </div>
              ))}
            </div>
          )}

          {hasResults && showMemo && (
            <div className="p-8">
              <InvestmentMemo gaps={gaps} summary={summary} />
            </div>
          )}
        </div>
      </div>

      {stats && <StatsFooter stats={stats} />}
    </div>
  );
}

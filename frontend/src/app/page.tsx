"use client";

import { useState, useCallback } from "react";
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
  const [hasStarted, setHasStarted] = useState(false);

  const hasResults = gaps.length > 0;

  const handleAnalyze = useCallback(
    (query: string) => {
      setHasStarted(true);
      setShowMemo(false);
      analyze(query);
    },
    [analyze],
  );

  const handleReset = useCallback(() => {
    reset();
    setHasStarted(false);
    setShowMemo(false);
  }, [reset]);

  // ─── Centered view: Landing OR Loading ───
  if (!hasResults) {
    return (
      <div className="h-screen flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <div className="w-full max-w-lg text-center">
            {/* Logo */}
            <h1 className="font-serif text-3xl font-semibold text-[var(--text-primary)] tracking-tight mb-2">
              blindspot
            </h1>
            <p className="text-sm text-[var(--text-muted)] mb-10">
              Multi-agent market gap analysis
            </p>

            {/* Search */}
            <div className="mb-8">
              <SearchInput onSubmit={handleAnalyze} isLoading={isLoading} />
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3 mb-6 text-left">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {/* Loading state — agent progress */}
            {hasStarted && isLoading && (
              <div className="animate-fade_in space-y-5 text-left">
                <AgentStatusCards activities={activities} isLoading={isLoading} />

                {activities.length > 0 && (
                  <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-raised)] overflow-hidden">
                    <div className="px-4 py-2.5 border-b border-[var(--border-subtle)]">
                      <p className="text-[10px] uppercase tracking-[0.15em] text-[var(--text-muted)] font-medium">
                        Activity Log
                      </p>
                    </div>
                    <div className="max-h-[180px] overflow-y-auto activity-scroll">
                      <div className="px-4 py-2">
                        <ActivityFeed activities={activities} isLoading={isLoading} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Example queries — only before first search */}
            {!hasStarted && (
              <div className="space-y-3 animate-fade_in">
                <p className="text-[11px] uppercase tracking-[0.15em] text-[var(--text-muted)]">
                  Try an example
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {[
                    "pet tech in the UK",
                    "fintech in Germany",
                    "developer tools in the UK",
                  ].map((q) => (
                    <button
                      key={q}
                      onClick={() => handleAnalyze(q)}
                      className="text-xs px-4 py-2 rounded-lg border border-[var(--border)]
                                 text-[var(--text-tertiary)] bg-[var(--surface-raised)]
                                 hover:border-[var(--text-muted)] hover:text-[var(--text-secondary)]
                                 transition-all duration-200"
                    >
                      {q}
                    </button>
                  ))}
                </div>

                {/* How it works */}
                <div className="mt-12 pt-2 grid grid-cols-3 gap-6">
                  {[
                    { label: "Scout", desc: "Maps competitive landscape", color: "var(--accent-blue)" },
                    { label: "VoC", desc: "Finds customer pain points", color: "var(--accent-violet)" },
                    { label: "Jobs", desc: "Analyzes hiring signals", color: "var(--accent-amber)" },
                  ].map((agent) => (
                    <div key={agent.label} className="text-center">
                      <div
                        className="w-1.5 h-1.5 rounded-full mx-auto mb-2.5"
                        style={{ backgroundColor: agent.color }}
                      />
                      <p className="text-xs font-medium text-[var(--text-secondary)] mb-1">
                        {agent.label}
                      </p>
                      <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                        {agent.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ─── Dashboard view — only shown when results are ready ───
  return (
    <div className="flex flex-col h-screen bg-[var(--surface)] animate-fade_in">
      {/* Header */}
      <header className="flex-none border-b border-[var(--border-subtle)] px-6 py-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={handleReset} className="group flex items-center gap-3">
              <h1 className="font-serif text-lg font-semibold text-[var(--text-primary)] tracking-tight group-hover:text-white transition-colors">
                blindspot
              </h1>
            </button>
            <span className="text-[11px] text-[var(--text-muted)]">/</span>
            <span className="text-[11px] text-[var(--text-muted)]">analysis</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowMemo(!showMemo)}
              className={`text-xs px-3 py-1.5 rounded border transition-colors ${
                showMemo
                  ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/5"
                  : "border-[var(--border)] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:border-[var(--text-muted)]"
              }`}
            >
              {showMemo ? "View Gaps" : "Memo"}
            </button>
            <button
              onClick={handleReset}
              className="text-xs px-3 py-1.5 rounded border border-[var(--border)] text-[var(--text-muted)]
                         hover:text-[var(--text-secondary)] hover:border-[var(--text-muted)] transition-colors"
            >
              New Search
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex min-h-0">
        {/* Left Panel — Agents + Log */}
        <div className="w-[400px] flex-none border-r border-[var(--border-subtle)] flex flex-col">
          {/* Agent status cards */}
          {activities.length > 0 && (
            <div className="flex-none px-5 pt-4 pb-3">
              <p className="text-[10px] uppercase tracking-[0.15em] text-[var(--text-muted)] font-medium mb-2.5">
                Agents
              </p>
              <AgentStatusCards activities={activities} isLoading={isLoading} />
            </div>
          )}

          {/* Activity log */}
          {activities.length > 0 && (
            <>
              <div className="flex-none px-5 pt-2 pb-2 border-t border-[var(--border-subtle)]">
                <p className="text-[10px] uppercase tracking-[0.15em] text-[var(--text-muted)] font-medium">
                  Activity Log
                </p>
              </div>
              <div className="flex-1 min-h-0">
                <ActivityFeed activities={activities} isLoading={isLoading} />
              </div>
            </>
          )}
        </div>

        {/* Right Panel — Results */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          {/* Gap Cards */}
          {!showMemo && (
            <div className="px-8 py-8">
              {summary && (
                <div className="mb-8 animate-fade_in">
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                    {summary.market_summary}
                  </p>
                  <div className="flex gap-5 mt-4">
                    <div className="text-xs text-[var(--text-muted)]">
                      <span className="text-[var(--text-primary)] font-medium">{summary.companies_found}</span> companies
                    </div>
                    <div className="text-xs text-[var(--text-muted)]">
                      <span className="text-[var(--text-primary)] font-medium">{summary.complaints_found}</span> complaints
                    </div>
                    <div className="text-xs text-[var(--text-muted)]">
                      <span className="text-[var(--text-primary)] font-medium">{summary.jobs_analyzed}</span> jobs
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
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
            </div>
          )}

          {/* Investment Memo */}
          {showMemo && (
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

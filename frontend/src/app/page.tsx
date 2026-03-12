"use client";

import { useState, useCallback, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useAnalysis } from "@/hooks/useSSE";
import SearchInput from "@/components/SearchInput";
import AgentStatusCards from "@/components/AgentStatusCards";
import ActivityFeed from "@/components/ActivityFeed";
import GapCardComponent from "@/components/GapCard";
import InvestmentMemo from "@/components/InvestmentMemo";
import StatsFooter from "@/components/StatsFooter";
import { BlurFade } from "@/components/ui/blur-fade";
import { Particles } from "@/components/ui/particles";
import { NumberTicker } from "@/components/ui/number-ticker";
import { BorderBeam } from "@/components/ui/border-beam";

export default function Home() {
  const { activities, gaps, stats, summary, isLoading, error, analyze, reset } =
    useAnalysis();
  const [showMemo, setShowMemo] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  const hasResults = gaps.length > 0;

  // Elapsed timer during loading
  useEffect(() => {
    if (!isLoading) {
      setElapsed(0);
      return;
    }
    const start = Date.now();
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - start) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [isLoading]);

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

  // Count completed agents for progress
  const completedAgents = (["scout", "voc", "jobs"] as const).filter((agent) => {
    const agentActivities = activities.filter((a) => a.agent === agent);
    const latest = agentActivities[agentActivities.length - 1];
    if (!latest) return false;
    const doneKeywords = ["Mapped", "Identified", "Analyzed", "cached", "error"];
    return doneKeywords.some((kw) => latest.message.includes(kw));
  }).length;

  // Phase label
  const phaseLabel = !hasStarted
    ? ""
    : completedAgents === 3
      ? "Finalizing analysis..."
      : completedAgents > 0
        ? `${completedAgents}/3 agents complete`
        : activities.length > 0
          ? "Agents are browsing the web..."
          : "Starting agents...";

  return (
    <div className="h-screen flex flex-col relative overflow-hidden bg-[var(--surface)]">
      <AnimatePresence mode="wait">
        {!hasResults ? (
          /* ─── Landing / Loading view ─── */
          <motion.div
            key="landing"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.98, filter: "blur(8px)" }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="flex-1 flex flex-col relative"
          >
            {/* Subtle particle background */}
            <Particles
              className="absolute inset-0"
              quantity={40}
              color="#a1a1aa"
              size={0.3}
              staticity={80}
              ease={80}
            />

            <div className="flex-1 flex flex-col items-center justify-center px-6 relative z-10">
              <div className="w-full max-w-lg text-center">
                {/* Logo */}
                <BlurFade delay={0} duration={0.5}>
                  <h1 className="font-serif text-4xl font-semibold text-[var(--text-primary)] tracking-tight mb-2">
                    blindspot
                  </h1>
                </BlurFade>
                <BlurFade delay={0.08} duration={0.5}>
                  <p className="text-sm text-[var(--text-muted)] mb-12">
                    Multi-agent market gap analysis
                  </p>
                </BlurFade>

                {/* Search */}
                <BlurFade delay={0.16} duration={0.5}>
                  <div className="mb-8">
                    <SearchInput onSubmit={handleAnalyze} isLoading={isLoading} />
                  </div>
                </BlurFade>

                {/* Error */}
                {error && (
                  <BlurFade delay={0}>
                    <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 mb-6 text-left">
                      <p className="text-sm text-red-400">{error}</p>
                    </div>
                  </BlurFade>
                )}

                {/* Loading state — agent progress */}
                {hasStarted && isLoading && (
                  <div className="space-y-4 text-left">
                    {/* Progress header */}
                    <BlurFade delay={0}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-3">
                          {/* Animated spinner */}
                          <div className="relative w-4 h-4">
                            <div className="absolute inset-0 rounded-full border-2 border-[var(--border)]" />
                            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[var(--text-secondary)] animate-spin" />
                          </div>
                          <span className="text-xs text-[var(--text-secondary)] font-medium">
                            {phaseLabel}
                          </span>
                        </div>
                        <span className="text-[11px] text-[var(--text-muted)] tabular-nums">
                          {elapsed}s
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div className="h-0.5 bg-[var(--surface-overlay)] rounded-full overflow-hidden mb-4">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 via-violet-500 to-amber-500 rounded-full transition-all duration-700 ease-out"
                          style={{ width: `${Math.max(5, (completedAgents / 3) * 100)}%` }}
                        />
                      </div>
                    </BlurFade>

                    <BlurFade delay={0.05}>
                      <AgentStatusCards activities={activities} isLoading={isLoading} />
                    </BlurFade>

                    {activities.length > 0 && (
                      <BlurFade delay={0.1}>
                        <div className="relative rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-raised)]/80 backdrop-blur-sm overflow-hidden">
                          <div className="px-4 py-2.5 border-b border-[var(--border-subtle)] flex items-center justify-between">
                            <p className="text-[10px] uppercase tracking-[0.15em] text-[var(--text-muted)] font-medium">
                              Activity Log
                            </p>
                            <div className="flex items-center gap-1.5">
                              <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse_dot" />
                              <span className="text-[10px] text-[var(--text-muted)]">Live</span>
                            </div>
                          </div>
                          <div className="max-h-[180px] overflow-y-auto activity-scroll">
                            <div className="px-4 py-2">
                              <ActivityFeed activities={activities} isLoading={isLoading} />
                            </div>
                          </div>
                          <BorderBeam
                            size={60}
                            duration={5}
                            colorFrom="#34d399"
                            colorTo="#059669"
                            borderWidth={1}
                          />
                        </div>
                      </BlurFade>
                    )}
                  </div>
                )}

                {/* Example queries — only before first search */}
                {!hasStarted && (
                  <div className="space-y-3">
                    <BlurFade delay={0.24} duration={0.5}>
                      <p className="text-[11px] uppercase tracking-[0.15em] text-[var(--text-muted)]">
                        Try an example
                      </p>
                    </BlurFade>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {[
                        "pet tech in the UK",
                        "fintech in Germany",
                        "developer tools in the UK",
                      ].map((q, i) => (
                        <BlurFade key={q} delay={0.28 + i * 0.06} duration={0.4}>
                          <button
                            onClick={() => handleAnalyze(q)}
                            className="text-xs px-4 py-2 rounded-lg border border-[var(--border)]
                                       text-[var(--text-tertiary)] bg-[var(--surface-raised)]/60 backdrop-blur-sm
                                       hover:border-[var(--text-muted)] hover:text-[var(--text-secondary)]
                                       hover:bg-[var(--surface-raised)] transition-all duration-200"
                          >
                            {q}
                          </button>
                        </BlurFade>
                      ))}
                    </div>

                    {/* How it works */}
                    <div className="mt-14 pt-2 grid grid-cols-3 gap-8">
                      {[
                        { label: "Scout", desc: "Maps competitive landscape", color: "var(--accent-blue)" },
                        { label: "VoC", desc: "Finds customer pain points", color: "var(--accent-violet)" },
                        { label: "Jobs", desc: "Analyzes hiring signals", color: "var(--accent-amber)" },
                      ].map((agent, i) => (
                        <BlurFade key={agent.label} delay={0.5 + i * 0.08} duration={0.4}>
                          <div className="text-center group">
                            <div
                              className="w-1.5 h-1.5 rounded-full mx-auto mb-3 transition-transform duration-300 group-hover:scale-150"
                              style={{ backgroundColor: agent.color }}
                            />
                            <p className="text-xs font-medium text-[var(--text-secondary)] mb-1">
                              {agent.label}
                            </p>
                            <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                              {agent.desc}
                            </p>
                          </div>
                        </BlurFade>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ) : (
          /* ─── Dashboard view ─── */
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col h-screen"
          >
            {/* Header */}
            <header className="flex-none border-b border-[var(--border-subtle)] px-6 py-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button onClick={handleReset} className="group flex items-center gap-3">
                    <h1 className="font-serif text-lg font-semibold text-[var(--text-primary)] tracking-tight group-hover:text-white transition-colors">
                      blindspot
                    </h1>
                  </button>
                  <span className="text-[var(--border)]">/</span>
                  <span className="text-[11px] text-[var(--text-muted)]">analysis</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowMemo(!showMemo)}
                    className={`text-xs px-3.5 py-1.5 rounded-lg border transition-all duration-200 ${
                      showMemo
                        ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/5"
                        : "border-[var(--border)] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:border-[var(--text-muted)]"
                    }`}
                  >
                    {showMemo ? "View Gaps" : "Memo"}
                  </button>
                  <button
                    onClick={handleReset}
                    className="text-xs px-3.5 py-1.5 rounded-lg border border-[var(--border)] text-[var(--text-muted)]
                               hover:text-[var(--text-secondary)] hover:border-[var(--text-muted)] transition-all duration-200"
                  >
                    New Search
                  </button>
                </div>
              </div>
            </header>

            {/* Main content */}
            <div className="flex-1 flex min-h-0">
              {/* Left Panel — Agents + Log */}
              <div className="w-[380px] flex-none border-r border-[var(--border-subtle)] flex flex-col bg-[var(--surface-raised)]/30">
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
                <AnimatePresence mode="wait">
                  {/* Gap Cards */}
                  {!showMemo && (
                    <motion.div
                      key="gaps"
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 8 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      className="px-8 py-8"
                    >
                      {summary && (
                        <BlurFade delay={0} duration={0.4}>
                          <div className="mb-8">
                            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                              {summary.market_summary}
                            </p>
                            <div className="flex gap-6 mt-4">
                              <div className="text-xs text-[var(--text-muted)]">
                                <NumberTicker value={summary.companies_found} className="text-[var(--text-primary)] text-xs font-medium" />{" "}companies
                              </div>
                              <div className="text-xs text-[var(--text-muted)]">
                                <NumberTicker value={summary.complaints_found} className="text-[var(--text-primary)] text-xs font-medium" />{" "}complaints
                              </div>
                              <div className="text-xs text-[var(--text-muted)]">
                                <NumberTicker value={summary.jobs_analyzed} className="text-[var(--text-primary)] text-xs font-medium" />{" "}jobs
                              </div>
                            </div>
                          </div>
                        </BlurFade>
                      )}

                      <div className="space-y-4">
                        {gaps.map((gap, i) => (
                          <BlurFade
                            key={gap.id}
                            delay={0.08 + i * 0.1}
                            duration={0.4}
                          >
                            <GapCardComponent gap={gap} rank={i + 1} />
                          </BlurFade>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Investment Memo */}
                  {showMemo && (
                    <motion.div
                      key="memo"
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      className="p-8"
                    >
                      <InvestmentMemo gaps={gaps} summary={summary} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {stats && <StatsFooter stats={stats} />}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

"use client";

import { useState } from "react";
import { BorderBeam } from "@/components/ui/border-beam";

interface Props {
  onSubmit: (query: string) => void;
  isLoading: boolean;
}

export default function SearchInput({ onSubmit, isLoading }: Props) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed || isLoading) return;
    onSubmit(trimmed);
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="relative rounded-xl overflow-hidden">
        <div
          className={`flex items-center gap-3 rounded-xl border bg-[var(--surface-raised)]/80 backdrop-blur-sm px-4 py-3.5 transition-all duration-300 ${
            focused
              ? "border-[var(--text-muted)]/50 shadow-[0_0_20px_rgba(161,161,170,0.06)]"
              : "border-[var(--border)]"
          }`}
        >
          <svg className="w-4 h-4 text-[var(--text-muted)] flex-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="e.g. pet tech in the UK"
            disabled={isLoading}
            className="flex-1 bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]
                       focus:outline-none disabled:opacity-40"
          />
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="flex-none text-xs font-medium px-4 py-2 rounded-lg
                       bg-[var(--text-primary)] text-[var(--surface)]
                       hover:bg-white
                       disabled:opacity-20 disabled:cursor-not-allowed
                       transition-all duration-200"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-1 h-1 bg-[var(--surface)] rounded-full animate-pulse" />
                Running...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Analyze
                <kbd className="text-[9px] px-1 py-0.5 rounded border border-[var(--surface-overlay)] bg-[var(--surface)] text-[var(--text-muted)] opacity-60">
                  &crarr;
                </kbd>
              </span>
            )}
          </button>
        </div>
        {(focused || isLoading) && (
          <BorderBeam
            size={80}
            duration={4}
            colorFrom="#a1a1aa"
            colorTo="#52525b"
            borderWidth={1}
          />
        )}
      </div>
    </form>
  );
}

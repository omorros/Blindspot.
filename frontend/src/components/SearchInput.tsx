"use client";

import { useState } from "react";

interface Props {
  onSubmit: (query: string) => void;
  isLoading: boolean;
}

export default function SearchInput({ onSubmit, isLoading }: Props) {
  const [query, setQuery] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed || isLoading) return;
    onSubmit(trimmed);
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface-raised)] px-4 py-3">
        <svg className="w-4 h-4 text-[var(--text-muted)] flex-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. pet tech in the UK"
          disabled={isLoading}
          className="flex-1 bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]
                     focus:outline-none disabled:opacity-40"
        />
        <button
          type="submit"
          disabled={isLoading || !query.trim()}
          className="flex-none text-xs font-medium px-3 py-1.5 rounded
                     bg-[var(--text-primary)] text-[var(--surface)]
                     hover:bg-white
                     disabled:opacity-30 disabled:cursor-not-allowed
                     transition-colors"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-[var(--surface)] rounded-full animate-pulse" />
              Running...
            </span>
          ) : (
            "Analyze"
          )}
        </button>
      </div>
    </form>
  );
}

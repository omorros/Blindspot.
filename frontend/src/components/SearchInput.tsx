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
      <div className="flex items-center border-b border-neutral-800 pb-3">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="industry + geography"
          disabled={isLoading}
          className="flex-1 bg-transparent text-[13px] text-white placeholder:text-neutral-700
                     focus:outline-none disabled:opacity-40"
        />
        <button
          type="submit"
          disabled={isLoading || !query.trim()}
          className="text-[10px] uppercase tracking-[0.15em] text-neutral-500
                     hover:text-white disabled:opacity-30 disabled:cursor-not-allowed
                     transition-colors ml-3"
        >
          {isLoading ? (
            <span className="flex items-center gap-1.5">
              <span className="w-1 h-1 bg-neutral-500 rounded-full animate-pulse" />
              running
            </span>
          ) : (
            "run"
          )}
        </button>
      </div>
    </form>
  );
}

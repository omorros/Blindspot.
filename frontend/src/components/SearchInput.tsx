/**
 * SearchInput — The query input + submit button.
 *
 * Simple form: type a query, press Enter or click the button.
 * Disables while analysis is running to prevent double-submissions.
 */
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
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="e.g. pet tech in the UK"
        disabled={isLoading}
        className="flex-1 text-sm px-3 py-2 rounded-lg border border-neutral-700 bg-neutral-900 text-white
                   placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-600
                   focus:border-neutral-600 disabled:opacity-50 transition-colors"
      />
      <button
        type="submit"
        disabled={isLoading || !query.trim()}
        className="px-4 py-2 text-sm font-medium rounded-lg bg-white text-black
                   hover:bg-neutral-200 disabled:opacity-40 disabled:cursor-not-allowed
                   transition-colors"
      >
        {isLoading ? (
          <span className="flex items-center gap-1.5">
            <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12" cy="12" r="10"
                stroke="currentColor" strokeWidth="4" fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Analyzing
          </span>
        ) : (
          "Analyze"
        )}
      </button>
    </form>
  );
}

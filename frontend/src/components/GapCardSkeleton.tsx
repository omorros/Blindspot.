"use client";

export default function GapCardSkeleton() {
  return (
    <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-raised)]/60 overflow-hidden animate-pulse">
      <div className="px-5 py-4 flex items-start gap-4">
        {/* Rank */}
        <div className="w-7 h-7 rounded-lg bg-[var(--surface-overlay)] flex-none" />

        {/* Title + description */}
        <div className="flex-1 space-y-2.5">
          <div className="h-4 bg-[var(--surface-overlay)] rounded-md w-3/4" />
          <div className="h-3 bg-[var(--surface-overlay)] rounded-md w-full" />
          <div className="h-3 bg-[var(--surface-overlay)] rounded-md w-2/3" />
        </div>

        {/* Score */}
        <div className="flex items-center gap-3 flex-none">
          <div className="h-4 w-12 bg-[var(--surface-overlay)] rounded-md" />
          <div className="h-6 w-10 bg-[var(--surface-overlay)] rounded-md" />
        </div>
      </div>

      {/* Expanded skeleton for first card */}
      <div className="px-5 pb-5 border-t border-[var(--border-subtle)] space-y-4 pt-4">
        <div className="space-y-2">
          <div className="h-3 bg-[var(--surface-overlay)] rounded-md w-full" />
          <div className="h-3 bg-[var(--surface-overlay)] rounded-md w-5/6" />
          <div className="h-3 bg-[var(--surface-overlay)] rounded-md w-4/6" />
        </div>

        {/* Triangulation bars skeleton */}
        <div className="space-y-2.5 mt-3">
          <div className="flex items-center gap-3">
            <div className="h-3 w-12 bg-[var(--surface-overlay)] rounded-md flex-none" />
            <div className="h-1 bg-[var(--surface-overlay)] rounded-full flex-1 max-w-[300px]" />
          </div>
          <div className="flex items-center gap-3">
            <div className="h-3 w-12 bg-[var(--surface-overlay)] rounded-md flex-none" />
            <div className="h-1 bg-[var(--surface-overlay)] rounded-full flex-1 max-w-[200px]" />
          </div>
          <div className="flex items-center gap-3">
            <div className="h-3 w-12 bg-[var(--surface-overlay)] rounded-md flex-none" />
            <div className="h-1 bg-[var(--surface-overlay)] rounded-full flex-1 max-w-[250px]" />
          </div>
        </div>
      </div>
    </div>
  );
}

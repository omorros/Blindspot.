/**
 * ConfidenceBadge — Visual confidence score indicator.
 *
 * Shows the confidence score (0-10) as a colored badge:
 * - 8-10: Green (high confidence — multiple signals agree)
 * - 5-7.9: Amber (moderate — 2 of 3 signals)
 * - 0-4.9: Red (low — weak or single signal)
 *
 * The ring around the number fills proportionally to the score,
 * giving an instant visual read on gap quality.
 */
"use client";

interface Props {
  score: number;
}

export default function ConfidenceBadge({ score }: Props) {
  const clamped = Math.max(0, Math.min(10, score));

  // Color based on score range
  let colorClasses: string;
  if (clamped >= 8) {
    colorClasses = "text-emerald-400 bg-emerald-950/50 ring-emerald-800";
  } else if (clamped >= 5) {
    colorClasses = "text-amber-400 bg-amber-950/50 ring-amber-800";
  } else {
    colorClasses = "text-red-400 bg-red-950/50 ring-red-800";
  }

  return (
    <div
      className={`inline-flex items-center justify-center w-10 h-10 rounded-full
                  ring-2 text-sm font-semibold ${colorClasses}`}
      title={`Confidence: ${clamped.toFixed(1)}/10`}
    >
      {clamped.toFixed(1)}
    </div>
  );
}

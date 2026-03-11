"use client";

interface Props {
  score: number;
}

export default function ConfidenceBadge({ score }: Props) {
  const clamped = Math.max(0, Math.min(10, score));

  let color: string;
  if (clamped >= 8) {
    color = "text-emerald-400";
  } else if (clamped >= 5) {
    color = "text-amber-400";
  } else {
    color = "text-red-400";
  }

  return (
    <span className={`text-sm font-mono font-medium ${color}`}>
      {clamped.toFixed(1)}
    </span>
  );
}

"use client";

import { cn } from "@/lib/cn";

interface Props {
  value: number;
  onChange: (v: number) => void;
  disabled?: boolean;
  label?: string;
}

export function PredictionInput({ value, onChange, disabled, label }: Props) {
  return (
    <div className="flex flex-col items-center gap-2">
      {label && <span className="text-[10px] uppercase tracking-wider text-muted font-semibold">{label}</span>}
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="restar"
          disabled={disabled || value <= 0}
          onClick={() => onChange(Math.max(0, value - 1))}
          className={cn(
            "w-10 h-10 rounded-full bg-bg-card border border-line text-xl font-bold text-muted hover:text-white hover:border-brand/50 disabled:opacity-30 transition",
          )}
        >
          −
        </button>
        <div className="w-16 h-16 rounded-2xl bg-gradient-brand grid place-items-center font-display text-3xl font-bold tabular-nums shadow-lg shadow-brand/20">
          {value}
        </div>
        <button
          type="button"
          aria-label="sumar"
          disabled={disabled || value >= 20}
          onClick={() => onChange(Math.min(20, value + 1))}
          className={cn(
            "w-10 h-10 rounded-full bg-bg-card border border-line text-xl font-bold text-muted hover:text-white hover:border-brand/50 disabled:opacity-30 transition",
          )}
        >
          +
        </button>
      </div>
    </div>
  );
}

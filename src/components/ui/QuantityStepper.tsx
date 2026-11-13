"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export function QuantityStepper({
  value,
  min = 1,
  max,
  onChange,
  size = "md",
  disabled,
  label = "Quantity",
}: {
  value: number;
  min?: number;
  max: number;
  onChange: (value: number) => void;
  size?: "sm" | "md";
  disabled?: boolean;
  label?: string;
}) {
  const btn = cn(
    "flex items-center justify-center text-ink-700 transition hover:bg-ink-100 disabled:cursor-not-allowed disabled:text-ink-300 disabled:hover:bg-transparent",
    size === "sm" ? "h-8 w-8" : "h-11 w-11",
  );
  return (
    <div
      role="group"
      aria-label={label}
      className={cn(
        "inline-flex items-center overflow-hidden rounded-lg border border-ink-300 bg-white",
        disabled && "opacity-60",
      )}
    >
      <button
        type="button"
        className={btn}
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={disabled || value <= min}
        aria-label="Decrease quantity"
      >
        <Minus className="h-4 w-4" />
      </button>
      <input
        type="number"
        inputMode="numeric"
        value={value}
        min={min}
        max={max}
        disabled={disabled}
        aria-label={label}
        onChange={(e) => {
          const n = parseInt(e.target.value, 10);
          if (Number.isNaN(n)) return;
          onChange(Math.min(max, Math.max(min, n)));
        }}
        className={cn(
          "border-x border-ink-200 bg-transparent text-center text-sm font-semibold tabular-nums text-ink-900 focus:outline-none",
          size === "sm" ? "h-8 w-10" : "h-11 w-14",
        )}
      />
      <button
        type="button"
        className={btn}
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={disabled || value >= max}
        aria-label="Increase quantity"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}


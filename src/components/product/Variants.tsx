"use client";

import { Check } from "lucide-react";
import type { ProductColor } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ColorSwatches({
  colors,
  selected,
  onSelect,
  size = "md",
}: {
  colors: ProductColor[];
  selected: string | null;
  onSelect?: (name: string) => void;
  size?: "sm" | "md";
}) {
  const dim = size === "sm" ? "h-5 w-5" : "h-8 w-8";
  return (
    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Colour">
      {colors.map((c) => {
        const active = selected === c.name;
        return (
          <button
            key={c.name}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={c.name}
            title={c.name}
            onClick={() => onSelect?.(c.name)}
            className={cn(
              "relative flex items-center justify-center rounded-full border transition",
              dim,
              active ? "ring-2 ring-brand-500 ring-offset-2" : "hover:scale-110",
              c.hex.toLowerCase() === "#ffffff" ? "border-ink-300" : "border-black/10",
            )}
            style={{ backgroundColor: c.hex }}
          >
            {active && size === "md" && (
              <Check
                className={cn("h-4 w-4", ["#ffffff", "#f1e8d4", "#d9c7a7"].includes(c.hex.toLowerCase()) ? "text-ink-800" : "text-white")}
                strokeWidth={3}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

export function SizeChips({
  sizes,
  selected,
  onSelect,
  size = "md",
  invalid,
}: {
  sizes: string[];
  selected: string | string[] | null;
  onSelect: (s: string) => void;
  size?: "sm" | "md";
  invalid?: boolean;
}) {
  const multi = Array.isArray(selected);
  return (
    <div className="flex flex-wrap gap-1.5" role={multi ? "group" : "radiogroup"} aria-label="Size" aria-invalid={invalid || undefined}>
      {sizes.map((s) => {
        const active = Array.isArray(selected) ? selected.includes(s) : selected === s;
        return (
          <button
            key={s}
            type="button"
            role={multi ? undefined : "radio"}
            aria-checked={multi ? undefined : active}
            aria-pressed={multi ? active : undefined}
            onClick={() => onSelect(s)}
            className={cn(
              "rounded-lg border font-semibold transition",
              size === "sm" ? "min-w-8 px-2 py-1 text-[11px]" : "min-w-12 px-3.5 py-2.5 text-sm",
              active
                ? "border-ink-900 bg-ink-900 text-white"
                : invalid
                  ? "border-red-300 bg-red-50/40 text-ink-700 hover:border-ink-900"
                  : "border-ink-200 bg-white text-ink-700 hover:border-ink-900",
            )}
          >
            {s}
          </button>
        );
      })}
    </div>
  );
}

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function Rating({
  value,
  count,
  size = "sm",
  className,
}: {
  value: number;
  count?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const dim = size === "lg" ? "h-5 w-5" : size === "md" ? "h-4 w-4" : "h-3.5 w-3.5";
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <div className="flex" role="img" aria-label={`Rated ${value.toFixed(1)} out of 5`}>
        {[1, 2, 3, 4, 5].map((i) => {
          const fill = Math.max(0, Math.min(1, value - (i - 1)));
          return (
            <span key={i} className={cn("relative inline-block", dim)}>
              <Star className={cn("absolute inset-0", dim, "text-ink-200")} fill="currentColor" strokeWidth={0} />
              <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
                <Star className={cn(dim, "text-amber-400")} fill="currentColor" strokeWidth={0} />
              </span>
            </span>
          );
        })}
      </div>
      {count !== undefined && (
        <span className="text-xs text-ink-500">
          {value.toFixed(1)} <span className="text-ink-400">({count})</span>
        </span>
      )}
    </div>
  );
}

export function RatingInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex gap-1" role="radiogroup" aria-label="Your rating">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          role="radio"
          aria-checked={value === i}
          aria-label={`${i} star${i > 1 ? "s" : ""}`}
          onClick={() => onChange(i)}
          className="rounded p-0.5 transition hover:scale-110"
        >
          <Star
            className={cn("h-7 w-7", i <= value ? "text-amber-400" : "text-ink-300")}
            fill={i <= value ? "currentColor" : "none"}
          />
        </button>
      ))}
    </div>
  );
}


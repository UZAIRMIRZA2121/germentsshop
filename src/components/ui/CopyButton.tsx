"use client";

import { Check, Copy } from "lucide-react";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { cn } from "@/lib/utils";

export function CopyButton({
  value,
  label,
  className,
  compact,
}: {
  value: string;
  /** Human label used in the toast, e.g. "Account number". */
  label: string;
  className?: string;
  compact?: boolean;
}) {
  const { copy, copied } = useCopyToClipboard();
  const isCopied = copied === value;
  return (
    <button
      type="button"
      onClick={() => copy(value, label)}
      aria-label={`Copy ${label}`}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition",
        isCopied
          ? "border-emerald-300 bg-emerald-50 text-emerald-700"
          : "border-ink-200 bg-white text-ink-700 hover:border-ink-400 hover:bg-ink-50",
        className,
      )}
    >
      {isCopied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      {!compact && (isCopied ? "Copied" : "Copy")}
    </button>
  );
}


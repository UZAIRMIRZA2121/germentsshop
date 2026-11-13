"use client";

import { useCallback, useState } from "react";
import { useToast } from "@/context/ToastContext";

/** Copies text to the clipboard with a graceful fallback and toast feedback. */
export function useCopyToClipboard() {
  const toast = useToast();
  const [copied, setCopied] = useState<string | null>(null);

  const copy = useCallback(
    async (text: string, label = "Copied") => {
      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(text);
        } else {
          const el = document.createElement("textarea");
          el.value = text;
          el.style.position = "fixed";
          el.style.opacity = "0";
          document.body.appendChild(el);
          el.select();
          document.execCommand("copy");
          document.body.removeChild(el);
        }
        setCopied(text);
        toast.success(`${label} copied to clipboard`);
        setTimeout(() => setCopied((c) => (c === text ? null : c)), 1800);
      } catch {
        toast.error("Couldn't copy automatically. Please copy it manually.");
      }
    },
    [toast],
  );

  return { copy, copied };
}


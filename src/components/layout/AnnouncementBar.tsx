"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Truck, X } from "lucide-react";
import { siteConfig } from "@/lib/config/site";

export function AnnouncementBar() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % siteConfig.announcements.length), 4500);
    return () => clearInterval(t);
  }, []);

  if (!visible) return null;

  return (
    <div className="relative bg-ink-900 text-white">
      <div className="container-page flex h-9 items-center justify-center gap-2 text-xs font-medium sm:text-[13px]">
        <Truck className="hidden h-4 w-4 text-brand-400 sm:block" aria-hidden />
        <p key={index} className="animate-fade-up truncate pr-8" aria-live="polite">
          {siteConfig.announcements[index]}
          <Link href="/shop" className="ml-2 hidden font-semibold text-brand-300 underline-offset-2 hover:underline sm:inline">
            Shop now
          </Link>
        </p>
        <button
          type="button"
          onClick={() => setVisible(false)}
          className="absolute right-3 rounded p-1 text-ink-300 hover:text-white sm:right-6"
          aria-label="Dismiss announcement"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}


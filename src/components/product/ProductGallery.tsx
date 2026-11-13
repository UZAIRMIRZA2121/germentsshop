"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import { SafeImage } from "@/components/ui/SafeImage";
import { cn } from "@/lib/utils";

export function ProductGallery({
  images,
  name,
  badges,
}: {
  images: string[];
  name: string;
  badges?: React.ReactNode;
}) {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const list = images.length > 0 ? images : [""];
  const index = Math.min(active, list.length - 1);

  const go = (n: number) => setActive((n + list.length) % list.length);

  return (
    <div className="flex flex-col-reverse gap-3 sm:flex-row">
      {list.length > 1 && (
        <ul className="flex gap-2.5 overflow-x-auto sm:max-h-[640px] sm:flex-col sm:overflow-y-auto sm:overflow-x-hidden scrollbar-none" aria-label="Product image thumbnails">
          {list.map((src, i) => (
            <li key={`${src}-${i}`} className="shrink-0">
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Show image ${i + 1} of ${list.length}`}
                aria-current={i === index}
                className={cn(
                  "block h-20 w-16 overflow-hidden rounded-xl border-2 bg-ink-100 transition sm:h-24 sm:w-[76px]",
                  i === index ? "border-ink-900" : "border-transparent opacity-70 hover:opacity-100",
                )}
              >
                <SafeImage src={src} alt="" className="h-full w-full object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div
        className="group relative aspect-[4/5] flex-1 cursor-zoom-in overflow-hidden rounded-3xl bg-ink-100"
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          setZoom({ x: ((e.clientX - rect.left) / rect.width) * 100, y: ((e.clientY - rect.top) / rect.height) * 100 });
        }}
        onMouseLeave={() => setZoom(null)}
      >
        <SafeImage
          key={list[index]}
          src={list[index]}
          alt={`${name} — image ${index + 1}`}
          loading="eager"
          className="h-full w-full animate-fade-up object-cover transition-transform duration-200"
          style={zoom ? { transform: "scale(1.9)", transformOrigin: `${zoom.x}% ${zoom.y}%` } : undefined}
        />
        <div className="absolute left-4 top-4 flex flex-col items-start gap-1.5">{badges}</div>
        <span className="pointer-events-none absolute bottom-4 right-4 hidden items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium text-ink-600 opacity-0 shadow transition group-hover:opacity-100 sm:flex">
          <ZoomIn className="h-3.5 w-3.5" /> Hover to zoom
        </span>
        {list.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(index - 1)}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink-800 shadow-md transition hover:bg-white"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => go(index + 1)}
              aria-label="Next image"
              className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink-800 shadow-md transition hover:bg-white"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

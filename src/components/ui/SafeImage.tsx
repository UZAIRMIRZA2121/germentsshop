"use client";

import { useState, type ImgHTMLAttributes } from "react";
import { ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";

/** <img> with lazy loading and a graceful fallback if the image fails to load. */
export function SafeImage({
  src,
  alt,
  className,
  ...props
}: ImgHTMLAttributes<HTMLImageElement> & { src: string; alt: string }) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  if (!src || failedSrc === src) {
    return (
      <div
        className={cn("flex items-center justify-center bg-ink-100 text-ink-300", className)}
        role="img"
        aria-label={alt}
      >
        <ImageOff className="h-1/4 w-1/4 max-h-10 max-w-10" aria-hidden />
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      className={className}
      onError={() => setFailedSrc(src)}
      {...props}
    />
  );
}


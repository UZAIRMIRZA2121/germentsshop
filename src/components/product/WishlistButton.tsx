"use client";

import { Heart } from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";

export function WishlistButton({
  product,
  className,
  variant = "icon",
}: {
  product: Product;
  className?: string;
  variant?: "icon" | "full";
}) {
  const { has, toggle, ready } = useWishlist();
  const active = ready && has(product.id);

  if (variant === "full") {
    return (
      <button
        type="button"
        onClick={() => toggle(product)}
        aria-pressed={active}
        className={cn(
          "inline-flex h-12 items-center justify-center gap-2 rounded-xl border px-5 text-sm font-semibold transition",
          active
            ? "border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
            : "border-ink-300 bg-white text-ink-800 hover:border-ink-900",
          className,
        )}
      >
        <Heart className="h-[18px] w-[18px]" fill={active ? "currentColor" : "none"} />
        {active ? "In Wishlist" : "Add to Wishlist"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void toggle(product);
      }}
      aria-pressed={active}
      aria-label={active ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-full bg-white/95 shadow-md transition hover:scale-110",
        active ? "text-red-500" : "text-ink-600 hover:text-red-500",
        className,
      )}
    >
      <Heart className="h-[18px] w-[18px]" fill={active ? "currentColor" : "none"} />
    </button>
  );
}


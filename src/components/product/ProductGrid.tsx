"use client";

import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ProductGridSkeleton } from "@/components/ui/Feedback";
import { ProductCard } from "./ProductCard";

export function ProductGrid({
  products,
  loading,
  columns = 4,
  skeletonCount = 4,
  className,
}: {
  products: Product[];
  loading?: boolean;
  columns?: 3 | 4;
  skeletonCount?: number;
  className?: string;
}) {
  if (loading) return <ProductGridSkeleton count={skeletonCount} />;
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-x-3 gap-y-9 sm:gap-x-5 md:grid-cols-3",
        columns === 4 && "lg:grid-cols-4",
        className,
      )}
    >
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}


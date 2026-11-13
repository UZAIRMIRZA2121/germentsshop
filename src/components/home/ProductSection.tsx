"use client";

import Link from "next/link";
import { SectionHeading } from "@/components/ui/Headings";
import { ProductGrid } from "@/components/product/ProductGrid";
import { useCatalog } from "@/context/CatalogContext";
import type { Product } from "@/lib/types";
import { discountPercent } from "@/lib/utils";

type Collection = "bestseller" | "new" | "trending" | "recommended" | "offers";

const config: Record<Collection, { eyebrow: string; title: string; description: string; href: string; pick: (p: Product[]) => Product[] }> = {
  bestseller: {
    eyebrow: "Customer favourites",
    title: "Best Sellers",
    description: "The pieces our customers keep coming back for.",
    href: "/shop?sort=popular",
    pick: (ps) => ps.filter((p) => p.tags.includes("bestseller")).sort((a, b) => b.reviewCount - a.reviewCount),
  },
  new: {
    eyebrow: "Just landed",
    title: "New Arrivals",
    description: "Fresh drops added to the store this month.",
    href: "/shop?sort=newest",
    pick: (ps) => [...ps].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  },
  trending: {
    eyebrow: "What's hot",
    title: "Trending Now",
    description: "Styles everyone is talking about right now.",
    href: "/shop?sort=popular",
    pick: (ps) => ps.filter((p) => p.tags.includes("trending")),
  },
  recommended: {
    eyebrow: "Picked for you",
    title: "Recommended Products",
    description: "Hand-picked styles we think you'll love.",
    href: "/shop",
    pick: (ps) => ps.filter((p) => p.tags.includes("recommended")),
  },
  offers: {
    eyebrow: "Limited time",
    title: "Special Offers",
    description: "The biggest discounts across the store.",
    href: "/shop?onSale=1&sort=discount",
    pick: (ps) =>
      ps
        .filter((p) => discountPercent(p.price, p.originalPrice) > 0 && p.stock > 0)
        .sort((a, b) => discountPercent(b.price, b.originalPrice) - discountPercent(a.price, a.originalPrice)),
  },
};

export function ProductSection({
  collection,
  limit = 4,
  className = "pt-16",
}: {
  collection: Collection;
  limit?: number;
  className?: string;
}) {
  const { products, ready } = useCatalog();
  const c = config[collection];
  const items = ready ? c.pick(products).slice(0, limit) : [];

  if (ready && items.length === 0) return null;

  return (
    <section className={`container-page ${className}`} aria-label={c.title}>
      <SectionHeading
        eyebrow={c.eyebrow}
        title={c.title}
        description={c.description}
        action={
          <Link href={c.href} className="text-sm font-semibold text-brand-600 hover:text-brand-700">
            View all →
          </Link>
        }
      />
      <ProductGrid products={items} loading={!ready} skeletonCount={limit} />
    </section>
  );
}


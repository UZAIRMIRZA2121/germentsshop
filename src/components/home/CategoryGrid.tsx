"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SectionHeading } from "@/components/ui/Headings";
import { SafeImage } from "@/components/ui/SafeImage";
import { Skeleton } from "@/components/ui/Feedback";
import { useCatalog } from "@/context/CatalogContext";

export function CategoryGrid() {
  const { categories, products, ready } = useCatalog();

  return (
    <section className="container-page pt-16" aria-labelledby="cat-heading">
      <SectionHeading
        eyebrow="Shop by category"
        title="Featured Categories"
        description="Find exactly what you're looking for."
        action={
          <Link href="/categories" className="text-sm font-semibold text-brand-600 hover:text-brand-700">
            View all →
          </Link>
        }
      />
      <h2 id="cat-heading" className="sr-only">Featured categories</h2>
      {!ready ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="aspect-[3/4] rounded-2xl" />
          ))}
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-6">
          {categories.slice(0, 6).map((c) => {
            const count = products.filter((p) => p.category === c.slug).length;
            return (
              <li key={c.id}>
                <Link
                  href={`/shop?category=${c.slug}`}
                  className="group relative block aspect-[3/4] overflow-hidden rounded-2xl bg-ink-100"
                >
                  <SafeImage
                    src={c.image}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink-900/80 via-ink-900/10 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-3.5 text-white">
                    <div>
                      <p className="text-[15px] font-semibold leading-tight">{c.name}</p>
                      <p className="mt-0.5 text-xs text-white/70">{count} products</p>
                    </div>
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 backdrop-blur transition group-hover:bg-brand-500">
                      <ArrowUpRight className="h-4 w-4" />
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}


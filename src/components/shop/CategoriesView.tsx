"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Breadcrumbs, PageHeader } from "@/components/ui/Headings";
import { Skeleton } from "@/components/ui/Feedback";
import { SafeImage } from "@/components/ui/SafeImage";
import { useCatalog } from "@/context/CatalogContext";

export function CategoriesView() {
  const { categories, products, ready } = useCatalog();
  return (
    <div className="container-page py-8 sm:py-10">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Categories" }]} />
      <PageHeader title="Shop by Category" description="Explore our collections — from everyday tees to statement outerwear." />
      {!ready ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="aspect-[4/3] rounded-3xl" />
          ))}
        </div>
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => {
            const count = products.filter((p) => p.category === c.slug).length;
            return (
              <li key={c.id}>
                <Link href={`/shop?category=${c.slug}`} className="group relative block aspect-[4/3] overflow-hidden rounded-3xl bg-ink-100">
                  <SafeImage src={c.image} alt="" className="absolute inset-0 h-full w-full object-cover object-top transition duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink-900/85 via-ink-900/20 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                    <p className="text-xs font-semibold uppercase tracking-wider text-brand-300">{count} products</p>
                    <h2 className="mt-1 font-display text-2xl font-semibold text-white">{c.name}</h2>
                    <p className="mt-1 line-clamp-2 text-sm text-white/75">{c.description}</p>
                    <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold">
                      Shop now <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}


"use client";

import { useEffect, useMemo, useState } from "react";
import { PackageSearch, Search, SlidersHorizontal, X } from "lucide-react";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/Feedback";
import { Breadcrumbs } from "@/components/ui/Headings";
import { Modal } from "@/components/ui/Modal";
import { useCatalog } from "@/context/CatalogContext";
import { useDebounce } from "@/hooks/useDebounce";
import { useShopFilters } from "@/hooks/useShopFilters";
import { activeFilterCount, applyFilters, sortOptions, type SortKey } from "@/lib/shopFilters";
import { formatPrice } from "@/lib/utils";
import { FilterPanel } from "./FilterPanel";

const PAGE_SIZE = 9;

export function ShopView() {
  const { products, categories, ready } = useCatalog();
  const { filters, update, clear } = useShopFilters();
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // Local search box value (debounced into the URL).
  const [search, setSearch] = useState(filters.q);
  const debouncedSearch = useDebounce(search, 300);
  useEffect(() => {
    if (document.activeElement?.id !== "shop-search") setSearch(filters.q);
  }, [filters.q]);
  useEffect(() => {
    if (debouncedSearch !== filters.q) update({ q: debouncedSearch });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const results = useMemo(() => applyFilters(products, filters), [products, filters]);
  const filterKey = JSON.stringify(filters);
  useEffect(() => setVisible(PAGE_SIZE), [filterKey]);

  const shown = results.slice(0, visible);
  const remaining = results.length - shown.length;
  const count = activeFilterCount(filters);

  const loadMore = async () => {
    setLoadingMore(true);
    await new Promise((r) => setTimeout(r, 450));
    setVisible((v) => v + PAGE_SIZE);
    setLoadingMore(false);
  };

  const heading =
    filters.categories.length === 1
      ? (categories.find((c) => c.slug === filters.categories[0])?.name ?? "Shop")
      : filters.q
        ? `Results for “${filters.q}”`
        : "Shop All Products";

  const chips: Array<{ label: string; onRemove: () => void }> = [
    ...filters.categories.map((slug) => ({
      label: categories.find((c) => c.slug === slug)?.name ?? slug,
      onRemove: () => update({ categories: filters.categories.filter((c) => c !== slug) }),
    })),
    ...(filters.minPrice !== null || filters.maxPrice !== null
      ? [
          {
            label: `${filters.minPrice !== null ? formatPrice(filters.minPrice) : "Any"} – ${filters.maxPrice !== null ? formatPrice(filters.maxPrice) : "Any"}`,
            onRemove: () => update({ minPrice: null, maxPrice: null }),
          },
        ]
      : []),
    ...(filters.inStock ? [{ label: "In stock", onRemove: () => update({ inStock: false }) }] : []),
    ...(filters.outOfStock ? [{ label: "Out of stock", onRemove: () => update({ outOfStock: false }) }] : []),
    ...(filters.onSale ? [{ label: "On sale", onRemove: () => update({ onSale: false }) }] : []),
    ...filters.sizes.map((s) => ({ label: `Size ${s}`, onRemove: () => update({ sizes: filters.sizes.filter((x) => x !== s) }) })),
    ...filters.colors.map((c) => ({ label: c, onRemove: () => update({ colors: filters.colors.filter((x) => x !== c) }) })),
  ];

  return (
    <div className="container-page py-8 sm:py-10">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Shop" }]} />

      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl">{heading}</h1>
          <p className="mt-1.5 text-sm text-ink-500" aria-live="polite">
            {ready ? `${results.length} product${results.length === 1 ? "" : "s"} found` : "Loading products…"}
          </p>
        </div>
      </div>

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <label htmlFor="shop-search" className="sr-only">
            Search products
          </label>
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" aria-hidden />
          <input
            id="shop-search"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, colour or category…"
            className="input-base !h-11 !rounded-full !pl-10"
          />
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1 lg:hidden" onClick={() => setDrawerOpen(true)} leftIcon={<SlidersHorizontal className="h-4 w-4" />}>
            Filters{count > 0 ? ` (${count})` : ""}
          </Button>
          <div className="flex-1 sm:flex-none">
            <label htmlFor="sort" className="sr-only">
              Sort products
            </label>
            <select
              id="sort"
              value={filters.sort}
              onChange={(e) => update({ sort: e.target.value as SortKey })}
              className="input-base !h-11 sm:w-52"
            >
              {sortOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  Sort: {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {chips.length > 0 && (
        <div className="mb-5 flex flex-wrap items-center gap-2" aria-label="Active filters">
          {chips.map((chip) => (
            <button
              key={chip.label}
              type="button"
              onClick={chip.onRemove}
              className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700 ring-1 ring-brand-200 transition hover:bg-brand-100"
              aria-label={`Remove filter ${chip.label}`}
            >
              {chip.label}
              <X className="h-3 w-3" />
            </button>
          ))}
          <button type="button" onClick={clear} className="text-xs font-semibold text-ink-500 underline-offset-2 hover:text-ink-900 hover:underline">
            Clear all
          </button>
        </div>
      )}

      <div className="grid gap-10 lg:grid-cols-[260px_1fr]">
        <aside className="hidden lg:block" aria-label="Product filters">
          <div className="sticky top-28 max-h-[calc(100vh-8rem)] overflow-y-auto pr-3 scrollbar-none">
            <FilterPanel filters={filters} update={update} clear={clear} />
          </div>
        </aside>

        <section aria-label="Products">
          {!ready ? (
            <ProductGrid products={[]} loading columns={3} skeletonCount={6} />
          ) : results.length === 0 ? (
            <EmptyState
              icon={<PackageSearch />}
              title="No products found"
              description="We couldn't find anything matching your search and filters. Try adjusting or clearing them."
              action={<Button onClick={() => { setSearch(""); clear(); }}>Clear search &amp; filters</Button>}
            />
          ) : (
            <>
              <ProductGrid products={shown} columns={3} />
              <div className="mt-12 flex flex-col items-center gap-3">
                <p className="text-sm text-ink-500">
                  Showing {shown.length} of {results.length} products
                </p>
                <div className="h-1.5 w-56 overflow-hidden rounded-full bg-ink-100" aria-hidden>
                  <div className="h-full rounded-full bg-brand-500 transition-all" style={{ width: `${(shown.length / results.length) * 100}%` }} />
                </div>
                {remaining > 0 && (
                  <Button variant="outline" size="lg" loading={loadingMore} onClick={loadMore}>
                    Load more ({remaining} remaining)
                  </Button>
                )}
              </div>
            </>
          )}
        </section>
      </div>

      <Modal
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Filter products"
        footer={
          <>
            <Button variant="outline" onClick={clear}>
              Clear all
            </Button>
            <Button onClick={() => setDrawerOpen(false)}>Show {results.length} results</Button>
          </>
        }
      >
        <FilterPanel filters={filters} update={update} clear={clear} />
      </Modal>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { SafeImage } from "@/components/ui/SafeImage";
import { useCatalog } from "@/context/CatalogContext";
import { useDebounce } from "@/hooks/useDebounce";
import { formatPrice, cn } from "@/lib/utils";

export function SearchBar({ className, onNavigate }: { className?: string; onNavigate?: () => void }) {
  const router = useRouter();
  const { products } = useCatalog();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const debounced = useDebounce(query, 200);
  const wrapRef = useRef<HTMLDivElement>(null);

  const results =
    debounced.trim().length >= 2
      ? products
          .filter((p) => {
            const hay = `${p.name} ${p.category} ${p.shortDescription}`.toLowerCase();
            return debounced
              .toLowerCase()
              .split(/\s+/)
              .filter(Boolean)
              .every((term) => hay.includes(term));
          })
          .slice(0, 5)
      : [];

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    setOpen(false);
    onNavigate?.();
    router.push(q ? `/shop?q=${encodeURIComponent(q)}` : "/shop");
  };

  return (
    <div ref={wrapRef} className={cn("relative", className)}>
      <form onSubmit={submit} role="search" className="relative">
        <label htmlFor="site-search" className="sr-only">
          Search products
        </label>
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" aria-hidden />
        <input
          id="site-search"
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
          placeholder="Search jeans, hoodies, dresses…"
          autoComplete="off"
          className="h-11 w-full rounded-full border border-ink-200 bg-ink-50 pl-10 pr-10 text-sm text-ink-900 transition placeholder:text-ink-400 hover:border-ink-300 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/25 [&::-webkit-search-cancel-button]:hidden"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setOpen(false);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-ink-400 hover:bg-ink-200 hover:text-ink-700"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </form>

      {open && debounced.trim().length >= 2 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-xl">
          {results.length > 0 ? (
            <>
              <ul>
                {results.map((p) => (
                  <li key={p.id}>
                    <Link
                      href={`/product/${p.slug}`}
                      onClick={() => {
                        setOpen(false);
                        setQuery("");
                        onNavigate?.();
                      }}
                      className="flex items-center gap-3 px-3 py-2.5 transition hover:bg-ink-50"
                    >
                      <SafeImage src={p.images[0]} alt="" className="h-12 w-10 rounded-md object-cover" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-ink-900">{p.name}</span>
                        <span className="text-xs text-ink-500">{formatPrice(p.price)}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={submit}
                className="w-full border-t border-ink-100 bg-ink-50 px-4 py-2.5 text-left text-sm font-semibold text-brand-600 hover:text-brand-700"
              >
                See all results for “{debounced.trim()}”
              </button>
            </>
          ) : (
            <p className="px-4 py-5 text-center text-sm text-ink-500">No products match “{debounced.trim()}”.</p>
          )}
        </div>
      )}
    </div>
  );
}


import type { Product } from "./types";
import { discountPercent } from "./utils";

export type SortKey =
  | "featured"
  | "newest"
  | "popular"
  | "price-asc"
  | "price-desc"
  | "rating"
  | "discount";

export const sortOptions: Array<{ value: SortKey; label: string }> = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest first" },
  { value: "popular", label: "Most popular" },
  { value: "rating", label: "Top rated" },
  { value: "discount", label: "Biggest discount" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
];

export interface ShopFilters {
  q: string;
  categories: string[];
  minPrice: number | null;
  maxPrice: number | null;
  sort: SortKey;
  inStock: boolean;
  outOfStock: boolean;
  onSale: boolean;
  sizes: string[];
  colors: string[];
}

export const defaultFilters: ShopFilters = {
  q: "",
  categories: [],
  minPrice: null,
  maxPrice: null,
  sort: "featured",
  inStock: false,
  outOfStock: false,
  onSale: false,
  sizes: [],
  colors: [],
};

const list = (v: string | null) => (v ? v.split(",").map((s) => s.trim()).filter(Boolean) : []);
const num = (v: string | null) => {
  if (v === null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : null;
};

export function parseFilters(params: URLSearchParams): ShopFilters {
  const sort = params.get("sort") as SortKey | null;
  const avail = list(params.get("avail"));
  return {
    q: params.get("q") ?? "",
    categories: list(params.get("category")),
    minPrice: num(params.get("min")),
    maxPrice: num(params.get("max")),
    sort: sort && sortOptions.some((o) => o.value === sort) ? sort : "featured",
    inStock: avail.includes("in"),
    outOfStock: avail.includes("out"),
    onSale: params.get("onSale") === "1",
    sizes: list(params.get("size")),
    colors: list(params.get("color")),
  };
}

export function serializeFilters(f: ShopFilters): string {
  const p = new URLSearchParams();
  if (f.q.trim()) p.set("q", f.q.trim());
  if (f.categories.length) p.set("category", f.categories.join(","));
  if (f.minPrice !== null) p.set("min", String(f.minPrice));
  if (f.maxPrice !== null) p.set("max", String(f.maxPrice));
  if (f.sort !== "featured") p.set("sort", f.sort);
  const avail = [f.inStock && "in", f.outOfStock && "out"].filter(Boolean);
  if (avail.length) p.set("avail", avail.join(","));
  if (f.onSale) p.set("onSale", "1");
  if (f.sizes.length) p.set("size", f.sizes.join(","));
  if (f.colors.length) p.set("color", f.colors.join(","));
  return p.toString();
}

export function activeFilterCount(f: ShopFilters): number {
  return (
    f.categories.length +
    (f.minPrice !== null || f.maxPrice !== null ? 1 : 0) +
    (f.inStock ? 1 : 0) +
    (f.outOfStock ? 1 : 0) +
    (f.onSale ? 1 : 0) +
    f.sizes.length +
    f.colors.length
  );
}

export function applyFilters(products: Product[], f: ShopFilters): Product[] {
  const terms = f.q.toLowerCase().split(/\s+/).filter(Boolean);

  const filtered = products.filter((p) => {
    if (terms.length) {
      const hay = `${p.name} ${p.category.replace(/-/g, " ")} ${p.shortDescription} ${p.sku} ${p.colors.map((c) => c.name).join(" ")}`.toLowerCase();
      if (!terms.every((t) => hay.includes(t))) return false;
    }
    if (f.categories.length && !f.categories.includes(p.category)) return false;
    if (f.minPrice !== null && p.price < f.minPrice) return false;
    if (f.maxPrice !== null && p.price > f.maxPrice) return false;
    // Availability: if only one box is ticked filter to it, both/none show all.
    if (f.inStock !== f.outOfStock) {
      if (f.inStock && p.stock <= 0) return false;
      if (f.outOfStock && p.stock > 0) return false;
    }
    if (f.onSale && discountPercent(p.price, p.originalPrice) <= 0) return false;
    if (f.sizes.length && !f.sizes.some((s) => p.sizes.includes(s))) return false;
    if (f.colors.length && !f.colors.some((c) => p.colors.some((pc) => pc.name === c))) return false;
    return true;
  });

  const sorted = [...filtered];
  switch (f.sort) {
    case "newest":
      sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      break;
    case "popular":
      sorted.sort((a, b) => b.reviewCount - a.reviewCount);
      break;
    case "rating":
      sorted.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
      break;
    case "discount":
      sorted.sort((a, b) => discountPercent(b.price, b.originalPrice) - discountPercent(a.price, a.originalPrice));
      break;
    case "price-asc":
      sorted.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      sorted.sort((a, b) => b.price - a.price);
      break;
    default: {
      // Featured: available first, featured/bestseller tags boosted.
      const score = (p: Product) =>
        (p.stock > 0 ? 100 : 0) +
        (p.tags.includes("featured") ? 20 : 0) +
        (p.tags.includes("bestseller") ? 10 : 0) +
        p.rating;
      sorted.sort((a, b) => score(b) - score(a));
    }
  }
  return sorted;
}


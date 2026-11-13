import { emitStorageChange, STORAGE_KEYS } from "../storage";
import type { Product, ProductInput } from "../types";
import { fail, ok, type Result } from "./result";

export const productService = {
  async list(): Promise<Product[]> {
    const res = await fetch("/api/products", { cache: "no-store" });
    if (!res.ok) return [];
    const data = (await res.json()) as { products: Product[] };
    return data.products;
  },

  async getBySlug(slug: string): Promise<Product | null> {
    const res = await fetch(`/api/products/${encodeURIComponent(slug)}`, { cache: "no-store" });
    if (!res.ok) return null;
    const data = (await res.json()) as { product: Product };
    return data.product;
  },

  async create(input: ProductInput): Promise<Result<Product>> {
    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const data = (await res.json()) as { product?: Product; error?: string };
    if (!res.ok || !data.product) return fail(data.error || "Could not create product.");
    emitStorageChange(STORAGE_KEYS.products);
    return ok(data.product);
  },

  async update(id: string, input: ProductInput): Promise<Result<Product>> {
    const res = await fetch(`/api/products/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const data = (await res.json()) as { product?: Product; error?: string };
    if (!res.ok || !data.product) return fail(data.error || "Could not update product.");
    emitStorageChange(STORAGE_KEYS.products);
    return ok(data.product);
  },

  async remove(id: string): Promise<void> {
    await fetch(`/api/products/${encodeURIComponent(id)}`, { method: "DELETE" });
    emitStorageChange(STORAGE_KEYS.products);
  },
};

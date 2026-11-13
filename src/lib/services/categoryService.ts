import { emitStorageChange, STORAGE_KEYS } from "../storage";
import type { Category } from "../types";
import { fail, ok, type Result } from "./result";

export const categoryService = {
  async list(): Promise<Category[]> {
    const res = await fetch("/api/categories", { cache: "no-store" });
    if (!res.ok) return [];
    const data = (await res.json()) as { categories: Category[] };
    return data.categories;
  },

  async create(
    input: Omit<Category, "id" | "slug"> & { slug?: string },
  ): Promise<Result<Category>> {
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const data = (await res.json()) as { category?: Category; error?: string };
    if (!res.ok || !data.category) return fail(data.error || "Could not create category.");
    emitStorageChange(STORAGE_KEYS.categories);
    return ok(data.category);
  },

  async update(id: string, input: Omit<Category, "id" | "slug">): Promise<Result<Category>> {
    const res = await fetch(`/api/categories/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const data = (await res.json()) as { category?: Category; error?: string };
    if (!res.ok || !data.category) return fail(data.error || "Could not update category.");
    emitStorageChange(STORAGE_KEYS.categories);
    return ok(data.category);
  },

  async remove(id: string): Promise<void> {
    await fetch(`/api/categories/${encodeURIComponent(id)}`, { method: "DELETE" });
    emitStorageChange(STORAGE_KEYS.categories);
  },
};

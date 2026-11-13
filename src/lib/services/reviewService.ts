import { emitStorageChange, STORAGE_KEYS } from "../storage";
import type { Review } from "../types";

export const reviewService = {
  async listForProduct(slug: string): Promise<Review[]> {
    const res = await fetch(`/api/reviews?slug=${encodeURIComponent(slug)}`, { cache: "no-store" });
    if (!res.ok) return [];
    const data = (await res.json()) as { reviews: Review[] };
    return data.reviews;
  },

  async add(slug: string, review: Omit<Review, "id" | "date" | "verified">): Promise<Review> {
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, ...review }),
    });
    const data = (await res.json()) as { review: Review };
    emitStorageChange(STORAGE_KEYS.reviews);
    return data.review;
  },
};

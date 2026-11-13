import { STORAGE_KEYS, readJSON, readSession, writeJSON, writeSession } from "../storage";
import type { CartItem } from "../types";

const BUY_NOW_KEY = "buy-now";

export const cartService = {
  async getCart(): Promise<CartItem[]> {
    const stored = readJSON<CartItem[]>(STORAGE_KEYS.cart, []);
    return Array.isArray(stored) ? stored : [];
  },
  async saveCart(items: CartItem[]): Promise<void> {
    writeJSON(STORAGE_KEYS.cart, items);
  },

  async getWishlist(): Promise<string[]> {
    const stored = readJSON<string[]>(STORAGE_KEYS.wishlist, []);
    return Array.isArray(stored) ? stored : [];
  },
  async saveWishlist(ids: string[]): Promise<void> {
    writeJSON(STORAGE_KEYS.wishlist, ids);
  },

  async getCoupon(): Promise<string | null> {
    return readJSON<string | null>(STORAGE_KEYS.coupon, null);
  },
  async saveCoupon(code: string | null): Promise<void> {
    writeJSON(STORAGE_KEYS.coupon, code);
  },

  /** "Buy now" is a single-item checkout kept in sessionStorage for this tab. */
  getBuyNow(): CartItem | null {
    return readSession<CartItem | null>(BUY_NOW_KEY, null);
  },
  saveBuyNow(item: CartItem | null): void {
    writeSession(BUY_NOW_KEY, item);
  },
};


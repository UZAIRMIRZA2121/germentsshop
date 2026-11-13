"use client";

import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";
import { useStoredResource } from "@/hooks/useStoredResource";
import { cartService } from "@/lib/services/cartService";
import { STORAGE_KEYS } from "@/lib/storage";
import type { Product } from "@/lib/types";
import { useToast } from "./ToastContext";

interface WishlistContextValue {
  ready: boolean;
  ids: string[];
  count: number;
  has: (productId: string) => boolean;
  toggle: (product: Product) => Promise<void>;
  remove: (product: Product) => Promise<void>;
  clear: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);
const KEYS = [STORAGE_KEYS.wishlist];

export function WishlistProvider({ children }: { children: ReactNode }) {
  const toast = useToast();
  const { data: ids, ready } = useStoredResource<string[]>(KEYS, () => cartService.getWishlist(), []);

  const has = useCallback((id: string) => ids.includes(id), [ids]);

  const toggle = useCallback<WishlistContextValue["toggle"]>(
    async (product) => {
      const current = await cartService.getWishlist();
      if (current.includes(product.id)) {
        await cartService.saveWishlist(current.filter((i) => i !== product.id));
        toast.info("Removed from wishlist", { message: product.name });
      } else {
        await cartService.saveWishlist([product.id, ...current]);
        toast.success("Added to wishlist", {
          message: product.name,
          action: { label: "View wishlist", href: "/wishlist" },
        });
      }
    },
    [toast],
  );

  const remove = useCallback<WishlistContextValue["remove"]>(
    async (product) => {
      const current = await cartService.getWishlist();
      await cartService.saveWishlist(current.filter((i) => i !== product.id));
      toast.info("Removed from wishlist", { message: product.name });
    },
    [toast],
  );

  const clear = useCallback(async () => {
    await cartService.saveWishlist([]);
    toast.info("Wishlist cleared");
  }, [toast]);

  const value = useMemo(
    () => ({ ready, ids, count: ids.length, has, toggle, remove, clear }),
    [ready, ids, has, toggle, remove, clear],
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist(): WishlistContextValue {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}


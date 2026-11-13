"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useStoredResource } from "@/hooks/useStoredResource";
import { cartKey, maxQuantityFor, resolveLine, validateSelection } from "@/lib/cart";
import { MAX_QTY_PER_ITEM } from "@/lib/config/payment";
import { calculateTotals, validateCoupon } from "@/lib/pricing";
import { cartService } from "@/lib/services/cartService";
import { STORAGE_KEYS, subscribeToStorage } from "@/lib/storage";
import type { CartItem, CartLine, Product, Totals } from "@/lib/types";
import { useCatalog } from "./CatalogContext";
import { useToast } from "./ToastContext";

export interface AddToCartInput {
  size: string | null;
  color: string | null;
  quantity: number;
}

export interface CartActionResult {
  ok: boolean;
  message?: string;
}

interface CartContextValue {
  ready: boolean;
  /** Every cart line whose product still exists in the catalog. */
  lines: CartLine[];
  /** Lines that can actually be purchased (in stock). */
  payableLines: CartLine[];
  hasUnavailable: boolean;
  itemCount: number;
  totals: Totals;
  couponCode: string | null;
  couponError: string | null;
  addToCart: (product: Product, input: AddToCartInput) => Promise<CartActionResult>;
  updateQuantity: (key: string, quantity: number) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
  removeKeys: (keys: string[]) => Promise<void>;
  clearCart: () => Promise<void>;
  applyCoupon: (code: string) => Promise<CartActionResult>;
  removeCoupon: () => Promise<void>;
  /** Single-item "Buy now" checkout (kept in sessionStorage). */
  buyNowLine: CartLine | null;
  startBuyNow: (product: Product, input: AddToCartInput) => CartActionResult;
  clearBuyNow: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

const CART_KEYS = [STORAGE_KEYS.cart];
const COUPON_KEYS = [STORAGE_KEYS.coupon];

export function CartProvider({ children }: { children: ReactNode }) {
  const toast = useToast();
  const { products, ready: catalogReady } = useCatalog();
  const cartRes = useStoredResource<CartItem[]>(CART_KEYS, () => cartService.getCart(), []);
  const couponRes = useStoredResource<string | null>(COUPON_KEYS, () => cartService.getCoupon(), null);
  const [buyNowItem, setBuyNowItem] = useState<CartItem | null>(null);

  // sessionStorage-backed buy-now item
  useEffect(() => {
    setBuyNowItem(cartService.getBuyNow());
    return subscribeToStorage(["session:buy-now"], () => setBuyNowItem(cartService.getBuyNow()));
  }, []);

  const ready = cartRes.ready && couponRes.ready && catalogReady;

  const lines = useMemo(
    () =>
      cartRes.data
        .map((item) => resolveLine(item, products))
        .filter((l): l is CartLine => l !== null),
    [cartRes.data, products],
  );
  const payableLines = useMemo(() => lines.filter((l) => !l.outOfStock), [lines]);
  const couponCode = couponRes.data;

  const totals = useMemo(
    () => calculateTotals(payableLines, couponCode),
    [payableLines, couponCode],
  );

  // Keep quantities within live stock (e.g. after an admin changes stock).
  useEffect(() => {
    if (!ready) return;
    const needsClamp = lines.some((l) => !l.outOfStock && l.quantity > l.maxQty);
    const orphaned = cartRes.data.some((i) => !products.some((p) => p.id === i.productId));
    if (!needsClamp && !orphaned) return;
    const next = cartRes.data
      .filter((i) => products.some((p) => p.id === i.productId))
      .map((i) => {
        const p = products.find((x) => x.id === i.productId)!;
        const max = maxQuantityFor(p);
        return max > 0 && i.quantity > max ? { ...i, quantity: max } : i;
      });
    void cartService.saveCart(next);
    if (needsClamp) toast.warning("Some quantities were adjusted to match available stock.");
  }, [ready, lines, cartRes.data, products, toast]);

  const addToCart = useCallback<CartContextValue["addToCart"]>(
    async (product, input) => {
      if (product.stock <= 0) {
        const message = `${product.name} is currently out of stock.`;
        toast.error("Out of stock", { message });
        return { ok: false, message };
      }
      const errors = validateSelection(product, input);
      const firstError = errors.size ?? errors.color ?? errors.quantity;
      if (firstError) {
        toast.warning("Selection required", { message: firstError });
        return { ok: false, message: firstError };
      }

      const current = await cartService.getCart();
      const item: CartItem = { productId: product.id, size: input.size, color: input.color, quantity: input.quantity };
      const key = cartKey(item);
      const existing = current.find((c) => cartKey(c) === key);
      const max = maxQuantityFor(product);
      const desired = (existing?.quantity ?? 0) + input.quantity;
      const quantity = Math.min(desired, max);

      const next = existing
        ? current.map((c) => (cartKey(c) === key ? { ...c, quantity } : c))
        : [...current, { ...item, quantity }];
      await cartService.saveCart(next);

      if (desired > max) {
        toast.warning("Maximum quantity reached", {
          message: `You can order up to ${max} of "${product.name}" (${product.stock <= MAX_QTY_PER_ITEM ? "limited stock" : "per-order limit"}).`,
          action: { label: "View cart", href: "/cart" },
        });
      } else {
        toast.success("Added to cart", {
          message: product.name,
          action: { label: "View cart", href: "/cart" },
        });
      }
      return { ok: true };
    },
    [toast],
  );

  const updateQuantity = useCallback<CartContextValue["updateQuantity"]>(
    async (key, quantity) => {
      const current = await cartService.getCart();
      const target = current.find((c) => cartKey(c) === key);
      if (!target) return;
      const product = products.find((p) => p.id === target.productId);
      const max = product ? maxQuantityFor(product) : MAX_QTY_PER_ITEM;
      if (!Number.isFinite(quantity) || quantity < 1) {
        toast.warning("Quantity must be at least 1", { message: "Use the remove button to delete an item." });
        return;
      }
      if (quantity > max) {
        toast.warning(`Only ${max} available`, { message: "You've reached the maximum quantity for this item." });
        quantity = max;
      }
      await cartService.saveCart(current.map((c) => (cartKey(c) === key ? { ...c, quantity } : c)));
    },
    [products, toast],
  );

  const removeItem = useCallback<CartContextValue["removeItem"]>(
    async (key) => {
      const current = await cartService.getCart();
      const target = current.find((c) => cartKey(c) === key);
      await cartService.saveCart(current.filter((c) => cartKey(c) !== key));
      const name = target ? products.find((p) => p.id === target.productId)?.name : undefined;
      toast.info("Removed from cart", { message: name });
    },
    [products, toast],
  );

  const removeKeys = useCallback<CartContextValue["removeKeys"]>(async (keys) => {
    const current = await cartService.getCart();
    await cartService.saveCart(current.filter((c) => !keys.includes(cartKey(c))));
  }, []);

  const clearCart = useCallback<CartContextValue["clearCart"]>(async () => {
    await cartService.saveCart([]);
    await cartService.saveCoupon(null);
    toast.info("Cart cleared");
  }, [toast]);

  const applyCoupon = useCallback<CartContextValue["applyCoupon"]>(
    async (code) => {
      const subtotal = payableLines.reduce((n, l) => n + l.lineTotal, 0);
      const result = validateCoupon(code, subtotal);
      if (!result.ok) {
        toast.error("Coupon not applied", { message: result.message });
        return { ok: false, message: result.message };
      }
      await cartService.saveCoupon(result.coupon.code);
      toast.success(`Coupon ${result.coupon.code} applied`, { message: result.coupon.description });
      return { ok: true };
    },
    [payableLines, toast],
  );

  const removeCoupon = useCallback<CartContextValue["removeCoupon"]>(async () => {
    await cartService.saveCoupon(null);
    toast.info("Coupon removed");
  }, [toast]);

  const startBuyNow = useCallback<CartContextValue["startBuyNow"]>(
    (product, input) => {
      if (product.stock <= 0) {
        const message = `${product.name} is currently out of stock.`;
        toast.error("Out of stock", { message });
        return { ok: false, message };
      }
      const errors = validateSelection(product, input);
      const firstError = errors.size ?? errors.color ?? errors.quantity;
      if (firstError) {
        toast.warning("Selection required", { message: firstError });
        return { ok: false, message: firstError };
      }
      const item: CartItem = { productId: product.id, size: input.size, color: input.color, quantity: input.quantity };
      cartService.saveBuyNow(item);
      setBuyNowItem(item);
      return { ok: true };
    },
    [toast],
  );

  const clearBuyNow = useCallback(() => {
    cartService.saveBuyNow(null);
    setBuyNowItem(null);
  }, []);

  const buyNowLine = useMemo(
    () => (buyNowItem ? resolveLine(buyNowItem, products) : null),
    [buyNowItem, products],
  );

  const couponError = totals.couponError ?? null;

  // A coupon whose minimum is no longer met (e.g. after removing items) is shown as an error, not silently dropped.
  const value = useMemo<CartContextValue>(
    () => ({
      ready,
      lines,
      payableLines,
      hasUnavailable: lines.some((l) => l.outOfStock),
      itemCount: payableLines.reduce((n, l) => n + l.quantity, 0),
      totals,
      couponCode,
      couponError,
      addToCart,
      updateQuantity,
      removeItem,
      removeKeys,
      clearCart,
      applyCoupon,
      removeCoupon,
      buyNowLine,
      startBuyNow,
      clearBuyNow,
    }),
    [
      ready, lines, payableLines, totals, couponCode, couponError, addToCart, updateQuantity,
      removeItem, removeKeys, clearCart, applyCoupon, removeCoupon, buyNowLine, startBuyNow, clearBuyNow,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}


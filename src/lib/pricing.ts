import { demoCoupons } from "./config/coupons";
import { shippingConfig } from "./config/payment";
import type { Coupon, Totals } from "./types";

export type CouponResult =
  | { ok: true; coupon: Coupon }
  | { ok: false; message: string };

export function findCoupon(code: string): Coupon | undefined {
  const normalized = code.trim().toUpperCase();
  return demoCoupons.find((c) => c.code === normalized);
}

export function validateCoupon(code: string, subtotal: number): CouponResult {
  const normalized = code.trim();
  if (!normalized) return { ok: false, message: "Please enter a coupon code." };
  const coupon = findCoupon(normalized);
  if (!coupon) return { ok: false, message: "This coupon code is not valid." };
  if (subtotal < coupon.minSubtotal) {
    return {
      ok: false,
      message: `Add Rs. ${(coupon.minSubtotal - subtotal).toLocaleString("en-PK")} more to use ${coupon.code}.`,
    };
  }
  return { ok: true, coupon };
}

interface PricedLine {
  unitPrice: number;
  originalPrice?: number;
  quantity: number;
}

export function calculateTotals(
  lines: PricedLine[],
  couponCode?: string | null,
): Totals & { couponError?: string } {
  const itemCount = lines.reduce((n, l) => n + l.quantity, 0);
  const subtotal = lines.reduce((n, l) => n + l.unitPrice * l.quantity, 0);
  const productSavings = lines.reduce(
    (n, l) =>
      n +
      (l.originalPrice && l.originalPrice > l.unitPrice
        ? (l.originalPrice - l.unitPrice) * l.quantity
        : 0),
    0,
  );

  let couponDiscount = 0;
  let freeShippingCoupon = false;
  let couponError: string | undefined;

  if (couponCode && lines.length > 0) {
    const result = validateCoupon(couponCode, subtotal);
    if (result.ok) {
      const { coupon } = result;
      if (coupon.type === "percent") {
        couponDiscount = Math.round((subtotal * coupon.value) / 100);
        if (coupon.maxDiscount) couponDiscount = Math.min(couponDiscount, coupon.maxDiscount);
      } else if (coupon.type === "fixed") {
        couponDiscount = Math.min(coupon.value, subtotal);
      } else {
        freeShippingCoupon = true;
      }
    } else {
      couponError = result.message;
    }
  }

  const afterDiscount = subtotal - couponDiscount;
  const qualifiesForFree =
    afterDiscount >= shippingConfig.freeShippingThreshold || freeShippingCoupon;
  const shipping =
    lines.length === 0 ? 0 : qualifiesForFree ? 0 : shippingConfig.flatRate;

  return {
    itemCount,
    subtotal,
    productSavings,
    couponDiscount,
    shipping,
    freeShippingApplied: lines.length > 0 && shipping === 0,
    total: Math.max(0, afterDiscount + shipping),
    couponError,
  };
}


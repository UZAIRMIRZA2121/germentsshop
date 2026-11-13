import type { FulfillmentStatus, PaymentStatus } from "./types";

export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

const priceFormatter = new Intl.NumberFormat("en-PK", {
  maximumFractionDigits: 0,
});

export function formatPrice(value: number): string {
  return `Rs. ${priceFormatter.format(Math.round(value))}`;
}

export function formatDate(iso: string, withTime = false): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const date = d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  if (!withTime) return date;
  const time = d.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${date}, ${time}`;
}

export function formatShortDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}

export function discountPercent(price: number, original?: number): number {
  if (!original || original <= price) return 0;
  return Math.round(((original - price) / original) * 100);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function uid(prefix = "id"): string {
  return `${prefix}_${Date.now().toString(36)}${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(Math.max(n, min), max);
}

export function addDays(date: Date | string, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

/* ----------------------------- Status labels ----------------------------- */

export const FULFILLMENT_LABELS: Record<FulfillmentStatus, string> = {
  placed: "Order Placed",
  confirmed: "Order Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export const PAYMENT_LABELS: Record<PaymentStatus, string> = {
  cod_pending: "Pay on Delivery",
  cod_collected: "Cash Collected",
  verification_pending: "Payment Verification Pending",
  verified: "Payment Verified",
  rejected: "Payment Rejected",
};

/** The ordered happy-path timeline. */
export const FULFILLMENT_STEPS: FulfillmentStatus[] = [
  "placed",
  "confirmed",
  "processing",
  "shipped",
  "out_for_delivery",
  "delivered",
];

export function statusTone(
  status: FulfillmentStatus | PaymentStatus,
): "success" | "warning" | "danger" | "info" | "neutral" {
  switch (status) {
    case "delivered":
    case "verified":
    case "cod_collected":
      return "success";
    case "cancelled":
    case "rejected":
      return "danger";
    case "verification_pending":
    case "placed":
      return "warning";
    case "cod_pending":
      return "neutral";
    default:
      return "info";
  }
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}


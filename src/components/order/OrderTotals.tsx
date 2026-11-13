import type { Totals } from "@/lib/types";
import { formatPrice } from "@/lib/utils";

export function OrderTotals({
  totals,
  couponCode,
  emphasizeTotal = true,
}: {
  totals: Pick<Totals, "subtotal" | "productSavings" | "couponDiscount" | "shipping" | "total" | "freeShippingApplied">;
  couponCode?: string | null;
  emphasizeTotal?: boolean;
}) {
  return (
    <dl className="space-y-2.5 text-sm">
      <div className="flex justify-between">
        <dt className="text-ink-600">Subtotal</dt>
        <dd className="font-medium text-ink-900">{formatPrice(totals.subtotal)}</dd>
      </div>
      {totals.productSavings > 0 && (
        <div className="flex justify-between text-emerald-600">
          <dt>Product discounts (already applied)</dt>
          <dd className="font-medium">−{formatPrice(totals.productSavings)}</dd>
        </div>
      )}
      {totals.couponDiscount > 0 && (
        <div className="flex justify-between text-emerald-600">
          <dt>Coupon{couponCode ? ` (${couponCode})` : ""}</dt>
          <dd className="font-medium">−{formatPrice(totals.couponDiscount)}</dd>
        </div>
      )}
      <div className="flex justify-between">
        <dt className="text-ink-600">Shipping</dt>
        <dd className="font-medium text-ink-900">
          {totals.shipping === 0 ? <span className="text-emerald-600">Free</span> : formatPrice(totals.shipping)}
        </dd>
      </div>
      <div className={`flex items-baseline justify-between border-t border-ink-200 pt-3.5 ${emphasizeTotal ? "" : "text-sm"}`}>
        <dt className="text-base font-semibold text-ink-900">Total payable</dt>
        <dd className="text-2xl font-bold text-ink-900">{formatPrice(totals.total)}</dd>
      </div>
    </dl>
  );
}


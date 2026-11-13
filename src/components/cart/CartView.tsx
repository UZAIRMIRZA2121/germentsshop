"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertTriangle, ShoppingBag, Tag, Trash2, Truck, X } from "lucide-react";
import { Alert } from "@/components/ui/Alert";
import { Button, LinkButton } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/Modal";
import { EmptyState, PageLoader } from "@/components/ui/Feedback";
import { Breadcrumbs, PageHeader } from "@/components/ui/Headings";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { SafeImage } from "@/components/ui/SafeImage";
import { OrderTotals } from "@/components/order/OrderTotals";
import { useCart } from "@/context/CartContext";
import { demoCoupons } from "@/lib/config/coupons";
import { shippingConfig } from "@/lib/config/payment";
import { cn, formatPrice } from "@/lib/utils";

export function CartView() {
  const cart = useCart();
  const [code, setCode] = useState("");
  const [applying, setApplying] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  if (!cart.ready) return <div className="container-page py-16"><PageLoader label="Loading your cart…" /></div>;

  const { lines, totals } = cart;

  if (lines.length === 0) {
    return (
      <div className="container-page py-10">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Cart" }]} />
        <EmptyState
          className="py-20"
          icon={<ShoppingBag />}
          title="Your cart is empty"
          description="Looks like you haven't added anything yet. Explore our latest styles and find something you love."
          action={
            <>
              <LinkButton href="/shop" size="lg">Start shopping</LinkButton>
              <LinkButton href="/wishlist" size="lg" variant="outline">View wishlist</LinkButton>
            </>
          }
        />
      </div>
    );
  }

  const apply = async (value = code) => {
    setApplying(true);
    const res = await cart.applyCoupon(value);
    setApplying(false);
    if (res.ok) setCode("");
  };

  const subtotalAfterCoupon = totals.subtotal - totals.couponDiscount;
  const toFree = Math.max(0, shippingConfig.freeShippingThreshold - subtotalAfterCoupon);
  const progress = Math.min(100, (subtotalAfterCoupon / shippingConfig.freeShippingThreshold) * 100);
  const canCheckout = cart.payableLines.length > 0 && !cart.hasUnavailable;

  return (
    <div className="container-page py-8 sm:py-10">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Cart" }]} />
      <PageHeader
        title="Shopping Cart"
        description={`${totals.itemCount} item${totals.itemCount === 1 ? "" : "s"} ready for checkout`}
        actions={
          <Button variant="ghost" size="sm" onClick={() => setConfirmClear(true)} leftIcon={<Trash2 className="h-4 w-4" />} className="text-red-600 hover:bg-red-50">
            Clear cart
          </Button>
        }
      />

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-4">
          {cart.hasUnavailable && (
            <Alert tone="warning" title="Some items are out of stock">
              Remove the highlighted items to continue to checkout.
            </Alert>
          )}

          <ul className="space-y-4">
            {lines.map((line) => (
              <li
                key={line.key}
                className={cn(
                  "flex gap-4 rounded-2xl border bg-white p-3 sm:gap-5 sm:p-4",
                  line.outOfStock ? "border-red-200 bg-red-50/40" : "border-ink-200",
                )}
              >
                <Link href={`/product/${line.product.slug}`} className="block h-28 w-24 shrink-0 overflow-hidden rounded-xl bg-ink-100 sm:h-32 sm:w-28">
                  <SafeImage src={line.product.images[0]} alt={line.product.name} className={cn("h-full w-full object-cover", line.outOfStock && "grayscale")} />
                </Link>
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link href={`/product/${line.product.slug}`} className="line-clamp-2 font-semibold text-ink-900 hover:text-brand-600">
                        {line.product.name}
                      </Link>
                      <p className="mt-1 text-sm text-ink-500">
                        {[line.color && `Colour: ${line.color}`, line.size && `Size: ${line.size}`].filter(Boolean).join(" · ")}
                      </p>
                      <p className="mt-1 text-sm font-medium text-ink-700">{formatPrice(line.unitPrice)} each</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => cart.removeItem(line.key)}
                      className="rounded-full p-2 text-ink-400 transition hover:bg-red-50 hover:text-red-600"
                      aria-label={`Remove ${line.product.name} from cart`}
                    >
                      <X className="h-[18px] w-[18px]" />
                    </button>
                  </div>

                  <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-3">
                    {line.outOfStock ? (
                      <p className="flex items-center gap-1.5 text-sm font-semibold text-red-600">
                        <AlertTriangle className="h-4 w-4" /> Out of stock — please remove
                      </p>
                    ) : (
                      <div>
                        <QuantityStepper
                          size="sm"
                          value={line.quantity}
                          max={line.maxQty}
                          onChange={(q) => cart.updateQuantity(line.key, q)}
                          label={`Quantity for ${line.product.name}`}
                        />
                        {line.quantity >= line.maxQty && (
                          <p className="mt-1 text-xs text-amber-600">Maximum quantity reached</p>
                        )}
                      </div>
                    )}
                    <p className="text-lg font-bold text-ink-900">{line.outOfStock ? "—" : formatPrice(line.lineTotal)}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <Link href="/shop" className="inline-block text-sm font-semibold text-brand-600 hover:text-brand-700">
            ← Continue shopping
          </Link>
        </div>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="card space-y-5 p-5 sm:p-6">
            <h2 className="text-lg font-semibold text-ink-900">Order Summary</h2>

            <div className="rounded-xl bg-ink-50 p-3.5">
              <p className="flex items-center gap-2 text-sm text-ink-700">
                <Truck className="h-4 w-4 text-brand-600" />
                {toFree > 0 ? (
                  <span>Add <b>{formatPrice(toFree)}</b> more for <b>free shipping</b></span>
                ) : (
                  <span className="font-semibold text-emerald-600">You&apos;ve unlocked free shipping!</span>
                )}
              </p>
              <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-ink-200" role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100} aria-label="Progress to free shipping">
                <div className="h-full rounded-full bg-brand-500 transition-all duration-500" style={{ width: `${progress}%` }} />
              </div>
            </div>

            <div>
              <label htmlFor="coupon" className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-ink-800">
                <Tag className="h-4 w-4" /> Coupon code
              </label>
              {cart.couponCode && !cart.couponError ? (
                <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm">
                  <span className="font-semibold text-emerald-700">{cart.couponCode} applied</span>
                  <button type="button" onClick={cart.removeCoupon} className="text-xs font-semibold text-ink-500 hover:text-red-600">Remove</button>
                </div>
              ) : (
                <>
                  <form onSubmit={(e) => { e.preventDefault(); void apply(); }} className="flex gap-2">
                    <input
                      id="coupon"
                      value={code}
                      onChange={(e) => setCode(e.target.value.toUpperCase())}
                      placeholder="Enter code"
                      className="input-base uppercase"
                      autoComplete="off"
                    />
                    <Button type="submit" variant="outline" loading={applying} disabled={!code.trim()}>Apply</Button>
                  </form>
                  {cart.couponCode && cart.couponError && (
                    <div className="mt-2 flex items-start justify-between gap-2 text-xs text-red-600">
                      <span><b>{cart.couponCode}</b>: {cart.couponError}</span>
                      <button type="button" onClick={cart.removeCoupon} className="shrink-0 font-semibold underline">Remove</button>
                    </div>
                  )}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {demoCoupons.map((c) => (
                      <button
                        key={c.code}
                        type="button"
                        title={c.description}
                        onClick={() => void apply(c.code)}
                        className="rounded-md border border-dashed border-ink-300 px-2 py-1 font-mono text-[11px] font-semibold text-ink-600 transition hover:border-brand-500 hover:bg-brand-50 hover:text-brand-700"
                      >
                        {c.code}
                      </button>
                    ))}
                  </div>
                  <p className="mt-1.5 text-[11px] text-ink-400">Demo coupons — click one to try it.</p>
                </>
              )}
            </div>

            <OrderTotals totals={totals} couponCode={cart.couponError ? null : cart.couponCode} />

            <div className="space-y-2.5">
              <LinkButton
                href="/checkout"
                size="lg"
                className={cn("w-full", !canCheckout && "pointer-events-none opacity-50")}
                aria-disabled={!canCheckout}
                tabIndex={canCheckout ? 0 : -1}
              >
                Proceed to Checkout
              </LinkButton>
              {!canCheckout && cart.hasUnavailable && (
                <p className="text-center text-xs text-red-600">Remove out-of-stock items to continue.</p>
              )}
            </div>
          </div>
        </aside>
      </div>

      <ConfirmDialog
        open={confirmClear}
        title="Clear your cart?"
        message="All items will be removed from your cart. This can't be undone."
        confirmLabel="Clear cart"
        onCancel={() => setConfirmClear(false)}
        onConfirm={() => { setConfirmClear(false); void cart.clearCart(); }}
      />
    </div>
  );
}


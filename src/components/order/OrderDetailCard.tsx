import Link from "next/link";
import { Calendar, CreditCard, MapPin, Package, User } from "lucide-react";
import { SafeImage } from "@/components/ui/SafeImage";
import { FulfillmentBadge, PaymentBadge } from "@/components/ui/StatusBadge";
import type { Order } from "@/lib/types";
import { formatDate, formatPrice, formatShortDate } from "@/lib/utils";
import { OrderTimeline } from "./OrderTimeline";

export function OrderDetailCard({ order }: { order: Order }) {
  return (
    <div className="space-y-6">
      {/* Header summary */}
      <div className="card p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-ink-100 pb-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-400">Order Reference</p>
            <h2 className="mt-1 font-mono text-2xl font-bold text-ink-900">{order.id}</h2>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-500">
              <Calendar className="h-4 w-4" /> Placed on {formatDate(order.createdAt, true)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <FulfillmentBadge status={order.fulfillmentStatus} />
            <PaymentBadge status={order.paymentStatus} />
          </div>
        </div>

        <div className="mt-5 grid gap-5 sm:grid-cols-3">
          <div className="flex items-start gap-3">
            <User className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
            <div className="text-sm">
              <p className="font-semibold text-ink-900">Customer</p>
              <p className="mt-0.5 text-ink-700">{order.customer.fullName}</p>
              <p className="text-ink-500">{order.customer.mobile}</p>
              {order.customer.email && <p className="text-ink-500">{order.customer.email}</p>}
            </div>
          </div>

          <div className="flex items-start gap-3">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
            <div className="text-sm">
              <p className="font-semibold text-ink-900">Delivery Address</p>
              <p className="mt-0.5 text-ink-700">{order.delivery.address}</p>
              <p className="text-ink-500">{order.delivery.city}</p>
              {order.fulfillmentStatus !== "cancelled" && order.fulfillmentStatus !== "delivered" && (
                <p className="mt-1 text-xs font-medium text-emerald-700">
                  Est. delivery: {formatShortDate(order.estimatedDelivery.from)} –{" "}
                  {formatShortDate(order.estimatedDelivery.to)}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CreditCard className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
            <div className="text-sm">
              <p className="font-semibold text-ink-900">Payment</p>
              <p className="mt-0.5 text-ink-700">
                {order.paymentMethod === "cod"
                  ? "Cash on Delivery (COD)"
                  : `Manual Transfer (${order.manualPayment?.methodName ?? "Online"})`}
              </p>
              {order.manualPayment && (
                <div className="mt-1 space-y-0.5 text-xs text-ink-500">
                  <p>
                    TID: <span className="font-mono font-semibold text-ink-800">{order.manualPayment.transactionId}</span>
                  </p>
                  <p>Sender: {order.manualPayment.senderMobile}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {order.notes && (
          <div className="mt-4 rounded-xl bg-ink-50 px-4 py-3 text-sm text-ink-700">
            <span className="font-semibold text-ink-900">Order note:</span> {order.notes}
          </div>
        )}
      </div>

      {/* Timeline */}
      <div className="card p-5 sm:p-6">
        <h3 className="mb-4 text-lg font-semibold text-ink-900">Order Status &amp; Timeline</h3>
        <OrderTimeline order={order} />
      </div>

      {/* Items + Totals */}
      <div className="card p-5 sm:p-6">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-ink-900">
          <Package className="h-5 w-5 text-brand-600" /> Ordered Items ({order.items.length})
        </h3>
        <ul className="divide-y divide-ink-100">
          {order.items.map((item, idx) => (
            <li key={`${item.productId}-${idx}`} className="flex items-center gap-4 py-3.5 first:pt-0">
              <Link href={`/product/${item.slug}`} className="h-16 w-14 shrink-0 overflow-hidden rounded-lg bg-ink-100">
                <SafeImage src={item.image} alt={item.name} className="h-full w-full object-cover" />
              </Link>
              <div className="min-w-0 flex-1">
                <Link href={`/product/${item.slug}`} className="font-semibold text-ink-900 hover:text-brand-600">
                  {item.name}
                </Link>
                <p className="mt-0.5 text-xs text-ink-500">
                  {[item.color && `Colour: ${item.color}`, item.size && `Size: ${item.size}`, `Qty: ${item.quantity}`]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-ink-900">{formatPrice(item.price * item.quantity)}</p>
                <p className="text-xs text-ink-400">{formatPrice(item.price)} each</p>
              </div>
            </li>
          ))}
        </ul>

        <dl className="mt-5 space-y-2 border-t border-ink-100 pt-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-ink-600">Subtotal</dt>
            <dd className="font-medium text-ink-900">{formatPrice(order.subtotal)}</dd>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-emerald-600">
              <dt>Discount {order.couponCode ? `(${order.couponCode})` : ""}</dt>
              <dd className="font-medium">−{formatPrice(order.discount)}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="text-ink-600">Shipping</dt>
            <dd className="font-medium text-ink-900">
              {order.shipping === 0 ? <span className="text-emerald-600">Free</span> : formatPrice(order.shipping)}
            </dd>
          </div>
          <div className="flex justify-between border-t border-ink-200 pt-3 text-base font-bold text-ink-900">
            <dt>Total</dt>
            <dd>{formatPrice(order.total)}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}


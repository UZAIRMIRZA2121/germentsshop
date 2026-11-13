import {
  CheckCircle2,
  Clock,
  Package,
  PackageCheck,
  ShieldAlert,
  Truck,
  XCircle,
} from "lucide-react";
import type { FulfillmentStatus, Order } from "@/lib/types";
import { cn, formatDate, FULFILLMENT_LABELS, FULFILLMENT_STEPS } from "@/lib/utils";
import { FulfillmentBadge, PaymentBadge } from "@/components/ui/StatusBadge";

const stepIcons: Record<FulfillmentStatus, typeof Package> = {
  placed: Clock,
  confirmed: CheckCircle2,
  processing: Package,
  shipped: Truck,
  out_for_delivery: Truck,
  delivered: PackageCheck,
  cancelled: XCircle,
};

export function OrderTimeline({ order }: { order: Order }) {
  const isCancelled = order.fulfillmentStatus === "cancelled";
  const currentIdx = FULFILLMENT_STEPS.indexOf(order.fulfillmentStatus);

  // Map latest timestamp per fulfillment step from timeline
  const stepTimestamps = new Map<string, { at: string; simulated?: boolean }>();
  order.timeline.forEach((ev) => {
    if (ev.kind === "order") {
      stepTimestamps.set(ev.status, { at: ev.at, simulated: ev.simulated });
    }
  });

  return (
    <div className="space-y-6">
      {/* Status badges */}
      <div className="flex flex-wrap items-center gap-2">
        <FulfillmentBadge status={order.fulfillmentStatus} />
        <PaymentBadge status={order.paymentStatus} />
      </div>

      {/* Horizontal/Vertical 6-step progress */}
      {isCancelled ? (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">
          <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
          <div>
            <p className="font-semibold">Order Cancelled</p>
            <p className="mt-0.5 text-red-700">
              {order.timeline.find((t) => t.status === "cancelled")?.note ??
                "This order was cancelled."}
            </p>
          </div>
        </div>
      ) : (
        <ol className="grid gap-3 sm:grid-cols-6" aria-label="Order progress">
          {FULFILLMENT_STEPS.map((step, i) => {
            const done = currentIdx >= i;
            const current = currentIdx === i;
            const Icon = stepIcons[step];
            const info = stepTimestamps.get(step);
            return (
              <li
                key={step}
                className={cn(
                  "relative flex items-center gap-3 rounded-xl border p-3 sm:flex-col sm:items-start sm:gap-2",
                  done
                    ? current
                      ? "border-brand-500 bg-brand-50/70"
                      : "border-emerald-200 bg-emerald-50/50"
                    : "border-ink-200 bg-ink-50/50 opacity-60",
                )}
              >
                <span
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                    done
                      ? current
                        ? "bg-brand-500 text-white"
                        : "bg-emerald-600 text-white"
                      : "bg-ink-200 text-ink-500",
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-ink-900">{FULFILLMENT_LABELS[step]}</p>
                  {info ? (
                    <p className="mt-0.5 text-[11px] text-ink-500">
                      {formatDate(info.at)}
                      {info.simulated && " (Sim)"}
                    </p>
                  ) : (
                    <p className="mt-0.5 text-[11px] text-ink-400">Pending</p>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      )}

      {/* Payment verification callout if pending or rejected */}
      {order.paymentMethod === "manual" && order.paymentStatus === "verification_pending" && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
          <div>
            <p className="font-semibold">Payment Verification Pending</p>
            <p className="mt-0.5 text-amber-800">
              Your transaction reference (<b>{order.manualPayment?.transactionId}</b>) via{" "}
              <b>{order.manualPayment?.methodName}</b> has been recorded. The order will be processed
              once payment is verified by the store.
            </p>
          </div>
        </div>
      )}

      {/* Detailed Activity Log */}
      <div>
        <h4 className="mb-3 text-sm font-semibold text-ink-900">Order &amp; Payment Activity</h4>
        <ol className="space-y-3 border-l-2 border-ink-200 pl-4">
          {[...order.timeline].reverse().map((ev) => (
            <li key={ev.id} className="relative">
              <span
                className={cn(
                  "absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full ring-4 ring-white",
                  ev.kind === "payment" ? "bg-sky-500" : "bg-brand-500",
                )}
              />
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-sm font-semibold text-ink-900">
                  {ev.title}
                  {ev.simulated && (
                    <span className="ml-2 rounded bg-ink-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-ink-600">
                      Simulated
                    </span>
                  )}
                </p>
                <time className="text-xs text-ink-400">{formatDate(ev.at, true)}</time>
              </div>
              {ev.note && <p className="mt-0.5 text-xs text-ink-600">{ev.note}</p>}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}


"use client";

import { useState } from "react";
import { CheckCircle2, CreditCard, Eye, XCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { EmptyState, PageLoader } from "@/components/ui/Feedback";
import { Modal } from "@/components/ui/Modal";
import { FulfillmentBadge, PaymentBadge } from "@/components/ui/StatusBadge";
import { useOrders } from "@/context/OrdersContext";
import { useToast } from "@/context/ToastContext";
import type { Order, PaymentStatus } from "@/lib/types";
import { cn, formatDate, formatPrice } from "@/lib/utils";

export default function AdminPaymentsPage() {
  const { orders, updatePayment, ready } = useOrders();
  const toast = useToast();
  const [filter, setFilter] = useState<"all" | PaymentStatus>("verification_pending");
  const [previewImg, setPreviewImg] = useState<string | null>(null);

  if (!ready) return <PageLoader label="Loading payments…" />;

  const manualOrders = orders.filter((o) => o.paymentMethod === "manual");
  const shown =
    filter === "all" ? manualOrders : manualOrders.filter((o) => o.paymentStatus === filter);

  const handleAction = async (order: Order, status: "verified" | "rejected") => {
    const res = await updatePayment(
      order.id,
      status,
      status === "verified"
        ? "Verified by admin demo."
        : "Rejected by admin demo — transaction reference could not be matched.",
    );
    if (!res.ok) {
      toast.error("Could not update payment", { message: res.error });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink-900 sm:text-3xl">
          Payment Verification
        </h1>
        <p className="mt-1 text-sm text-ink-500">
          Review manual online transfers (JazzCash, Easypaisa, Bank Transfer). Approving a payment
          automatically confirms the order.
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {(
          [
            ["verification_pending", "Pending Verification"],
            ["verified", "Verified"],
            ["rejected", "Rejected"],
            ["all", "All Manual Payments"],
          ] as const
        ).map(([val, label]) => {
          const count =
            val === "all"
              ? manualOrders.length
              : manualOrders.filter((o) => o.paymentStatus === val).length;
          return (
            <button
              key={val}
              type="button"
              onClick={() => setFilter(val)}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm font-semibold transition",
                filter === val
                  ? "border-ink-900 bg-ink-900 text-white"
                  : "border-ink-200 bg-white text-ink-700 hover:border-ink-400",
              )}
            >
              {label} ({count})
            </button>
          );
        })}
      </div>

      {shown.length === 0 ? (
        <EmptyState
          icon={<CreditCard />}
          title="No matching payments"
          description="There are no manual online payments in this filter."
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {shown.map((o) => (
            <div key={o.id} className="card space-y-4 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-ink-100 pb-4">
                <div>
                  <p className="font-mono text-base font-bold text-ink-900">{o.id}</p>
                  <p className="text-xs text-ink-500">
                    {o.customer.fullName} · {formatDate(o.createdAt, true)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <PaymentBadge status={o.paymentStatus} />
                  <FulfillmentBadge status={o.fulfillmentStatus} />
                </div>
              </div>

              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-xs text-ink-400">Method</dt>
                  <dd className="font-semibold text-ink-900">{o.manualPayment?.methodName}</dd>
                </div>
                <div>
                  <dt className="text-xs text-ink-400">Amount</dt>
                  <dd className="font-bold text-brand-600">{formatPrice(o.total)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-ink-400">Transaction ID</dt>
                  <dd className="font-mono font-semibold text-ink-900">
                    {o.manualPayment?.transactionId || "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-ink-400">Sender Mobile</dt>
                  <dd className="font-medium text-ink-800">{o.manualPayment?.senderMobile || "—"}</dd>
                </div>
              </dl>

              {o.manualPayment?.screenshot && (
                <div className="flex items-center justify-between rounded-xl border border-ink-200 bg-ink-50 p-3">
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={o.manualPayment.screenshot}
                      alt="Payment receipt"
                      className="h-12 w-12 rounded-lg object-cover ring-1 ring-ink-200"
                    />
                    <span className="text-xs font-medium text-ink-700">Payment screenshot attached</span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setPreviewImg(o.manualPayment!.screenshot!)}
                    leftIcon={<Eye className="h-3.5 w-3.5" />}
                  >
                    View
                  </Button>
                </div>
              )}

              {o.paymentStatus === "verification_pending" && (
                <div className="flex flex-wrap gap-2 pt-1">
                  <Button
                    size="sm"
                    variant="success"
                    onClick={() => handleAction(o, "verified")}
                    leftIcon={<CheckCircle2 className="h-4 w-4" />}
                  >
                    Verify Payment
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleAction(o, "rejected")}
                    leftIcon={<XCircle className="h-4 w-4" />}
                  >
                    Reject Payment
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal open={!!previewImg} onClose={() => setPreviewImg(null)} title="Payment Screenshot" size="lg">
        {previewImg && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewImg} alt="Uploaded payment proof" className="mx-auto max-h-[70vh] rounded-xl object-contain" />
        )}
      </Modal>
    </div>
  );
}


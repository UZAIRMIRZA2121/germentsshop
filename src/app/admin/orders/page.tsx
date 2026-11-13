"use client";

import { useState } from "react";
import { Eye, ShoppingBag } from "lucide-react";
import { OrderDetailCard } from "@/components/order/OrderDetailCard";
import { Button } from "@/components/ui/Button";
import { EmptyState, PageLoader } from "@/components/ui/Feedback";
import { Modal } from "@/components/ui/Modal";
import { FulfillmentBadge, PaymentBadge } from "@/components/ui/StatusBadge";
import { useOrders } from "@/context/OrdersContext";
import { useToast } from "@/context/ToastContext";
import type { FulfillmentStatus, Order } from "@/lib/types";
import { cn, formatDate, formatPrice, FULFILLMENT_LABELS } from "@/lib/utils";

const ALL_STATUSES: FulfillmentStatus[] = [
  "placed",
  "confirmed",
  "processing",
  "shipped",
  "out_for_delivery",
  "delivered",
  "cancelled",
];

export default function AdminOrdersPage() {
  const { orders, updateFulfillment, ready } = useOrders();
  const toast = useToast();
  const [statusFilter, setStatusFilter] = useState<"all" | FulfillmentStatus>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (!ready) return <PageLoader label="Loading orders…" />;

  const shown =
    statusFilter === "all"
      ? orders
      : orders.filter((o) => o.fulfillmentStatus === statusFilter);
  const selectedOrder = selectedId ? orders.find((o) => o.id === selectedId) : undefined;

  const handleStatusChange = async (order: Order, nextStatus: FulfillmentStatus) => {
    const res = await updateFulfillment(order.id, nextStatus);
    if (!res.ok) {
      toast.error("Cannot update order", { message: res.error });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink-900 sm:text-3xl">
          Order Management
        </h1>
        <p className="mt-1 text-sm text-ink-500">
          View all orders, inspect details and update fulfillment status. Updates sync immediately
          with customer order history &amp; tracking.
        </p>
      </div>

      {/* Filter pills */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setStatusFilter("all")}
          className={cn(
            "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition",
            statusFilter === "all"
              ? "border-ink-900 bg-ink-900 text-white"
              : "border-ink-200 bg-white text-ink-700 hover:border-ink-400",
          )}
        >
          All ({orders.length})
        </button>
        {ALL_STATUSES.map((st) => {
          const count = orders.filter((o) => o.fulfillmentStatus === st).length;
          return (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition",
                statusFilter === st
                  ? "border-ink-900 bg-ink-900 text-white"
                  : "border-ink-200 bg-white text-ink-700 hover:border-ink-400",
              )}
            >
              {FULFILLMENT_LABELS[st]} ({count})
            </button>
          );
        })}
      </div>

      {shown.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag />}
          title="No orders in this status"
          description="Try selecting a different status filter."
        />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-ink-200 bg-ink-50 text-xs font-semibold uppercase tracking-wider text-ink-500">
                <tr>
                  <th className="px-4 py-3.5">Order ID</th>
                  <th className="px-4 py-3.5">Customer</th>
                  <th className="px-4 py-3.5">Date</th>
                  <th className="px-4 py-3.5">Total</th>
                  <th className="px-4 py-3.5">Payment</th>
                  <th className="px-4 py-3.5">Fulfillment</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {shown.map((o) => {
                  const locked =
                    o.fulfillmentStatus === "delivered" || o.fulfillmentStatus === "cancelled";
                  return (
                    <tr key={o.id} className="hover:bg-ink-50/50">
                      <td className="px-4 py-3.5 font-mono font-bold text-ink-900">{o.id}</td>
                      <td className="px-4 py-3.5">
                        <p className="font-medium text-ink-900">{o.customer.fullName}</p>
                        <p className="text-xs text-ink-500">{o.delivery.city}</p>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-ink-500">
                        {formatDate(o.createdAt)}
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-ink-900">
                        {formatPrice(o.total)}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex flex-col items-start gap-1">
                          <span className="text-xs font-medium text-ink-700">
                            {o.paymentMethod === "cod"
                              ? "COD"
                              : o.manualPayment?.methodName ?? "Manual"}
                          </span>
                          <PaymentBadge status={o.paymentStatus} />
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex flex-col items-start gap-1.5">
                          <FulfillmentBadge status={o.fulfillmentStatus} />
                          {!locked && (
                            <select
                              aria-label={`Update status for ${o.id}`}
                              value={o.fulfillmentStatus}
                              onChange={(e) =>
                                void handleStatusChange(o, e.target.value as FulfillmentStatus)
                              }
                              className="rounded-lg border border-ink-200 bg-white px-2 py-1 text-xs font-medium text-ink-700 focus:border-brand-500 focus:outline-none"
                            >
                              {ALL_STATUSES.map((s) => (
                                <option key={s} value={s}>
                                  {FULFILLMENT_LABELS[s]}
                                </option>
                              ))}
                            </select>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedId(o.id)}
                          leftIcon={<Eye className="h-3.5 w-3.5" />}
                        >
                          Details
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal
        open={!!selectedOrder}
        onClose={() => setSelectedId(null)}
        title={`Order ${selectedOrder?.id ?? ""}`}
        size="xl"
      >
        {selectedOrder && <OrderDetailCard order={selectedOrder} />}
      </Modal>
    </div>
  );
}


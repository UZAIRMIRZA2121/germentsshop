"use client";

import { use, useEffect, useState } from "react";
import { CheckCircle2, Clock, MessageCircle, PackageSearch, ShoppingBag } from "lucide-react";
import { OrderDetailCard } from "@/components/order/OrderDetailCard";
import { Alert } from "@/components/ui/Alert";
import { LinkButton } from "@/components/ui/Button";
import { CopyButton } from "@/components/ui/CopyButton";
import { EmptyState, PageLoader } from "@/components/ui/Feedback";
import { useOrders } from "@/context/OrdersContext";
import type { Order } from "@/lib/types";
import { formatShortDate } from "@/lib/utils";
import { getWhatsAppOrderUrl } from "@/lib/whatsapp";

export default function OrderSuccessPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = use(params);
  const { getOrder, fetchOrder, ready } = useOrders();
  const [fetched, setFetched] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const cached = getOrder(orderId);

  useEffect(() => {
    let active = true;
    if (cached) {
      setFetched(cached);
      setLoading(false);
      return;
    }
    setLoading(true);
    void fetchOrder(orderId).then((res) => {
      if (!active) return;
      setFetched(res);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [orderId, cached, fetchOrder]);

  const order = cached ?? fetched;

  if (!ready || loading) {
    return (
      <div className="container-page py-16">
        <PageLoader label="Loading your order confirmation…" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container-page py-16">
        <EmptyState
          icon={<PackageSearch />}
          title="Order not found"
          description={`We couldn't find order "${orderId}".`}
          action={<LinkButton href="/shop">Continue shopping</LinkButton>}
        />
      </div>
    );
  }

  const isPendingVerification =
    order.paymentMethod === "manual" && order.paymentStatus === "verification_pending";
  const whatsappUrl = getWhatsAppOrderUrl(order);

  return (
    <div className="container-page py-10">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="card p-6 text-center sm:p-8">
          <div
            className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${
              isPendingVerification ? "bg-amber-100 text-amber-600" : "bg-emerald-100 text-emerald-600"
            }`}
          >
            {isPendingVerification ? <Clock className="h-8 w-8" /> : <CheckCircle2 className="h-8 w-8" />}
          </div>

          <h1 className="font-display text-3xl font-semibold text-ink-900">
            {isPendingVerification
              ? "Order Placed — Payment Verification Pending"
              : "Thank you! Your order is placed"}
          </h1>
          <p className="mx-auto mt-2 max-w-lg text-ink-600">
            {isPendingVerification
              ? "We have received your transfer details. Our team will verify your payment before processing and shipping your order."
              : "We've received your order and will prepare it for dispatch shortly."}
          </p>

          <div className="mt-5 inline-flex items-center gap-3 rounded-xl border border-ink-200 bg-ink-50 px-4 py-2.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-500">
              Order Number
            </span>
            <span className="font-mono text-lg font-bold text-ink-900">{order.id}</span>
            <CopyButton value={order.id} label="Order number" compact />
          </div>

          <p className="mt-4 text-sm text-ink-500">
            Estimated delivery:{" "}
            <b className="text-ink-800">
              {formatShortDate(order.estimatedDelivery.from)} –{" "}
              {formatShortDate(order.estimatedDelivery.to)}
            </b>
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center gap-2 rounded-lg bg-emerald-600 px-5 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              <MessageCircle className="h-4 w-4" />
              Send Order on WhatsApp
            </a>
            <LinkButton href={`/track-order?orderId=${order.id}`} variant="secondary">
              Track Order
            </LinkButton>
            <LinkButton href={`/account/orders/${order.id}`} variant="outline">
              View in My Orders
            </LinkButton>
            <LinkButton href="/shop" variant="ghost">
              <ShoppingBag className="h-4 w-4" /> Continue Shopping
            </LinkButton>
          </div>
        </div>

        {isPendingVerification && (
          <Alert tone="warning" title="Manual payment instructions & next steps">
            Your transaction ID <b>{order.manualPayment?.transactionId}</b> (
            {order.manualPayment?.methodName}) is queued for review. You can also send your order
            summary directly on WhatsApp using the green button above.
          </Alert>
        )}

        <OrderDetailCard order={order} />
      </div>
    </div>
  );
}

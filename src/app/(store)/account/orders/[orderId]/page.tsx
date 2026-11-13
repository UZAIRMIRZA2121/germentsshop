"use client";

import { use, useEffect, useState } from "react";
import { MessageCircle, PackageX } from "lucide-react";
import { AccountShell } from "@/components/account/AccountShell";
import { OrderDetailCard } from "@/components/order/OrderDetailCard";
import { LinkButton } from "@/components/ui/Button";
import { EmptyState, PageLoader } from "@/components/ui/Feedback";
import { useOrders } from "@/context/OrdersContext";
import type { Order } from "@/lib/types";
import { getWhatsAppOrderUrl } from "@/lib/whatsapp";

export default function AccountOrderDetailPage({
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

  return (
    <AccountShell
      title={`Order ${order?.id ?? orderId}`}
      description="Complete order summary, payment status and delivery timeline."
      breadcrumb={order?.id ?? orderId}
    >
      {!ready || loading ? (
        <PageLoader label="Loading order details…" />
      ) : !order ? (
        <EmptyState
          icon={<PackageX />}
          title="Order not found"
          description={`We couldn't find order "${orderId}".`}
          action={<LinkButton href="/account/orders">Back to My Orders</LinkButton>}
        />
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <LinkButton href="/account/orders" variant="outline" size="sm">
              ← Back to My Orders
            </LinkButton>
            <LinkButton href={`/track-order?orderId=${order.id}`} variant="secondary" size="sm">
              Track Order
            </LinkButton>
            <a
              href={getWhatsAppOrderUrl(order)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-emerald-600 px-3 text-xs font-semibold text-white transition hover:bg-emerald-700"
            >
              <MessageCircle className="h-3.5 w-3.5" /> Send on WhatsApp
            </a>
          </div>
          <OrderDetailCard order={order} />
        </div>
      )}
    </AccountShell>
  );
}

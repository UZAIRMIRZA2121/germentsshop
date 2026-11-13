"use client";

import Link from "next/link";
import { ArrowRight, Package } from "lucide-react";
import { AccountShell } from "@/components/account/AccountShell";
import { LinkButton } from "@/components/ui/Button";
import { EmptyState, PageLoader } from "@/components/ui/Feedback";
import { FulfillmentBadge, PaymentBadge } from "@/components/ui/StatusBadge";
import { useOrders } from "@/context/OrdersContext";
import { formatDate, formatPrice } from "@/lib/utils";

export default function MyOrdersPage() {
  const { myOrders, ready } = useOrders();

  return (
    <AccountShell
      title="My Orders"
      description="View your past and current orders, payment statuses and delivery progress."
      breadcrumb="My Orders"
    >
      {!ready ? (
        <PageLoader label="Loading your orders…" />
      ) : myOrders.length === 0 ? (
        <EmptyState
          icon={<Package />}
          title="No orders yet"
          description="You haven't placed any orders yet. Start shopping to see your order history here."
          action={<LinkButton href="/shop">Browse products</LinkButton>}
        />
      ) : (
        <ul className="space-y-4">
          {myOrders.map((o) => (
            <li key={o.id} className="card p-5 transition hover:border-ink-300">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <Link
                      href={`/account/orders/${o.id}`}
                      className="font-mono text-base font-bold text-ink-900 hover:text-brand-600"
                    >
                      {o.id}
                    </Link>
                    <FulfillmentBadge status={o.fulfillmentStatus} />
                    <PaymentBadge status={o.paymentStatus} />
                  </div>
                  <p className="mt-1 text-xs text-ink-500">
                    Placed on {formatDate(o.createdAt, true)} ·{" "}
                    {o.paymentMethod === "cod" ? "Cash on Delivery" : o.manualPayment?.methodName} ·{" "}
                    {o.items.reduce((n, i) => n + i.quantity, 0)} item(s)
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xs text-ink-400">Total</p>
                    <p className="text-lg font-bold text-ink-900">{formatPrice(o.total)}</p>
                  </div>
                  <LinkButton href={`/account/orders/${o.id}`} variant="outline" size="sm">
                    Details <ArrowRight className="h-3.5 w-3.5" />
                  </LinkButton>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </AccountShell>
  );
}


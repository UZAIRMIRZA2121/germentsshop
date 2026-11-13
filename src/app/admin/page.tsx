"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Banknote,
  Clock,
  Package,
  RotateCcw,
  ShoppingBag,
  Users,
} from "lucide-react";
import { Button, LinkButton } from "@/components/ui/Button";
import { PageLoader } from "@/components/ui/Feedback";
import { ConfirmDialog } from "@/components/ui/Modal";
import { FulfillmentBadge, PaymentBadge } from "@/components/ui/StatusBadge";
import { useCatalog } from "@/context/CatalogContext";
import { useOrders } from "@/context/OrdersContext";
import type { AdminCustomer } from "@/lib/types";
import { formatDate, formatPrice, formatShortDate } from "@/lib/utils";

export default function AdminOverviewPage() {
  const { orders, ready: ordersReady, resetDemoData } = useOrders();
  const { products, ready: catalogReady } = useCatalog();
  const [confirmReset, setConfirmReset] = useState(false);

  const stats = useMemo(() => {
    const validOrders = orders.filter((o) => o.fulfillmentStatus !== "cancelled");
    const revenue = validOrders.reduce((s, o) => s + o.total, 0);
    const pending = orders.filter(
      (o) =>
        o.fulfillmentStatus === "placed" ||
        o.fulfillmentStatus === "confirmed" ||
        o.paymentStatus === "verification_pending",
    ).length;
    const lowStock = products.filter((p) => p.stock > 0 && p.stock <= 5).length;
    return { totalOrders: orders.length, revenue, pending, totalProducts: products.length, lowStock };
  }, [orders, products]);

  // 7-day sales chart data
  const chartDays = useMemo(() => {
    const days: Array<{ label: string; total: number; count: number }> = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const dayKey = d.toISOString().slice(0, 10);
      const dayOrders = orders.filter(
        (o) => o.createdAt.slice(0, 10) === dayKey && o.fulfillmentStatus !== "cancelled",
      );
      days.push({
        label: formatShortDate(d.toISOString()),
        total: dayOrders.reduce((s, o) => s + o.total, 0),
        count: dayOrders.length,
      });
    }
    return days;
  }, [orders]);

  const maxDayTotal = Math.max(1, ...chartDays.map((d) => d.total));

  // Derived customer list
  const customers = useMemo<AdminCustomer[]>(() => {
    const map = new Map<string, AdminCustomer>();
    orders.forEach((o) => {
      const key = o.customer.mobile.replace(/\s+/g, "");
      const existing = map.get(key);
      const spent = o.fulfillmentStatus === "cancelled" ? 0 : o.total;
      if (existing) {
        existing.orderCount += 1;
        existing.totalSpent += spent;
        if (o.createdAt > existing.lastOrderAt) existing.lastOrderAt = o.createdAt;
      } else {
        map.set(key, {
          key,
          fullName: o.customer.fullName,
          mobile: o.customer.mobile,
          email: o.customer.email,
          city: o.delivery.city,
          orderCount: 1,
          totalSpent: spent,
          lastOrderAt: o.createdAt,
        });
      }
    });
    return [...map.values()].sort((a, b) => b.totalSpent - a.totalSpent);
  }, [orders]);

  if (!ordersReady || !catalogReady) return <PageLoader label="Loading dashboard…" />;

  const kpis = [
    { label: "Total Orders", value: String(stats.totalOrders), icon: ShoppingBag, tone: "bg-sky-50 text-sky-600" },
    { label: "Total Revenue", value: formatPrice(stats.revenue), icon: Banknote, tone: "bg-emerald-50 text-emerald-600" },
    { label: "Pending Actions", value: String(stats.pending), icon: Clock, tone: "bg-amber-50 text-amber-600" },
    { label: "Products", value: `${stats.totalProducts} (${stats.lowStock} low)`, icon: Package, tone: "bg-brand-50 text-brand-600" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink-900 sm:text-3xl">Dashboard Overview</h1>
          <p className="mt-1 text-sm text-ink-500">Live snapshot of your browser&apos;s demo store data.</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setConfirmReset(true)}
          leftIcon={<RotateCcw className="h-4 w-4" />}
        >
          Reset Demo Data
        </Button>
      </div>

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map(({ label, value, icon: Icon, tone }) => (
          <div key={label} className="card flex items-center gap-4 p-5">
            <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${tone}`}>
              <Icon className="h-6 w-6" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-ink-400">{label}</p>
              <p className="mt-1 text-xl font-bold text-ink-900">{value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
        {/* Sales Chart */}
        <div className="card p-5 sm:p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-ink-900">7-Day Sales Overview</h2>
              <p className="text-xs text-ink-500">Excludes cancelled orders</p>
            </div>
          </div>
          <div className="grid h-52 grid-cols-7 items-end gap-2 sm:gap-3">
            {chartDays.map((d) => {
              const pct = Math.max(6, Math.round((d.total / maxDayTotal) * 100));
              return (
                <div key={d.label} className="flex h-full flex-col items-center justify-end gap-2">
                  <span className="text-[10px] font-semibold text-ink-500">
                    {d.total > 0 ? formatPrice(d.total).replace("Rs. ", "") : "0"}
                  </span>
                  <div className="flex w-full flex-1 items-end">
                    <div
                      title={`${d.label}: ${formatPrice(d.total)} (${d.count} orders)`}
                      className="w-full rounded-t-lg bg-brand-500/90 transition-all hover:bg-brand-600"
                      style={{ height: `${d.total === 0 ? 4 : pct}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-medium text-ink-600">{d.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="card p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-ink-900">Recent Orders</h2>
            <Link href="/admin/orders" className="text-xs font-semibold text-brand-600 hover:underline">
              View all →
            </Link>
          </div>
          <ul className="divide-y divide-ink-100">
            {orders.slice(0, 5).map((o) => (
              <li key={o.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                <div className="min-w-0">
                  <p className="font-mono text-sm font-bold text-ink-900">{o.id}</p>
                  <p className="truncate text-xs text-ink-500">
                    {o.customer.fullName} · {formatDate(o.createdAt)}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-sm font-semibold text-ink-900">{formatPrice(o.total)}</span>
                  <div className="flex gap-1">
                    <FulfillmentBadge status={o.fulfillmentStatus} />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Customer List */}
      <div className="card p-5 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-ink-900">
            <Users className="h-5 w-5 text-brand-600" /> Customers ({customers.length})
          </h2>
          <LinkButton href="/admin/payments" variant="outline" size="sm">
            Review Pending Payments
          </LinkButton>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-ink-200 text-xs font-semibold uppercase tracking-wider text-ink-400">
                <th className="pb-3 pr-4">Customer</th>
                <th className="pb-3 pr-4">Mobile</th>
                <th className="pb-3 pr-4">City</th>
                <th className="pb-3 pr-4">Orders</th>
                <th className="pb-3 pr-4">Total Spent</th>
                <th className="pb-3">Last Order</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {customers.map((c) => (
                <tr key={c.key} className="hover:bg-ink-50/60">
                  <td className="py-3 pr-4 font-semibold text-ink-900">{c.fullName}</td>
                  <td className="py-3 pr-4 text-ink-600">{c.mobile}</td>
                  <td className="py-3 pr-4 text-ink-600">{c.city}</td>
                  <td className="py-3 pr-4 font-medium text-ink-900">{c.orderCount}</td>
                  <td className="py-3 pr-4 font-semibold text-ink-900">{formatPrice(c.totalSpent)}</td>
                  <td className="py-3 text-xs text-ink-500">{formatDate(c.lastOrderAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog
        open={confirmReset}
        title="Reset demo data?"
        message="This will restore products, categories and orders back to the original demo dataset."
        confirmLabel="Reset Data"
        onCancel={() => setConfirmReset(false)}
        onConfirm={() => {
          setConfirmReset(false);
          void resetDemoData();
        }}
      />
    </div>
  );
}


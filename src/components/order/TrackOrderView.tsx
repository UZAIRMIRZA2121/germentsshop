"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { FastForward, PackageSearch, Search } from "lucide-react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { EmptyState, PageLoader } from "@/components/ui/Feedback";
import { Breadcrumbs, PageHeader } from "@/components/ui/Headings";
import { useOrders } from "@/context/OrdersContext";
import { useToast } from "@/context/ToastContext";
import { nextFulfillmentStatus } from "@/lib/orderUtils";
import type { Order } from "@/lib/types";
import { OrderDetailCard } from "./OrderDetailCard";

const SAMPLE_IDS = ["ORD-2026-10004", "ORD-2026-10005", "ORD-2026-10009", "ORD-2026-10010"];

export function TrackOrderView() {
  const searchParams = useSearchParams();
  const initial = searchParams.get("orderId") ?? "";
  const { fetchOrder, simulateNextStep } = useOrders();
  const toast = useToast();

  const [query, setQuery] = useState(initial);
  const [searchedId, setSearchedId] = useState(initial);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [simulating, setSimulating] = useState(false);

  const loadOrder = async (id: string) => {
    const clean = id.trim();
    if (!clean) {
      setOrder(null);
      return;
    }
    setLoading(true);
    const res = await fetchOrder(clean);
    setOrder(res);
    setLoading(false);
  };

  useEffect(() => {
    if (initial) {
      setQuery(initial);
      setSearchedId(initial);
      void loadOrder(initial);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial]);

  const nextStep = order ? nextFulfillmentStatus(order.fulfillmentStatus) : null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchedId(query.trim());
    void loadOrder(query);
  };

  const handleSimulate = async () => {
    if (!order) return;
    setSimulating(true);
    const res = await simulateNextStep(order.id);
    setSimulating(false);
    if (res.ok) setOrder(res.data);
    else toast.warning("Cannot advance status", { message: res.error });
  };

  return (
    <div className="container-page py-8 sm:py-10">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Track Order" }]} />
      <PageHeader
        title="Track Your Order"
        description="Enter your order reference number (for example, ORD-2026-10004) to view its current status and timeline."
      />

      <div className="mx-auto max-w-4xl space-y-6">
        <Alert tone="info" title="Order tracking">
          Orders are stored in the backend SQLite database. You can also use the demo simulation
          button below to preview courier progression.
        </Alert>

        <form onSubmit={submit} className="card flex flex-col gap-3 p-4 sm:flex-row sm:p-5">
          <div className="relative flex-1">
            <label htmlFor="track-id" className="sr-only">
              Order Number
            </label>
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <input
              id="track-id"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter Order ID (e.g. ORD-2026-10004)"
              className="input-base !h-12 !pl-10 font-mono uppercase"
            />
          </div>
          <Button type="submit" size="lg">
            Track Order
          </Button>
        </form>

        <div className="flex flex-wrap items-center gap-2 text-xs text-ink-500">
          <span className="font-medium">Try a sample order:</span>
          {SAMPLE_IDS.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                setQuery(id);
                setSearchedId(id);
                void loadOrder(id);
              }}
              className="rounded-full border border-ink-200 bg-white px-3 py-1 font-mono font-semibold text-ink-700 transition hover:border-brand-500 hover:text-brand-600"
            >
              {id}
            </button>
          ))}
        </div>

        {loading ? (
          <PageLoader label="Looking up order…" />
        ) : searchedId && !order ? (
          <EmptyState
            icon={<PackageSearch />}
            title={`No order found for “${searchedId}”`}
            description="Double-check your order reference number or pick one of the sample orders above."
          />
        ) : order ? (
          <div className="space-y-4">
            {nextStep && (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-dashed border-brand-300 bg-brand-50/60 px-5 py-3.5">
                <p className="text-sm text-ink-800">
                  <b>Demo control:</b> Simulate the next courier milestone for this order.
                </p>
                <Button
                  size="sm"
                  variant="secondary"
                  loading={simulating}
                  onClick={handleSimulate}
                  leftIcon={<FastForward className="h-4 w-4" />}
                >
                  Simulate Next Step
                </Button>
              </div>
            )}
            <OrderDetailCard order={order} />
          </div>
        ) : null}
      </div>
    </div>
  );
}

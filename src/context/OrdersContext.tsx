"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import { useStoredResource } from "@/hooks/useStoredResource";
import { demoService } from "@/lib/services/demoService";
import { orderService } from "@/lib/services/orderService";
import type { Result } from "@/lib/services/result";
import { STORAGE_KEYS } from "@/lib/storage";
import type { FulfillmentStatus, Order, OrderDraft, PaymentStatus } from "@/lib/types";
import { FULFILLMENT_LABELS, PAYMENT_LABELS } from "@/lib/utils";
import { useToast } from "./ToastContext";

interface OrdersContextValue {
  ready: boolean;
  /** Orders visible to the signed-in user (all orders for admin, own orders for customer). */
  orders: Order[];
  /** Alias for customer's order history. */
  myOrders: Order[];
  getOrder: (id: string) => Order | undefined;
  fetchOrder: (id: string) => Promise<Order | null>;
  placeOrder: (draft: OrderDraft) => Promise<Result<Order>>;
  updateFulfillment: (id: string, status: FulfillmentStatus, note?: string) => Promise<Result<Order>>;
  updatePayment: (id: string, status: PaymentStatus, note?: string) => Promise<Result<Order>>;
  simulateNextStep: (id: string) => Promise<Result<Order>>;
  resetDemoData: () => Promise<void>;
}

const OrdersContext = createContext<OrdersContextValue | null>(null);
const KEYS = [STORAGE_KEYS.orders];

export function OrdersProvider({ children }: { children: ReactNode }) {
  const toast = useToast();
  const { data: orders, ready } = useStoredResource<Order[]>(KEYS, () => orderService.list(), []);

  const previous = useRef<Map<string, { f: FulfillmentStatus; p: PaymentStatus }> | null>(null);
  const suppress = useRef(false);

  useEffect(() => {
    if (!ready) return;
    const snapshot = new Map(orders.map((o) => [o.id, { f: o.fulfillmentStatus, p: o.paymentStatus }]));
    const prev = previous.current;
    previous.current = snapshot;
    if (!prev) return;
    if (suppress.current) {
      suppress.current = false;
      return;
    }
    orders.forEach((o) => {
      const before = prev.get(o.id);
      if (!before) return;
      if (before.f !== o.fulfillmentStatus) {
        const label = FULFILLMENT_LABELS[o.fulfillmentStatus];
        const opts = { message: `Order ${o.id} is now “${label}”.` };
        if (o.fulfillmentStatus === "cancelled") toast.warning("Order cancelled", opts);
        else if (o.fulfillmentStatus === "delivered") toast.success("Order delivered", opts);
        else toast.info("Order status updated", opts);
      }
      if (before.p !== o.paymentStatus) {
        const message = `Order ${o.id}: ${PAYMENT_LABELS[o.paymentStatus]}.`;
        if (o.paymentStatus === "verified" || o.paymentStatus === "cod_collected")
          toast.success("Payment status updated", { message });
        else if (o.paymentStatus === "rejected") toast.error("Payment status updated", { message });
        else toast.warning("Payment status updated", { message });
      }
    });
  }, [orders, ready, toast]);

  const getOrder = useCallback(
    (id: string) => {
      const needle = id.trim().toUpperCase();
      return orders.find((o) => o.id.toUpperCase() === needle);
    },
    [orders],
  );

  const fetchOrder = useCallback((id: string) => orderService.getById(id), []);
  const placeOrder = useCallback((draft: OrderDraft) => orderService.create(draft), []);
  const updateFulfillment = useCallback(
    (id: string, status: FulfillmentStatus, note?: string) =>
      orderService.updateFulfillment(id, status, { note }),
    [],
  );
  const updatePayment = useCallback(
    (id: string, status: PaymentStatus, note?: string) => orderService.updatePayment(id, status, note),
    [],
  );
  const simulateNextStep = useCallback((id: string) => orderService.simulateNextStep(id), []);

  const resetDemoData = useCallback(async () => {
    suppress.current = true;
    await demoService.resetCatalogAndOrders();
    toast.success("Database reset", { message: "Products, categories and sample orders restored." });
  }, [toast]);

  const value = useMemo<OrdersContextValue>(
    () => ({
      ready,
      orders,
      myOrders: orders,
      getOrder,
      fetchOrder,
      placeOrder,
      updateFulfillment,
      updatePayment,
      simulateNextStep,
      resetDemoData,
    }),
    [ready, orders, getOrder, fetchOrder, placeOrder, updateFulfillment, updatePayment, simulateNextStep, resetDemoData],
  );

  return <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>;
}

export function useOrders(): OrdersContextValue {
  const ctx = useContext(OrdersContext);
  if (!ctx) throw new Error("useOrders must be used within OrdersProvider");
  return ctx;
}

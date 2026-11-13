import { emitStorageChange, STORAGE_KEYS } from "../storage";
import type { FulfillmentStatus, Order, OrderDraft, PaymentStatus } from "../types";
import { fail, ok, type Result } from "./result";

export const orderService = {
  async list(): Promise<Order[]> {
    const res = await fetch("/api/orders", { cache: "no-store" });
    if (!res.ok) return [];
    const data = (await res.json()) as { orders: Order[] };
    return data.orders;
  },

  async getById(id: string): Promise<Order | null> {
    const res = await fetch(`/api/orders/${encodeURIComponent(id)}`, { cache: "no-store" });
    if (!res.ok) return null;
    const data = (await res.json()) as { order: Order };
    return data.order;
  },

  async create(draft: OrderDraft): Promise<Result<Order>> {
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    });
    const data = (await res.json()) as { order?: Order; error?: string };
    if (!res.ok || !data.order) return fail(data.error || "Could not place order.");
    emitStorageChange(STORAGE_KEYS.orders);
    emitStorageChange(STORAGE_KEYS.products);
    return ok(data.order);
  },

  async updateFulfillment(
    id: string,
    status: FulfillmentStatus,
    options: { note?: string } = {},
  ): Promise<Result<Order>> {
    const res = await fetch(`/api/orders/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "fulfillment", status, note: options.note }),
    });
    const data = (await res.json()) as { order?: Order; error?: string };
    if (!res.ok || !data.order) return fail(data.error || "Could not update order.");
    emitStorageChange(STORAGE_KEYS.orders);
    if (status === "cancelled") emitStorageChange(STORAGE_KEYS.products);
    return ok(data.order);
  },

  async updatePayment(id: string, status: PaymentStatus, note?: string): Promise<Result<Order>> {
    const res = await fetch(`/api/orders/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "payment", status, note }),
    });
    const data = (await res.json()) as { order?: Order; error?: string };
    if (!res.ok || !data.order) return fail(data.error || "Could not update payment.");
    emitStorageChange(STORAGE_KEYS.orders);
    return ok(data.order);
  },

  async simulateNextStep(id: string): Promise<Result<Order>> {
    const res = await fetch(`/api/orders/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "simulate" }),
    });
    const data = (await res.json()) as { order?: Order; error?: string };
    if (!res.ok || !data.order) return fail(data.error || "Could not simulate next step.");
    emitStorageChange(STORAGE_KEYS.orders);
    return ok(data.order);
  },
};

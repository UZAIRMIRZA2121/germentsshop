import { emitStorageChange, STORAGE_KEYS } from "../storage";

export const newsletterService = {
  async subscribe(email: string): Promise<{ alreadySubscribed: boolean }> {
    const res = await fetch("/api/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) return { alreadySubscribed: false };
    return (await res.json()) as { alreadySubscribed: boolean };
  },
};

export const contactService = {
  async send(input: { name: string; email: string; message: string }): Promise<boolean> {
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    return res.ok;
  },
};

export const demoService = {
  async resetCatalogAndOrders(): Promise<void> {
    await fetch("/api/admin/reset", { method: "POST" });
    emitStorageChange(STORAGE_KEYS.products);
    emitStorageChange(STORAGE_KEYS.categories);
    emitStorageChange(STORAGE_KEYS.orders);
  },
};

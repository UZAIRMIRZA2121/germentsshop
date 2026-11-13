import { emitStorageChange, readJSON, STORAGE_KEYS, writeJSON } from "../storage";
import type { CustomerProfile, SavedAddress } from "../types";
import { fail, ok, type Result } from "./result";

export interface CheckoutInfo {
  fullName: string;
  mobile: string;
  email: string;
  city: string;
  address: string;
}

export interface AuthUser extends CustomerProfile {
  role: "customer" | "admin";
}

export const customerService = {
  async getSession(): Promise<{ user: AuthUser | null; addresses: SavedAddress[] }> {
    const res = await fetch("/api/auth/session", { cache: "no-store" });
    if (!res.ok) return { user: null, addresses: [] };
    return (await res.json()) as { user: AuthUser | null; addresses: SavedAddress[] };
  },

  async login(email: string, password: string): Promise<Result<AuthUser>> {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = (await res.json()) as { user?: AuthUser; error?: string };
    if (!res.ok || !data.user) return fail(data.error || "Sign in failed.");
    emitStorageChange(STORAGE_KEYS.profile);
    emitStorageChange(STORAGE_KEYS.addresses);
    emitStorageChange(STORAGE_KEYS.orders);
    return ok(data.user);
  },

  async register(input: {
    fullName: string;
    mobile: string;
    email: string;
    password: string;
  }): Promise<Result<AuthUser>> {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const data = (await res.json()) as { user?: AuthUser; error?: string };
    if (!res.ok || !data.user) return fail(data.error || "Registration failed.");
    emitStorageChange(STORAGE_KEYS.profile);
    emitStorageChange(STORAGE_KEYS.addresses);
    emitStorageChange(STORAGE_KEYS.orders);
    return ok(data.user);
  },

  async logout(): Promise<void> {
    await fetch("/api/auth/logout", { method: "POST" });
    emitStorageChange(STORAGE_KEYS.profile);
    emitStorageChange(STORAGE_KEYS.addresses);
    emitStorageChange(STORAGE_KEYS.orders);
  },

  async saveProfile(profile: CustomerProfile): Promise<void> {
    await fetch("/api/auth/session", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    });
    emitStorageChange(STORAGE_KEYS.profile);
  },

  async saveAddresses(addresses: SavedAddress[]): Promise<void> {
    await fetch("/api/account/addresses", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ addresses }),
    });
    emitStorageChange(STORAGE_KEYS.addresses);
  },

  async getCheckoutInfo(): Promise<CheckoutInfo | null> {
    return readJSON<CheckoutInfo | null>(STORAGE_KEYS.checkoutInfo, null);
  },

  async saveCheckoutInfo(info: CheckoutInfo): Promise<void> {
    writeJSON(STORAGE_KEYS.checkoutInfo, info, { silent: true });
  },
};

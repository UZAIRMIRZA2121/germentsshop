"use client";

import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";
import { useStoredResource } from "@/hooks/useStoredResource";
import { demoProfile } from "@/lib/data/orders";
import { customerService, type AuthUser } from "@/lib/services/customerService";
import type { Result } from "@/lib/services/result";
import { STORAGE_KEYS } from "@/lib/storage";
import type { CustomerProfile, SavedAddress } from "@/lib/types";

interface SessionState {
  user: AuthUser | null;
  addresses: SavedAddress[];
}

interface AccountContextValue {
  ready: boolean;
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  /** Backwards-compatible profile object (falls back to empty guest template when signed out). */
  profile: CustomerProfile;
  addresses: SavedAddress[];
  login: (email: string, password: string) => Promise<Result<AuthUser>>;
  register: (input: {
    fullName: string;
    mobile: string;
    email: string;
    password: string;
  }) => Promise<Result<AuthUser>>;
  logout: () => Promise<void>;
  saveProfile: (profile: CustomerProfile) => Promise<void>;
  saveAddresses: (addresses: SavedAddress[]) => Promise<void>;
  refresh: () => Promise<void>;
}

const AccountContext = createContext<AccountContextValue | null>(null);
const KEYS = [STORAGE_KEYS.profile, STORAGE_KEYS.addresses];
const EMPTY: SessionState = { user: null, addresses: [] };

export function AccountProvider({ children }: { children: ReactNode }) {
  const { data, ready, refresh } = useStoredResource<SessionState>(
    KEYS,
    () => customerService.getSession(),
    EMPTY,
  );

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await customerService.login(email, password);
      if (res.ok) await refresh();
      return res;
    },
    [refresh],
  );

  const register = useCallback(
    async (input: { fullName: string; mobile: string; email: string; password: string }) => {
      const res = await customerService.register(input);
      if (res.ok) await refresh();
      return res;
    },
    [refresh],
  );

  const logout = useCallback(async () => {
    await customerService.logout();
    await refresh();
  }, [refresh]);

  const profile: CustomerProfile = data.user ?? { ...demoProfile, id: "", fullName: "", mobile: "", email: "" };

  const value = useMemo<AccountContextValue>(
    () => ({
      ready,
      user: data.user,
      isAuthenticated: !!data.user,
      isAdmin: data.user?.role === "admin",
      profile,
      addresses: data.addresses,
      login,
      register,
      logout,
      saveProfile: (p) => customerService.saveProfile(p),
      saveAddresses: (a) => customerService.saveAddresses(a),
      refresh,
    }),
    [ready, data.user, data.addresses, profile, login, register, logout, refresh],
  );

  return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>;
}

export function useAccount(): AccountContextValue {
  const ctx = useContext(AccountContext);
  if (!ctx) throw new Error("useAccount must be used within AccountProvider");
  return ctx;
}

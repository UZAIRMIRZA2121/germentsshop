"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeft,
  CreditCard,
  LayoutDashboard,
  Lock,
  LogOut,
  Menu,
  Package,
  ShoppingBag,
  X,
} from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { Button } from "@/components/ui/Button";
import { PageLoader } from "@/components/ui/Feedback";
import { Input } from "@/components/ui/Field";
import { useAccount } from "@/context/AccountContext";
import { useOrders } from "@/context/OrdersContext";
import { useToast } from "@/context/ToastContext";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "Products & Categories", icon: Package, exact: false },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag, exact: false },
  { href: "/admin/payments", label: "Payment Verification", icon: CreditCard, exact: false },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, isAdmin, ready: authReady, login, logout } = useAccount();
  const { orders } = useOrders();
  const toast = useToast();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const res = await login(email, password);
    setSubmitting(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    if (res.data.role !== "admin") {
      setError("This account does not have admin privileges.");
      return;
    }
    toast.success("Welcome back, Admin");
  };

  if (!authReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink-50">
        <PageLoader label="Verifying admin session…" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink-50 p-4">
        <div className="card w-full max-w-md space-y-6 p-6 sm:p-8">
          <div className="flex flex-col items-center text-center">
            <Logo />
            <h1 className="mt-5 font-display text-2xl font-semibold text-ink-900">Admin Sign In</h1>
            <p className="mt-1 text-sm text-ink-500">
              Sign in with your administrator credentials to manage products, orders, and payments.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="Admin Email"
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@alamfashion.example"
            />
            <Input
              label="Password"
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
            {error && (
              <p role="alert" className="text-sm font-medium text-red-600">
                {error}
              </p>
            )}
            <Button
              type="submit"
              size="lg"
              className="w-full"
              loading={submitting}
              leftIcon={<Lock className="h-4 w-4" />}
            >
              Sign In to Admin
            </Button>
          </form>

          <div className="rounded-xl border border-dashed border-ink-300 bg-ink-50 p-3.5 text-xs text-ink-600">
            <p className="font-semibold text-ink-900">Default Admin Credentials</p>
            <p className="mt-1">
              Email: <code className="font-mono">admin@alamfashion.example</code>
              <br />
              Password: <code className="font-mono">admin123</code>
            </p>
            <button
              type="button"
              onClick={() => {
                setEmail("admin@alamfashion.example");
                setPassword("admin123");
              }}
              className="mt-2 font-semibold text-brand-600 hover:underline"
            >
              Fill admin credentials →
            </button>
          </div>

          <div className="text-center">
            <Link href="/" className="text-sm font-medium text-ink-500 hover:text-ink-900">
              ← Back to Storefront
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const pendingPayments = orders.filter(
    (o) => o.paymentMethod === "manual" && o.paymentStatus === "verification_pending",
  ).length;
  const pendingOrders = orders.filter(
    (o) => o.fulfillmentStatus === "placed" || o.fulfillmentStatus === "confirmed",
  ).length;

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between p-4">
      <div>
        <div className="mb-6 flex items-center justify-between px-2">
          <Logo />
          <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
            Admin
          </span>
        </div>

        <nav aria-label="Admin navigation" className="space-y-1">
          {navItems.map(({ href, label, icon: Icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href);
            const badge =
              href === "/admin/payments"
                ? pendingPayments
                : href === "/admin/orders"
                  ? pendingOrders
                  : 0;
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition",
                  active
                    ? "bg-ink-900 text-white"
                    : "text-ink-700 hover:bg-ink-100 hover:text-ink-900",
                )}
              >
                <span className="flex items-center gap-2.5">
                  <Icon className="h-4 w-4" />
                  {label}
                </span>
                {badge > 0 && (
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[11px] font-bold",
                      active ? "bg-brand-500 text-white" : "bg-amber-100 text-amber-800",
                    )}
                  >
                    {badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="space-y-1 border-t border-ink-100 pt-4">
        <p className="px-3 pb-1 text-xs text-ink-400">Signed in as {user?.email}</p>
        <Link
          href="/"
          className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-600 transition hover:bg-ink-100 hover:text-ink-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Storefront
        </Link>
        <button
          type="button"
          onClick={() => void logout().then(() => toast.info("Signed out from Admin"))}
          className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-ink-50 lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="hidden border-r border-ink-200 bg-white lg:block">
        <div className="sticky top-0 h-screen overflow-y-auto">{sidebarContent}</div>
      </aside>

      <div className="flex items-center justify-between border-b border-ink-200 bg-white px-4 py-3 lg:hidden">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="rounded-lg p-2 text-ink-700 hover:bg-ink-100"
            aria-label="Open admin menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="font-display text-lg font-semibold text-ink-900">Admin Dashboard</span>
        </div>
        <Link href="/" className="text-sm font-semibold text-brand-600">
          Storefront →
        </Link>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-ink-900/50" onClick={() => setMobileOpen(false)} />
          <div className="relative h-full w-72 bg-white shadow-2xl">
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-3 rounded-full p-1.5 text-ink-400 hover:bg-ink-100"
              aria-label="Close admin menu"
            >
              <X className="h-5 w-5" />
            </button>
            {sidebarContent}
          </div>
        </div>
      )}

      <main className="p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  );
}

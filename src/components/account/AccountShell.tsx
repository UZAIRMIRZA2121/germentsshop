"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, LogIn, LogOut, Package, PackageSearch, User, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PageLoader } from "@/components/ui/Feedback";
import { Input } from "@/components/ui/Field";
import { Breadcrumbs, PageHeader } from "@/components/ui/Headings";
import { useAccount } from "@/context/AccountContext";
import { useToast } from "@/context/ToastContext";
import { cn, initials } from "@/lib/utils";

const links = [
  { href: "/account", label: "Profile & Addresses", icon: User, exact: true },
  { href: "/account/orders", label: "My Orders", icon: Package, exact: false },
  { href: "/wishlist", label: "Wishlist", icon: Heart, exact: true },
  { href: "/track-order", label: "Track Order", icon: PackageSearch, exact: true },
];

export function AccountShell({
  title,
  description,
  breadcrumb,
  children,
}: {
  title: string;
  description?: string;
  breadcrumb?: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { profile, isAuthenticated, ready, login, register, logout } = useAccount();
  const toast = useToast();

  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const res =
      mode === "login"
        ? await login(email, password)
        : await register({ fullName, mobile, email, password });
    setSubmitting(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    toast.success(mode === "login" ? "Signed in!" : "Account created!");
  };

  return (
    <div className="container-page py-8 sm:py-10">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          ...(breadcrumb
            ? [{ label: "My Account", href: "/account" }, { label: breadcrumb }]
            : [{ label: "My Account" }]),
        ]}
      />
      <PageHeader title={title} description={description} />

      {!ready ? (
        <PageLoader label="Checking session…" />
      ) : !isAuthenticated ? (
        <div className="mx-auto max-w-md">
          <div className="card space-y-5 p-6 sm:p-8">
            <div className="flex gap-2 rounded-xl bg-ink-100 p-1">
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setError("");
                }}
                className={cn(
                  "flex-1 rounded-lg py-2 text-sm font-semibold transition",
                  mode === "login" ? "bg-white text-ink-900 shadow-sm" : "text-ink-600",
                )}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("register");
                  setError("");
                }}
                className={cn(
                  "flex-1 rounded-lg py-2 text-sm font-semibold transition",
                  mode === "register" ? "bg-white text-ink-900 shadow-sm" : "text-ink-600",
                )}
              >
                Create Account
              </button>
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
              {mode === "register" && (
                <>
                  <Input
                    label="Full Name"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ayesha Khan"
                  />
                  <Input
                    label="Mobile Number"
                    required
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="0300 1234567"
                  />
                </>
              )}
              <Input
                label="Email Address"
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
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
                leftIcon={mode === "login" ? <LogIn className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
              >
                {mode === "login" ? "Sign In" : "Create Account"}
              </Button>
            </form>

            {mode === "login" && (
              <div className="rounded-xl border border-dashed border-ink-300 bg-ink-50 p-3.5 text-xs text-ink-600">
                <p className="font-semibold text-ink-900">Seeded Customer Account</p>
                <p className="mt-1">
                  Email: <code className="font-mono">ayesha.khan@example.com</code> · Password:{" "}
                  <code className="font-mono">customer123</code>
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setEmail("ayesha.khan@example.com");
                    setPassword("customer123");
                  }}
                  className="mt-2 font-semibold text-brand-600 hover:underline"
                >
                  Fill demo customer credentials →
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
          <aside>
            <div className="card p-4">
              <div className="mb-4 flex items-center gap-3 border-b border-ink-100 pb-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
                  {initials(profile.fullName || "User")}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink-900">{profile.fullName}</p>
                  <p className="truncate text-xs text-ink-500">{profile.mobile}</p>
                </div>
              </div>
              <nav aria-label="Account navigation" className="space-y-1">
                {links.map(({ href, label, icon: Icon, exact }) => {
                  const active = exact ? pathname === href : pathname.startsWith(href);
                  return (
                    <Link
                      key={href}
                      href={href}
                      className={cn(
                        "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                        active
                          ? "bg-ink-900 text-white"
                          : "text-ink-700 hover:bg-ink-100 hover:text-ink-900",
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {label}
                    </Link>
                  );
                })}
                <button
                  type="button"
                  onClick={() => void logout().then(() => toast.info("Signed out"))}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </nav>
            </div>
          </aside>
          <div className="min-w-0">{children}</div>
        </div>
      )}
    </div>
  );
}

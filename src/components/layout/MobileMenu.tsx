"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, LayoutDashboard, PackageSearch, ShoppingBag, User, X } from "lucide-react";
import { useCatalog } from "@/context/CatalogContext";
import { navLinks } from "@/lib/config/site";
import { cn } from "@/lib/utils";
import { Logo } from "./Logo";

export function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const { categories } = useCatalog();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = original;
    };
  }, [open, onClose]);

  if (!open) return null;

  const quick = [
    { href: "/account", label: "My Account", icon: User },
    { href: "/wishlist", label: "Wishlist", icon: Heart },
    { href: "/cart", label: "Cart", icon: ShoppingBag },
    { href: "/track-order", label: "Track Order", icon: PackageSearch },
  ];

  return (
    <div className="fixed inset-0 z-[80] lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
      <div className="absolute inset-0 bg-ink-900/50 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div className="absolute inset-y-0 left-0 flex w-[86%] max-w-sm flex-col overflow-y-auto bg-white shadow-2xl [animation:slide-in_0.25s_ease-out] [transform-origin:left]">
        <div className="flex items-center justify-between border-b border-ink-100 px-4 py-3">
          <Logo />
          <button type="button" onClick={onClose} className="rounded-full p-2 text-ink-500 hover:bg-ink-100" aria-label="Close menu">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4" aria-label="Mobile navigation">
          <ul className="space-y-1">
            {navLinks.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  onClick={onClose}
                  className={cn(
                    "block rounded-lg px-3 py-3 text-base font-medium transition hover:bg-ink-50",
                    (l.href === "/" ? pathname === "/" : pathname.startsWith(l.href)) ? "bg-brand-50 text-brand-700" : "text-ink-800",
                  )}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>

          <p className="mb-2 mt-6 px-3 text-xs font-bold uppercase tracking-wider text-ink-400">Shop by category</p>
          <ul className="space-y-0.5">
            {categories.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/shop?category=${c.slug}`}
                  onClick={onClose}
                  className="block rounded-lg px-3 py-2.5 text-sm text-ink-700 hover:bg-ink-50"
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>

          <p className="mb-2 mt-6 px-3 text-xs font-bold uppercase tracking-wider text-ink-400">My stuff</p>
          <div className="grid grid-cols-2 gap-2">
            {quick.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className="flex items-center gap-2 rounded-xl border border-ink-200 px-3 py-3 text-sm font-medium text-ink-800 hover:border-brand-400 hover:bg-brand-50"
              >
                <Icon className="h-4 w-4 text-brand-600" />
                {label}
              </Link>
            ))}
          </div>
        </nav>

        <div className="border-t border-ink-100 p-4">
          <Link
            href="/admin"
            onClick={onClose}
            className="flex items-center gap-2 rounded-lg bg-ink-100 px-3 py-2.5 text-sm font-medium text-ink-700 hover:bg-ink-200"
          >
            <LayoutDashboard className="h-4 w-4" />
            Admin dashboard (demo)
          </Link>
        </div>
      </div>
    </div>
  );
}


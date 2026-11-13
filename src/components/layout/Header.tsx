"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Heart, Menu, ShoppingBag, User } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useCatalog } from "@/context/CatalogContext";
import { useWishlist } from "@/context/WishlistContext";
import { navLinks } from "@/lib/config/site";
import { cn } from "@/lib/utils";
import { AnnouncementBar } from "./AnnouncementBar";
import { Logo } from "./Logo";
import { MobileMenu } from "./MobileMenu";
import { SearchBar } from "./SearchBar";

function CountBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-brand-500 px-1 text-[10px] font-bold text-white ring-2 ring-white">
      {count > 99 ? "99+" : count}
    </span>
  );
}

export function Header() {
  const pathname = usePathname();
  const { categories } = useCatalog();
  const cart = useCart();
  const wishlist = useWishlist();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setMenuOpen(false), [pathname]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  const cartCount = cart.ready ? cart.itemCount : 0;
  const wishCount = wishlist.ready ? wishlist.count : 0;

  const iconBtn =
    "relative flex h-11 w-11 items-center justify-center rounded-full text-ink-700 transition hover:bg-ink-100 hover:text-ink-900";

  return (
    <>
      <AnnouncementBar />
      <header
        className={cn(
          "sticky top-0 z-40 border-b bg-white/90 backdrop-blur-lg transition-shadow",
          scrolled ? "border-ink-200 shadow-md shadow-ink-900/5" : "border-transparent",
        )}
      >
        <div className="container-page">
          <div className="flex h-[68px] items-center gap-3 lg:gap-6">
            <button
              type="button"
              className={cn(iconBtn, "-ml-2 lg:hidden")}
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              aria-expanded={menuOpen}
            >
              <Menu className="h-6 w-6" />
            </button>

            <Logo />

            <nav className="ml-4 hidden items-center gap-1 lg:flex" aria-label="Main navigation">
              {navLinks.map((link) =>
                "hasMenu" in link && link.hasMenu ? (
                  <div key={link.href} className="group relative">
                    <Link
                      href={link.href}
                      className={cn(
                        "flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition hover:bg-ink-100",
                        isActive(link.href) ? "text-brand-600" : "text-ink-700",
                      )}
                    >
                      {link.label}
                      <ChevronDown className="h-3.5 w-3.5 transition group-hover:rotate-180 group-focus-within:rotate-180" />
                    </Link>
                    <div className="invisible absolute left-0 top-full z-50 w-64 translate-y-1 pt-2 opacity-0 transition group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                      <div className="rounded-2xl border border-ink-200 bg-white p-2 shadow-xl">
                        {categories.map((c) => (
                          <Link
                            key={c.id}
                            href={`/shop?category=${c.slug}`}
                            className="block rounded-lg px-3 py-2 text-sm text-ink-700 transition hover:bg-brand-50 hover:text-brand-700"
                          >
                            {c.name}
                          </Link>
                        ))}
                        <Link
                          href="/categories"
                          className="mt-1 block rounded-lg border-t border-ink-100 px-3 py-2 text-sm font-semibold text-brand-600 hover:bg-brand-50"
                        >
                          View all categories →
                        </Link>
                      </div>
                    </div>
                  </div>
                ) : (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "rounded-lg px-3 py-2 text-sm font-medium transition hover:bg-ink-100",
                      isActive(link.href) ? "text-brand-600" : "text-ink-700",
                    )}
                    aria-current={isActive(link.href) ? "page" : undefined}
                  >
                    {link.label}
                  </Link>
                ),
              )}
            </nav>

            <SearchBar className="ml-auto hidden max-w-md flex-1 md:block" />

            <div className="ml-auto flex items-center gap-0.5 md:ml-0">
              <Link href="/wishlist" className={cn(iconBtn, "hidden sm:flex")} aria-label={`Wishlist (${wishCount} items)`}>
                <Heart className="h-[22px] w-[22px]" />
                <CountBadge count={wishCount} />
              </Link>
              <Link href="/account" className={cn(iconBtn, "hidden sm:flex")} aria-label="My account">
                <User className="h-[22px] w-[22px]" />
              </Link>
              <Link href="/cart" className={iconBtn} aria-label={`Shopping cart (${cartCount} items)`}>
                <ShoppingBag className="h-[22px] w-[22px]" />
                <CountBadge count={cartCount} />
              </Link>
            </div>
          </div>

          <div className="pb-3 md:hidden">
            <SearchBar />
          </div>
        </div>
      </header>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}


import Link from "next/link";
import { Facebook, Instagram, Mail, MapPin, Phone, MessageCircle, Clock, Globe } from "lucide-react";
import { manualPaymentMethods } from "@/lib/config/payment";
import { DEMO_NOTICE, siteConfig } from "@/lib/config/site";
import { Logo } from "./Logo";

const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.49 6.3 6.3 0 0 0 1.95-4.49V8.55a8.28 8.28 0 0 0 5.25 1.85v-3.5a4.84 4.84 0 0 1-1.43-.21Z" />
  </svg>
);

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.301-.15-1.78-.878-2.056-.978-.276-.1-.477-.15-.678.15-.2.301-.778.978-.954 1.179-.176.2-.351.226-.652.075s-1.272-.469-2.423-1.496c-.896-.799-1.5-1.786-1.676-2.087-.176-.301-.019-.464.132-.614.136-.135.301-.351.452-.527.15-.176.2-.301.301-.502.101-.2.05-.376-.025-.526-.075-.15-.678-1.634-.929-2.239-.244-.588-.493-.509-.678-.518-.176-.009-.376-.011-.577-.011s-.527.075-.803.376c-.276.301-1.054 1.03-1.054 2.511 0 1.481 1.079 2.91 1.229 3.111.15.201 2.124 3.243 5.146 4.549.719.311 1.28.497 1.718.636.722.23 1.378.198 1.898.12.578-.087 1.78-.727 2.031-1.429.251-.702.251-1.304.176-1.429-.075-.125-.276-.201-.577-.351zM12.05 2C6.52 2 2.03 6.49 2.03 12.02c0 1.84.498 3.56 1.365 5.04L2 22.5l5.59-1.35c1.42.77 3.03 1.21 4.46 1.21 5.53 0 10.02-4.49 10.02-10.02C22.07 6.49 17.58 2 12.05 2z" />
  </svg>
);

const socialIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  TikTok: TikTokIcon,
  WhatsApp: WhatsAppIcon,
  Facebook,
  Instagram,
};

const shopLinks = [
  { label: "All Products", href: "/shop" },
  { label: "Categories", href: "/categories" },
  { label: "New Arrivals", href: "/shop?sort=newest" },
  { label: "Special Offers", href: "/shop?onSale=1" },
  { label: "Wishlist", href: "/wishlist" },
];

const supportLinks = [
  { label: "Track Your Order", href: "/track-order" },
  { label: "My Account", href: "/account" },
  { label: "Shipping Policy", href: "/policies/shipping" },
  { label: "Returns & Exchanges", href: "/policies/returns" },
  { label: "Contact Us", href: "/contact" },
];

const companyLinks = [
  { label: "About Us", href: "/about" },
  { label: "Privacy Policy", href: "/policies/privacy" },
  { label: "Terms & Conditions", href: "/policies/terms" },
  { label: "Admin Dashboard (demo)", href: "/admin" },
];

function LinkColumn({ title, links }: { title: string; links: Array<{ label: string; href: string }> }) {
  return (
    <div>
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">{title}</h3>
      <ul className="space-y-2.5 text-sm">
        {links.map((l) => (
          <li key={l.label}>
            <Link href={l.href} className="text-ink-300 transition hover:text-brand-300">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="mt-20 bg-ink-900 text-ink-300">
      <div className="container-page py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr]">
          <div>
            <Logo light />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-400">{siteConfig.description}</p>
            <ul className="mt-5 space-y-2.5 text-sm">
              <li className="flex gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-400" aria-hidden />
                {siteConfig.contact.address}
              </li>
              <li className="flex gap-2.5">
                <Phone className="h-4 w-4 shrink-0 text-brand-400" aria-hidden />
                <a href={`tel:${siteConfig.contact.phone.replace(/\s/g, "")}`} className="hover:text-white">
                  {siteConfig.contact.phone}
                </a>
              </li>
              <li className="flex gap-2.5">
                <Mail className="h-4 w-4 shrink-0 text-brand-400" aria-hidden />
                <a href={`mailto:${siteConfig.contact.email}`} className="hover:text-white">
                  {siteConfig.contact.email}
                </a>
              </li>
              <li className="flex gap-2.5">
                <Clock className="h-4 w-4 shrink-0 text-brand-400" aria-hidden />
                {siteConfig.contact.hours}
              </li>
            </ul>
            <div className="mt-5 flex gap-2">
              {siteConfig.social.map((s) => {
                const Icon = socialIcons[s.name] || Globe;
                return (
                  <a
                    key={s.name}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.name}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-ink-800 text-ink-300 transition hover:bg-brand-500 hover:text-white"
                  >
                    <Icon className="h-[18px] w-[18px]" />
                  </a>
                );
              })}
            </div>
          </div>
          <LinkColumn title="Shop" links={shopLinks} />
          <LinkColumn title="Customer Care" links={supportLinks} />
          <LinkColumn title="Company" links={companyLinks} />
        </div>

        <div className="mt-12 flex flex-col gap-6 border-t border-ink-800 pt-8 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-ink-400">We accept</p>
            <ul className="flex flex-wrap gap-2">
              {["Cash on Delivery", ...manualPaymentMethods.map((m) => m.name)].map((name) => (
                <li
                  key={name}
                  className="rounded-md border border-ink-700 bg-ink-800 px-3 py-1.5 text-xs font-semibold text-ink-200"
                >
                  {name}
                </li>
              ))}
            </ul>
          </div>
          <p className="max-w-xl text-xs leading-relaxed text-ink-400">{DEMO_NOTICE}</p>
        </div>

        <p className="mt-8 text-center text-xs text-ink-500">
          © {new Date().getFullYear()} {siteConfig.name} Garments. All rights reserved. Demo storefront — not a real shop.
        </p>
      </div>
    </footer>
  );
}


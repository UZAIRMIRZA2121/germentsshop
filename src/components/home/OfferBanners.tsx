"use client";

import Link from "next/link";
import { ArrowRight, Gift } from "lucide-react";
import { CopyButton } from "@/components/ui/CopyButton";
import { SafeImage } from "@/components/ui/SafeImage";
import { photo, unsplash } from "@/lib/data/images";

const banners = [
  {
    eyebrow: "Denim Days",
    title: "Flat 25% off all jeans",
    cta: "Shop Jeans",
    href: "/shop?category=jeans-trousers",
    image: unsplash(photo.jeansStore, 900),
    tint: "from-sky-900/85 via-sky-900/50",
  },
  {
    eyebrow: "Layer Up",
    title: "Coats & jackets from Rs. 5,999",
    cta: "Shop Outerwear",
    href: "/shop?category=jackets-outerwear",
    image: unsplash(photo.coatsRack, 900),
    tint: "from-ink-900/90 via-ink-900/55",
  },
];

export function OfferBanners() {
  return (
    <section className="container-page pt-16" aria-label="Promotions">
      <div className="grid gap-4 md:grid-cols-2">
        {banners.map((b) => (
          <Link
            key={b.title}
            href={b.href}
            className="group relative flex min-h-[240px] items-end overflow-hidden rounded-3xl bg-ink-800 p-7 sm:min-h-[280px] sm:p-9"
          >
            <SafeImage
              src={b.image}
              alt=""
              className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
            />
            <div className={`absolute inset-0 bg-gradient-to-r to-transparent ${b.tint}`} />
            <div className="relative max-w-[16rem] text-white sm:max-w-xs">
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-brand-300">{b.eyebrow}</p>
              <h3 className="font-display text-2xl font-semibold leading-tight text-white sm:text-3xl">{b.title}</h3>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold">
                {b.cta}
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </span>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-4 flex flex-col items-start justify-between gap-5 rounded-3xl bg-gradient-to-r from-brand-600 to-brand-500 p-7 text-white sm:flex-row sm:items-center sm:p-9">
        <div className="flex items-center gap-4">
          <span className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 sm:flex">
            <Gift className="h-7 w-7" aria-hidden />
          </span>
          <div>
            <h3 className="font-display text-2xl font-semibold text-white">Get 10% off your first order</h3>
            <p className="mt-1 text-white/85">
              Use coupon code at the cart. Also try <b>FREESHIP</b>, <b>SAVE500</b> and <b>STYLE20</b>.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-xl border-2 border-dashed border-white/60 bg-white/10 px-4 py-2.5">
          <span className="font-mono text-lg font-bold tracking-widest">WELCOME10</span>
          <CopyButton value="WELCOME10" label="Coupon code" className="border-white/40 bg-white/20 text-white hover:bg-white/30" />
        </div>
      </div>
    </section>
  );
}


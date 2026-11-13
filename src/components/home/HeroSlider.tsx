"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { SafeImage } from "@/components/ui/SafeImage";
import { photo, unsplash } from "@/lib/data/images";
import { cn } from "@/lib/utils";

const slides = [
  {
    eyebrow: "New Season Arrivals",
    title: "Dress the part. Own the day.",
    text: "Fresh silhouettes, premium fabrics and effortless everyday style — discover the latest drops.",
    cta: { label: "Shop New Arrivals", href: "/shop?sort=newest" },
    secondary: { label: "View Offers", href: "/shop?onSale=1" },
    image: unsplash(photo.flatlayOutfit, 1200),
    bg: "from-[#f7ece1] to-[#fbf5ee]",
    accent: "text-brand-600",
  },
  {
    eyebrow: "Winter Edit · Up to 30% off",
    title: "Layer up in style.",
    text: "Blazers, bombers and wool-blend coats built to keep you warm and looking sharp.",
    cta: { label: "Shop Outerwear", href: "/shop?category=jackets-outerwear" },
    secondary: { label: "Browse Blazers", href: "/shop?q=blazer" },
    image: unsplash(photo.leatherJacket, 1200),
    bg: "from-[#e9eef3] to-[#f5f7f9]",
    accent: "text-sky-700",
  },
  {
    eyebrow: "Comfort in Colour",
    title: "Hoodies & knits you'll live in.",
    text: "Heavyweight fleece, chunky knits and matching sets — cosy never looked this good.",
    cta: { label: "Shop Hoodies", href: "/shop?category=hoodies-sweatshirts" },
    secondary: { label: "Women's Wear", href: "/shop?category=womens-wear" },
    image: unsplash(photo.greyHoodie, 1200),
    bg: "from-[#fbf1c9] to-[#fdf8e4]",
    accent: "text-amber-700",
  },
];

export function HeroSlider() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const go = useCallback((n: number) => setIndex((n + slides.length) % slides.length), []);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % slides.length), 6000);
    return () => clearInterval(t);
  }, [paused]);

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured promotions"
      className="relative overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="flex transition-transform duration-700 ease-out" style={{ transform: `translateX(-${index * 100}%)` }}>
        {slides.map((s, i) => (
          <div
            key={s.title}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${slides.length}`}
            aria-hidden={i !== index}
            className={cn("w-full shrink-0 bg-gradient-to-br", s.bg)}
          >
            <div className="container-page grid min-h-[480px] items-center gap-6 py-10 md:min-h-[560px] md:grid-cols-2 md:py-0">
              <div className="order-2 md:order-1">
                <p className={cn("mb-4 text-xs font-bold uppercase tracking-[0.2em] sm:text-sm", s.accent)}>{s.eyebrow}</p>
                <h1 className="font-display text-4xl font-semibold leading-[1.08] tracking-tight text-ink-900 sm:text-5xl lg:text-6xl">
                  {s.title}
                </h1>
                <p className="mt-5 max-w-md text-base leading-relaxed text-ink-600 sm:text-lg">{s.text}</p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    href={s.cta.href}
                    tabIndex={i === index ? 0 : -1}
                    className="inline-flex h-12 items-center gap-2 rounded-xl bg-ink-900 px-7 text-base font-semibold text-white transition hover:bg-brand-600"
                  >
                    {s.cta.label}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href={s.secondary.href}
                    tabIndex={i === index ? 0 : -1}
                    className="inline-flex h-12 items-center rounded-xl border border-ink-900/20 bg-white/60 px-7 text-base font-semibold text-ink-900 transition hover:bg-white"
                  >
                    {s.secondary.label}
                  </Link>
                </div>
              </div>
              <div className="relative order-1 mx-auto h-[300px] w-full max-w-md md:order-2 md:h-[480px] md:max-w-lg">
                <div className="absolute -right-3 top-6 hidden h-full w-full rounded-[2rem] border-2 border-ink-900/10 md:block" aria-hidden />
                <SafeImage
                  src={s.image}
                  alt=""
                  loading={i === 0 ? "eager" : "lazy"}
                  fetchPriority={i === 0 ? "high" : undefined}
                  className="relative h-full w-full rounded-[2rem] object-cover object-top shadow-2xl shadow-ink-900/15"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => go(index - 1)}
        aria-label="Previous slide"
        className="absolute left-3 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink-800 shadow-lg transition hover:bg-white lg:flex"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={() => go(index + 1)}
        aria-label="Next slide"
        className="absolute right-3 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink-800 shadow-lg transition hover:bg-white lg:flex"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
        {slides.map((s, i) => (
          <button
            key={s.title}
            type="button"
            onClick={() => go(i)}
            aria-label={`Go to slide ${i + 1}`}
            aria-current={i === index}
            className={cn("h-2 rounded-full transition-all", i === index ? "w-8 bg-ink-900" : "w-2 bg-ink-900/30 hover:bg-ink-900/60")}
          />
        ))}
      </div>
    </section>
  );
}


import Link from "next/link";
import { siteConfig } from "@/lib/config/site";
import { cn } from "@/lib/utils";
import { AlamLogoIcon } from "./AlamLogoIcon";

export function Logo({ className, light }: { className?: string; light?: boolean }) {
  return (
    <Link
      href="/"
      className={cn("group inline-flex items-center gap-2.5", className)}
      aria-label={`${siteConfig.name} home`}
    >
      <span className="flex shrink-0 transition duration-300 group-hover:scale-105 group-hover:rotate-3">
        <AlamLogoIcon size={42} />
      </span>
      <span className="leading-none">
        <span
          className={cn(
            "block font-display text-xl font-bold tracking-tight",
            light ? "text-white" : "text-ink-900",
          )}
        >
          {siteConfig.name}
        </span>
        <span
          className={cn(
            "mt-0.5 block text-[10px] font-semibold uppercase tracking-[0.24em]",
            light ? "text-brand-300" : "text-brand-600",
          )}
        >
          Garments &amp; Apparel
        </span>
      </span>
    </Link>
  );
}

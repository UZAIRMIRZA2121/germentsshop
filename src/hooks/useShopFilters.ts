"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { defaultFilters, parseFilters, serializeFilters, type ShopFilters } from "@/lib/shopFilters";

/** Shop filter state lives in the URL so views are shareable and survive refresh. */
export function useShopFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const paramString = searchParams.toString();

  const filters = useMemo(() => parseFilters(new URLSearchParams(paramString)), [paramString]);

  const update = useCallback(
    (patch: Partial<ShopFilters>) => {
      const next = { ...parseFilters(new URLSearchParams(window.location.search)), ...patch };
      const qs = serializeFilters(next);
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, pathname],
  );

  const clear = useCallback(() => {
    const current = parseFilters(new URLSearchParams(window.location.search));
    const qs = serializeFilters({ ...defaultFilters, sort: current.sort });
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [router, pathname]);

  return { filters, update, clear };
}


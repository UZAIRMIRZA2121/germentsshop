import type { Metadata } from "next";
import { Suspense } from "react";
import { ShopView } from "@/components/shop/ShopView";
import { PageLoader } from "@/components/ui/Feedback";

export const metadata: Metadata = {
  title: "Shop",
  description: "Browse all garments — filter by category, price, size and colour.",
};

export default function ShopPage() {
  return (
    <Suspense fallback={<PageLoader label="Loading shop…" />}>
      <ShopView />
    </Suspense>
  );
}


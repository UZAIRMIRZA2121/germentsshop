import type { Metadata } from "next";
import { Suspense } from "react";
import { CheckoutView } from "@/components/checkout/CheckoutView";
import { PageLoader } from "@/components/ui/Feedback";

export const metadata: Metadata = { title: "Checkout" };

export default function CheckoutPage() {
  return (
    <Suspense fallback={<PageLoader label="Loading checkout…" />}>
      <CheckoutView />
    </Suspense>
  );
}


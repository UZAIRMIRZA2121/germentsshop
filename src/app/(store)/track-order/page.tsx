import type { Metadata } from "next";
import { Suspense } from "react";
import { TrackOrderView } from "@/components/order/TrackOrderView";
import { PageLoader } from "@/components/ui/Feedback";

export const metadata: Metadata = { title: "Track Order" };

export default function TrackOrderPage() {
  return (
    <Suspense fallback={<PageLoader label="Loading order tracker…" />}>
      <TrackOrderView />
    </Suspense>
  );
}


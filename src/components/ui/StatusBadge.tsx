import type { FulfillmentStatus, PaymentStatus } from "@/lib/types";
import { FULFILLMENT_LABELS, PAYMENT_LABELS, statusTone } from "@/lib/utils";
import { Badge } from "./Badge";

export function FulfillmentBadge({ status }: { status: FulfillmentStatus }) {
  return <Badge tone={statusTone(status)}>{FULFILLMENT_LABELS[status]}</Badge>;
}

export function PaymentBadge({ status }: { status: PaymentStatus }) {
  return <Badge tone={statusTone(status)}>{PAYMENT_LABELS[status]}</Badge>;
}


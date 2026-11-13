import { shippingConfig } from "./config/payment";
import type {
  FulfillmentStatus,
  PaymentStatus,
  TimelineEvent,
} from "./types";
import { FULFILLMENT_LABELS, FULFILLMENT_STEPS, PAYMENT_LABELS, addDays, uid } from "./utils";

export const FULFILLMENT_NOTES: Record<FulfillmentStatus, string> = {
  placed: "We have received your order.",
  confirmed: "Your order has been confirmed by the store.",
  processing: "Your items are being picked and packed.",
  shipped: "Your parcel has been handed over to the courier.",
  out_for_delivery: "The courier is on the way to your address.",
  delivered: "Your parcel has been delivered. Enjoy!",
  cancelled: "This order has been cancelled.",
};

export const PAYMENT_NOTES: Record<PaymentStatus, string> = {
  cod_pending: "Cash on Delivery — please keep the exact amount ready.",
  cod_collected: "Cash payment was received on delivery.",
  verification_pending:
    "Your payment details were submitted. The store will verify the transfer before processing the order.",
  verified: "The store has verified your payment.",
  rejected:
    "The payment could not be verified. Please contact support with your transaction details.",
};

export function fulfillmentEvent(
  status: FulfillmentStatus,
  at: string,
  note?: string,
  simulated = false,
): TimelineEvent {
  return {
    id: uid("evt"),
    kind: "order",
    status,
    title: FULFILLMENT_LABELS[status],
    note: note ?? FULFILLMENT_NOTES[status],
    at,
    simulated: simulated || undefined,
  };
}

export function paymentEvent(
  status: PaymentStatus,
  at: string,
  note?: string,
): TimelineEvent {
  return {
    id: uid("evt"),
    kind: "payment",
    status,
    title: PAYMENT_LABELS[status],
    note: note ?? PAYMENT_NOTES[status],
    at,
  };
}

export function nextFulfillmentStatus(
  current: FulfillmentStatus,
): FulfillmentStatus | null {
  const idx = FULFILLMENT_STEPS.indexOf(current);
  if (idx === -1 || idx === FULFILLMENT_STEPS.length - 1) return null;
  return FULFILLMENT_STEPS[idx + 1];
}

/** Delivery window based on destination city. */
export function estimateDelivery(
  city: string,
  from: Date | string = new Date(),
): { from: string; to: string } {
  const isMetro = shippingConfig.metroCities.includes(city.trim().toLowerCase());
  const days = isMetro ? shippingConfig.metroDays : shippingConfig.otherDays;
  return {
    from: addDays(from, days.min).toISOString(),
    to: addDays(from, days.max).toISOString(),
  };
}

export function formatOrderNumber(year: number, counter: number): string {
  return `ORD-${year}-${counter}`;
}


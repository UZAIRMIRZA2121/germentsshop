import { siteConfig } from "./config/site";
import type { Order } from "./types";
import { formatDate, formatPrice, PAYMENT_LABELS } from "./utils";

/** Strips non-digits and converts local 03XX... Pakistani numbers to 923XX... */
export function normalizeWhatsAppNumber(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("00")) return digits.slice(2);
  if (digits.startsWith("0") && digits.length === 11) return `92${digits.slice(1)}`;
  return digits;
}

export function formatOrderWhatsAppMessage(order: Order): string {
  const lines: string[] = [];
  lines.push(`*New Order — ${siteConfig.name}*`);
  lines.push(`*Order ID:* ${order.id}`);
  lines.push(`*Date:* ${formatDate(order.createdAt, true)}`);
  lines.push("");

  lines.push("*Customer Details*");
  lines.push(`Name: ${order.customer.fullName}`);
  lines.push(`Mobile: ${order.customer.mobile}`);
  if (order.customer.email) lines.push(`Email: ${order.customer.email}`);
  lines.push(`City: ${order.delivery.city}`);
  lines.push(`Address: ${order.delivery.address}`);
  if (order.notes) lines.push(`Notes: ${order.notes}`);
  lines.push("");

  lines.push("*Products Ordered*");
  order.items.forEach((item, idx) => {
    const variant = [item.color, item.size].filter(Boolean).join(" / ");
    lines.push(
      `${idx + 1}. ${item.name}${variant ? ` (${variant})` : ""} × ${item.quantity} — ${formatPrice(item.price * item.quantity)}`,
    );
  });
  lines.push("");

  lines.push("*Amount Summary*");
  lines.push(`Subtotal: ${formatPrice(order.subtotal)}`);
  if (order.discount > 0) {
    lines.push(
      `Discount${order.couponCode ? ` (${order.couponCode})` : ""}: -${formatPrice(order.discount)}`,
    );
  }
  lines.push(`Shipping: ${order.shipping === 0 ? "Free" : formatPrice(order.shipping)}`);
  lines.push(`*Total Payable: ${formatPrice(order.total)}*`);
  lines.push("");

  lines.push("*Payment Information*");
  if (order.paymentMethod === "cod") {
    lines.push("Method: Cash on Delivery (COD)");
    lines.push(`Status: ${PAYMENT_LABELS[order.paymentStatus]}`);
  } else {
    lines.push(
      `Method: Manual Online Payment (${order.manualPayment?.methodName ?? "Online Transfer"})`,
    );
    if (order.manualPayment?.transactionId) {
      lines.push(`Transaction ID: ${order.manualPayment.transactionId}`);
    }
    if (order.manualPayment?.senderMobile) {
      lines.push(`Sender Mobile: ${order.manualPayment.senderMobile}`);
    }
    lines.push(`Status: ${PAYMENT_LABELS[order.paymentStatus]}`);
  }

  return lines.join("\n");
}

export function getWhatsAppOrderUrl(order: Order, targetNumber?: string): string {
  const num = normalizeWhatsAppNumber(targetNumber || siteConfig.contact.whatsapp);
  const text = encodeURIComponent(formatOrderWhatsAppMessage(order));
  return `https://wa.me/${num}?text=${text}`;
}


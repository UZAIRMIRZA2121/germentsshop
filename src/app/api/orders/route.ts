import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { SEED_ORDER_START } from "@/lib/data/orders";
import { prisma } from "@/lib/db";
import {
  estimateDelivery,
  formatOrderNumber,
  fulfillmentEvent,
  paymentEvent,
} from "@/lib/orderUtils";
import { calculateTotals } from "@/lib/pricing";
import { mapOrder } from "@/lib/server/mappers";
import { ensureSeeded } from "@/lib/server/seed";
import type { OrderDraft, PaymentStatus } from "@/lib/types";

export async function GET() {
  await ensureSeeded();
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ orders: [] });
  }
  const where = session.role === "admin" ? {} : { userId: session.userId };
  try {
    const rows = await prisma.order.findMany({
      where,
      include: { items: true, timeline: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ orders: rows.map(mapOrder) });
  } catch (err) {
    console.warn("[Orders] DB read fallback:", err);
    return NextResponse.json({ orders: [] });
  }
}

export async function POST(req: Request) {
  await ensureSeeded();
  const session = await getSession();
  const draft = (await req.json()) as OrderDraft;

  if (!draft.items?.length) {
    return NextResponse.json({ error: "Your order has no items." }, { status: 400 });
  }
  if (!draft.customer?.fullName?.trim() || !draft.customer?.mobile?.trim() || !draft.delivery?.address?.trim()) {
    return NextResponse.json({ error: "Customer and delivery details are required." }, { status: 400 });
  }
  if (draft.paymentMethod === "manual" && (!draft.manualPayment?.transactionId?.trim() || !draft.manualPayment?.senderMobile?.trim())) {
    return NextResponse.json({ error: "Transaction ID and sender mobile are required for manual payments." }, { status: 400 });
  }

  try {
    const created = await prisma.$transaction(async (tx) => {
      // Re-verify product prices & stock on the server
      const pricedLines = [];
      const orderItemsData = [];
      for (const line of draft.items) {
        const prod = await tx.product.findUnique({ where: { id: line.productId } });
        if (!prod) throw new Error(`Product "${line.name}" is no longer available.`);
        if (prod.stock < line.quantity) {
          throw new Error(`Only ${prod.stock} left in stock for "${prod.name}".`);
        }
        await tx.product.update({
          where: { id: prod.id },
          data: { stock: { decrement: line.quantity } },
        });
        pricedLines.push({
          unitPrice: prod.price,
          originalPrice: prod.originalPrice ?? undefined,
          quantity: line.quantity,
        });
        orderItemsData.push({
          productId: prod.id,
          slug: prod.slug,
          name: prod.name,
          image: JSON.parse(prod.imagesJson)[0] ?? line.image,
          price: prod.price,
          originalPrice: prod.originalPrice,
          quantity: line.quantity,
          size: line.size,
          color: line.color,
        });
      }

      const totals = calculateTotals(pricedLines, draft.couponCode ?? null);

      const meta = await tx.appMeta.findUnique({ where: { key: "orderCounter" } });
      let counter = meta ? Number(meta.value) : SEED_ORDER_START - 1;
      const year = new Date().getFullYear();
      let orderId: string;
      do {
        counter += 1;
        orderId = formatOrderNumber(year, counter);
      } while (await tx.order.findUnique({ where: { id: orderId } }));

      await tx.appMeta.upsert({
        where: { key: "orderCounter" },
        update: { value: String(counter) },
        create: { key: "orderCounter", value: String(counter) },
      });

      const now = new Date();
      const nowIso = now.toISOString();
      const isManual = draft.paymentMethod === "manual";
      const paymentStatus: PaymentStatus = isManual ? "verification_pending" : "cod_pending";
      const est = estimateDelivery(draft.delivery.city, now);

      const placedEvt = fulfillmentEvent("placed", nowIso);
      const payEvt = paymentEvent(
        paymentStatus,
        nowIso,
        isManual
          ? `Transaction reference ${draft.manualPayment?.transactionId ?? ""} submitted via ${draft.manualPayment?.methodName ?? "manual transfer"}. Awaiting verification by the store.`
          : undefined,
      );

      return tx.order.create({
        data: {
          id: orderId,
          userId: session?.userId ?? null,
          customerName: draft.customer.fullName.trim(),
          customerMobile: draft.customer.mobile.trim(),
          customerEmail: draft.customer.email?.trim() || null,
          city: draft.delivery.city.trim(),
          address: draft.delivery.address.trim(),
          notes: draft.notes?.trim() || null,
          subtotal: totals.subtotal,
          shipping: totals.shipping,
          discount: totals.couponDiscount,
          couponCode: totals.couponError ? null : (draft.couponCode ?? null),
          total: totals.total,
          paymentMethod: draft.paymentMethod,
          paymentStatus,
          manualMethodId: isManual ? draft.manualPayment?.methodId ?? null : null,
          manualMethodName: isManual ? draft.manualPayment?.methodName ?? null : null,
          transactionId: isManual ? draft.manualPayment?.transactionId.trim() ?? null : null,
          senderMobile: isManual ? draft.manualPayment?.senderMobile.trim() ?? null : null,
          screenshot: isManual ? draft.manualPayment?.screenshot ?? null : null,
          fulfillmentStatus: "placed",
          estimatedFrom: new Date(est.from),
          estimatedTo: new Date(est.to),
          items: { create: orderItemsData },
          timeline: {
            create: [
              {
                kind: placedEvt.kind,
                status: placedEvt.status,
                title: placedEvt.title,
                note: placedEvt.note ?? null,
                simulated: false,
                at: now,
              },
              {
                kind: payEvt.kind,
                status: payEvt.status,
                title: payEvt.title,
                note: payEvt.note ?? null,
                simulated: false,
                at: now,
              },
            ],
          },
        },
        include: { items: true, timeline: true },
      });
    });

    return NextResponse.json({ order: mapOrder(created) }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not place order.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}


import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  fulfillmentEvent,
  nextFulfillmentStatus,
  paymentEvent,
} from "@/lib/orderUtils";
import { mapOrder } from "@/lib/server/mappers";
import { ensureSeeded } from "@/lib/server/seed";
import type { FulfillmentStatus, PaymentStatus } from "@/lib/types";
import { FULFILLMENT_LABELS } from "@/lib/utils";

const REQUIRES_VERIFIED_PAYMENT: FulfillmentStatus[] = [
  "confirmed",
  "processing",
  "shipped",
  "out_for_delivery",
  "delivered",
];

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  await ensureSeeded();
  const { id } = await params;
  const row = await prisma.order.findFirst({
    where: { id: id.trim().toUpperCase() },
    include: { items: true, timeline: true },
  });
  if (!row) return NextResponse.json({ error: "Order not found." }, { status: 404 });
  return NextResponse.json({ order: mapOrder(row) });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await ensureSeeded();
  const { id } = await params;
  const body = (await req.json()) as {
    action: "fulfillment" | "payment" | "simulate";
    status?: string;
    note?: string;
  };

  const order = await prisma.order.findFirst({
    where: { id: id.trim().toUpperCase() },
    include: { items: true, timeline: true },
  });
  if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });

  if (body.action !== "simulate") {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Admin access required." }, { status: 403 });
    }
  }

  const now = new Date();
  const nowIso = now.toISOString();

  if (body.action === "payment") {
    const status = body.status as PaymentStatus;
    if (order.paymentStatus === status) return NextResponse.json({ order: mapOrder(order) });
    const pEvt = paymentEvent(status, nowIso, body.note);
    const eventsToCreate = [
      {
        kind: pEvt.kind,
        status: pEvt.status,
        title: pEvt.title,
        note: pEvt.note ?? null,
        simulated: false,
        at: now,
      },
    ];
    let nextFulfillment = order.fulfillmentStatus;
    if (status === "verified" && order.fulfillmentStatus === "placed") {
      nextFulfillment = "confirmed";
      const fEvt = fulfillmentEvent(
        "confirmed",
        nowIso,
        "Payment verified — your order is confirmed.",
      );
      eventsToCreate.push({
        kind: fEvt.kind,
        status: fEvt.status,
        title: fEvt.title,
        note: fEvt.note ?? null,
        simulated: false,
        at: now,
      });
    }
    const updated = await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: status,
        fulfillmentStatus: nextFulfillment,
        timeline: { create: eventsToCreate },
      },
      include: { items: true, timeline: true },
    });
    return NextResponse.json({ order: mapOrder(updated) });
  }

  // Fulfillment or Simulate
  let targetStatus: FulfillmentStatus;
  let simulated = false;
  let note = body.note;

  if (body.action === "simulate") {
    const next = nextFulfillmentStatus(order.fulfillmentStatus as FulfillmentStatus);
    if (!next) {
      return NextResponse.json({ error: "No further steps to simulate." }, { status: 400 });
    }
    targetStatus = next;
    simulated = true;
    note = `${FULFILLMENT_LABELS[next]} — simulated demo update (not real courier data).`;
  } else {
    targetStatus = body.status as FulfillmentStatus;
  }

  if (order.fulfillmentStatus === targetStatus) {
    return NextResponse.json({ order: mapOrder(order) });
  }
  if (order.fulfillmentStatus === "delivered") {
    return NextResponse.json({ error: "This order has already been delivered." }, { status: 400 });
  }
  if (order.fulfillmentStatus === "cancelled") {
    return NextResponse.json(
      { error: "This order has been cancelled and can no longer be updated." },
      { status: 400 },
    );
  }
  if (
    order.paymentMethod === "manual" &&
    order.paymentStatus !== "verified" &&
    REQUIRES_VERIFIED_PAYMENT.includes(targetStatus)
  ) {
    return NextResponse.json(
      { error: "Verify the payment first — manual-payment orders are only processed after verification." },
      { status: 400 },
    );
  }

  const fEvt = fulfillmentEvent(targetStatus, nowIso, note, simulated);
  const eventsToCreate = [
    {
      kind: fEvt.kind,
      status: fEvt.status,
      title: fEvt.title,
      note: fEvt.note ?? null,
      simulated,
      at: now,
    },
  ];
  let nextPayStatus = order.paymentStatus;
  if (targetStatus === "delivered" && order.paymentMethod === "cod") {
    nextPayStatus = "cod_collected";
    const pEvt = paymentEvent("cod_collected", nowIso);
    eventsToCreate.push({
      kind: pEvt.kind,
      status: pEvt.status,
      title: pEvt.title,
      note: pEvt.note ?? null,
      simulated: false,
      at: now,
    });
  }

  const updated = await prisma.$transaction(async (tx) => {
    if (targetStatus === "cancelled") {
      for (const item of order.items) {
        await tx.product
          .update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          })
          .catch(() => null);
      }
    }
    return tx.order.update({
      where: { id: order.id },
      data: {
        fulfillmentStatus: targetStatus,
        paymentStatus: nextPayStatus,
        timeline: { create: eventsToCreate },
      },
      include: { items: true, timeline: true },
    });
  });

  return NextResponse.json({ order: mapOrder(updated) });
}


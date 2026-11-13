import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { resetCatalogAndOrders } from "@/lib/server/seed";

export async function POST() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }
  await resetCatalogAndOrders();
  return NextResponse.json({ ok: true });
}


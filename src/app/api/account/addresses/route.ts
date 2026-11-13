import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { mapAddress } from "@/lib/server/mappers";
import type { SavedAddress } from "@/lib/types";

export async function PUT(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { addresses } = (await req.json()) as { addresses: SavedAddress[] };
  await prisma.$transaction(async (tx) => {
    await tx.address.deleteMany({ where: { userId: session.userId } });
    for (const a of addresses) {
      await tx.address.create({
        data: {
          userId: session.userId,
          label: a.label,
          fullName: a.fullName,
          mobile: a.mobile,
          city: a.city,
          address: a.address,
          isDefault: a.isDefault,
        },
      });
    }
  });
  const saved = await prisma.address.findMany({ where: { userId: session.userId } });
  return NextResponse.json({ addresses: saved.map(mapAddress) });
}


import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { mapCategory } from "@/lib/server/mappers";
import { ensureSeeded } from "@/lib/server/seed";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await ensureSeeded();
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }
  const { id } = await params;
  const body = (await req.json()) as { name?: string; description?: string; image?: string };
  const existing = await prisma.category.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Category not found." }, { status: 404 });

  const updated = await prisma.category.update({
    where: { id },
    data: {
      name: body.name?.trim() || existing.name,
      description: body.description?.trim() ?? existing.description,
      image: body.image?.trim() ?? existing.image,
    },
  });
  return NextResponse.json({ category: mapCategory(updated) });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  await ensureSeeded();
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }
  const { id } = await params;
  await prisma.category.delete({ where: { id } }).catch(() => null);
  return NextResponse.json({ ok: true });
}


import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { mapProduct } from "@/lib/server/mappers";
import { ensureSeeded } from "@/lib/server/seed";
import type { ProductInput } from "@/lib/types";
import { slugify } from "@/lib/utils";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  await ensureSeeded();
  const { id } = await params;
  const row = await prisma.product.findFirst({
    where: { OR: [{ id }, { slug: id }] },
  });
  if (!row) return NextResponse.json({ error: "Product not found." }, { status: 404 });
  return NextResponse.json({ product: mapProduct(row) });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await ensureSeeded();
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }
  const { id } = await params;
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Product not found." }, { status: 404 });

  const input = (await req.json()) as ProductInput;
  const root = slugify(input.slug || input.name) || existing.slug;
  let slug = root;
  let n = 2;
  while (true) {
    const clash = await prisma.product.findUnique({ where: { slug } });
    if (!clash || clash.id === id) break;
    slug = `${root}-${n++}`;
  }

  const updated = await prisma.product.update({
    where: { id },
    data: {
      slug,
      sku: input.sku?.trim() || existing.sku,
      name: input.name?.trim() || existing.name,
      category: input.category || existing.category,
      shortDescription: input.shortDescription?.trim() || existing.shortDescription,
      description: input.description?.trim() || existing.description,
      price: Math.round(input.price),
      originalPrice: input.originalPrice ? Math.round(input.originalPrice) : null,
      imagesJson: JSON.stringify(input.images ?? []),
      colorsJson: JSON.stringify(input.colors ?? []),
      sizesJson: JSON.stringify(input.sizes ?? []),
      stock: Math.max(0, Math.floor(input.stock ?? 0)),
      tagsJson: JSON.stringify(input.tags ?? []),
      specsJson: JSON.stringify(input.specifications ?? []),
    },
  });
  return NextResponse.json({ product: mapProduct(updated) });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  await ensureSeeded();
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }
  const { id } = await params;
  await prisma.product.delete({ where: { id } }).catch(() => null);
  return NextResponse.json({ ok: true });
}


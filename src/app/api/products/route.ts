import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { mapProduct } from "@/lib/server/mappers";
import { ensureSeeded } from "@/lib/server/seed";
import type { ProductInput } from "@/lib/types";
import { slugify } from "@/lib/utils";

async function uniqueProductSlug(base: string, ignoreId?: string): Promise<string> {
  const root = slugify(base) || "product";
  let candidate = root;
  let n = 2;
  while (true) {
    const existing = await prisma.product.findUnique({ where: { slug: candidate } });
    if (!existing || existing.id === ignoreId) return candidate;
    candidate = `${root}-${n++}`;
  }
}

export async function GET() {
  await ensureSeeded();
  try {
    const rows = await prisma.product.findMany({ orderBy: { createdAt: "desc" } });
    if (rows.length > 0) {
      return NextResponse.json({ products: rows.map(mapProduct) });
    }
  } catch (err) {
    console.warn("[Products] DB read fallback:", err);
  }
  const { seedProducts } = await import("@/lib/data/products");
  return NextResponse.json({ products: seedProducts });
}

export async function POST(req: Request) {
  await ensureSeeded();
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const input = (await req.json()) as ProductInput;
  if (!input.name?.trim() || !Number.isFinite(input.price) || input.price <= 0) {
    return NextResponse.json({ error: "Valid product name and price are required." }, { status: 400 });
  }

  const slug = await uniqueProductSlug(input.slug || input.name);
  const created = await prisma.product.create({
    data: {
      slug,
      sku: input.sku?.trim() || "TL-ITEM",
      name: input.name.trim(),
      category: input.category,
      shortDescription: input.shortDescription?.trim() || input.name.trim(),
      description: input.description?.trim() || input.name.trim(),
      price: Math.round(input.price),
      originalPrice: input.originalPrice ? Math.round(input.originalPrice) : null,
      imagesJson: JSON.stringify(input.images ?? []),
      colorsJson: JSON.stringify(input.colors ?? []),
      sizesJson: JSON.stringify(input.sizes ?? []),
      stock: Math.max(0, Math.floor(input.stock ?? 0)),
      rating: input.rating ?? 4.7,
      reviewCount: input.reviewCount ?? 1,
      tagsJson: JSON.stringify(input.tags ?? ["new"]),
      specsJson: JSON.stringify(input.specifications ?? []),
    },
  });

  return NextResponse.json({ product: mapProduct(created) }, { status: 201 });
}


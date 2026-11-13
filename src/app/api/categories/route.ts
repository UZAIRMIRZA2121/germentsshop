import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { mapCategory } from "@/lib/server/mappers";
import { ensureSeeded } from "@/lib/server/seed";
import { slugify } from "@/lib/utils";

export async function GET() {
  await ensureSeeded();
  const rows = await prisma.category.findMany();
  return NextResponse.json({ categories: rows.map(mapCategory) });
}

export async function POST(req: Request) {
  await ensureSeeded();
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }
  const body = (await req.json()) as { name?: string; description?: string; image?: string; slug?: string };
  const slug = slugify(body.slug || body.name || "");
  if (!slug || !body.name?.trim()) {
    return NextResponse.json({ error: "Category name is required." }, { status: 400 });
  }
  const exists = await prisma.category.findUnique({ where: { slug } });
  if (exists) {
    return NextResponse.json({ error: "A category with this name already exists." }, { status: 409 });
  }
  const created = await prisma.category.create({
    data: {
      slug,
      name: body.name.trim(),
      description: body.description?.trim() ?? "",
      image: body.image?.trim() ?? "",
    },
  });
  return NextResponse.json({ category: mapCategory(created) }, { status: 201 });
}


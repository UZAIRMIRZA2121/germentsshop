import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { mapReview } from "@/lib/server/mappers";
import { ensureSeeded } from "@/lib/server/seed";

export async function GET(req: Request) {
  await ensureSeeded();
  const slug = new URL(req.url).searchParams.get("slug");
  if (!slug) return NextResponse.json({ reviews: [] });
  const rows = await prisma.review.findMany({
    where: { productSlug: slug },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ reviews: rows.map(mapReview) });
}

export async function POST(req: Request) {
  await ensureSeeded();
  const body = (await req.json()) as {
    slug?: string;
    author?: string;
    rating?: number;
    title?: string;
    comment?: string;
  };
  if (!body.slug || !body.author?.trim() || !body.comment?.trim() || !body.rating) {
    return NextResponse.json({ error: "Missing review fields." }, { status: 400 });
  }
  const created = await prisma.review.create({
    data: {
      productSlug: body.slug,
      author: body.author.trim(),
      rating: Math.min(5, Math.max(1, Math.round(body.rating))),
      title: body.title?.trim() || "Customer review",
      comment: body.comment.trim(),
      verified: false,
    },
  });
  return NextResponse.json({ review: mapReview(created) }, { status: 201 });
}


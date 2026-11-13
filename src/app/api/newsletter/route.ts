import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  const { email } = (await req.json()) as { email?: string };
  const normalized = email?.trim().toLowerCase();
  if (!normalized || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(normalized)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }
  const existing = await prisma.newsletterSubscriber.findUnique({ where: { email: normalized } });
  if (existing) return NextResponse.json({ alreadySubscribed: true });
  await prisma.newsletterSubscriber.create({ data: { email: normalized } });
  return NextResponse.json({ alreadySubscribed: false }, { status: 201 });
}


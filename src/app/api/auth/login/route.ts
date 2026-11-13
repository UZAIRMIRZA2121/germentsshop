import { NextResponse } from "next/server";
import { setSessionCookie, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ensureSeeded } from "@/lib/server/seed";

export async function POST(req: Request) {
  await ensureSeeded();
  const { email, password } = (await req.json()) as { email?: string; password?: string };
  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
  });
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  await setSessionCookie({
    userId: user.id,
    role: user.role as "customer" | "admin",
    email: user.email,
    fullName: user.fullName,
  });

  return NextResponse.json({
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      mobile: user.mobile,
      role: user.role,
      joinedAt: user.createdAt.toISOString(),
    },
  });
}


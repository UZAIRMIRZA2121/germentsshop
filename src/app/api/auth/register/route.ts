import { NextResponse } from "next/server";
import { hashPassword, setSessionCookie } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ensureSeeded } from "@/lib/server/seed";

export async function POST(req: Request) {
  await ensureSeeded();
  const { fullName, mobile, email, password } = (await req.json()) as {
    fullName?: string;
    mobile?: string;
    email?: string;
    password?: string;
  };

  if (!fullName?.trim() || !mobile?.trim() || !email?.trim() || !password || password.length < 6) {
    return NextResponse.json(
      { error: "Full name, mobile, email, and a password of at least 6 characters are required." },
      { status: 400 },
    );
  }

  const normalizedEmail = email.trim().toLowerCase();

  try {
    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }

    const user = await prisma.user.create({
      data: {
        fullName: fullName.trim(),
        mobile: mobile.trim(),
        email: normalizedEmail,
        passwordHash: hashPassword(password),
        role: "customer",
      },
    });

    await setSessionCookie({
      userId: user.id,
      role: "customer",
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
  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create account. Please try again." },
      { status: 500 },
    );
  }
}

import { NextResponse } from "next/server";
import { getSession, setSessionCookie } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { mapAddress } from "@/lib/server/mappers";
import { ensureSeeded } from "@/lib/server/seed";

export async function GET() {
  await ensureSeeded();
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ user: null, addresses: [] });
  }
  let user = null;
  try {
    user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: { addresses: true },
    });
  } catch (err) {
    console.warn("[Session] DB read warning:", err);
  }

  if (!user) {
    return NextResponse.json({
      user: {
        id: session.userId,
        fullName: session.fullName,
        email: session.email,
        mobile: "0321 9669289",
        role: session.role,
        gender: "",
        birthday: "",
        joinedAt: new Date().toISOString(),
      },
      addresses: [],
    });
  }
  return NextResponse.json({
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      mobile: user.mobile,
      role: user.role,
      gender: user.gender ?? "",
      birthday: user.birthday ?? "",
      joinedAt: user.createdAt.toISOString(),
    },
    addresses: user.addresses.map(mapAddress),
  });
}

export async function PATCH(req: Request) {
  await ensureSeeded();
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  }
  const body = (await req.json()) as {
    fullName?: string;
    mobile?: string;
    email?: string;
    gender?: string;
    birthday?: string;
  };
  const updated = await prisma.user.update({
    where: { id: session.userId },
    data: {
      fullName: body.fullName?.trim() || undefined,
      mobile: body.mobile?.trim() || undefined,
      email: body.email?.trim().toLowerCase() || undefined,
      gender: body.gender ?? undefined,
      birthday: body.birthday ?? undefined,
    },
  });
  await setSessionCookie({
    userId: updated.id,
    role: updated.role as "customer" | "admin",
    email: updated.email,
    fullName: updated.fullName,
  });
  return NextResponse.json({
    user: {
      id: updated.id,
      fullName: updated.fullName,
      email: updated.email,
      mobile: updated.mobile,
      role: updated.role,
      gender: updated.gender ?? "",
      birthday: updated.birthday ?? "",
      joinedAt: updated.createdAt.toISOString(),
    },
  });
}


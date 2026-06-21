import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/server/auth-security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const session = getSession(request);
  if (!session) return NextResponse.json({ user: null }, { status: 401 });

  return NextResponse.json({
    user: { id: session.userId, email: session.email, name: session.name, role: session.role },
  });
}

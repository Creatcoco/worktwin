import { NextRequest, NextResponse } from "next/server";
import { clearSession, getSession } from "@/lib/server/auth-security";
import { findUserByEmail } from "@/lib/server/feishu-users";
import { checkRateLimit, RATE_LIMIT_WINDOW_SECONDS, resolveRateLimitKey } from "@/lib/server/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  // 单人频控：1 分钟 1 次（已登录用 userId，匿名用 IP）
  const session = getSession(request);
  const { key } = resolveRateLimitKey(request, session);
  const limit = checkRateLimit(`me:${key}`);
  if (!limit.allowed) {
    return NextResponse.json(
      { user: null, message: `请求过于频繁，请 ${limit.retryAfterSeconds} 秒后再试` },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds || RATE_LIMIT_WINDOW_SECONDS) } }
    );
  }

  try {
    if (!session) return NextResponse.json({ user: null }, { status: 401 });

    const user = await findUserByEmail(session.email);
    if (!user || user.status !== "active" || user.userId !== session.userId) {
      const response = NextResponse.json({ user: null }, { status: 401 });
      clearSession(response);
      return response;
    }

    return NextResponse.json({
      user: { id: user.userId, email: user.email, name: user.name, role: user.role },
    });
  } catch {
    return NextResponse.json({ user: null, message: "用户服务暂不可用" }, { status: 503 });
  }
}

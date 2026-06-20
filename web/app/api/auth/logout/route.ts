import { NextRequest, NextResponse } from "next/server";
import { clearSession, getSession } from "@/lib/server/auth-security";
import { findUserByEmail, updateLastLogout } from "@/lib/server/feishu-users";
import { checkRateLimit, RATE_LIMIT_WINDOW_SECONDS, resolveRateLimitKey } from "@/lib/server/rate-limit";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  // 单人频控：1 分钟 1 次（已登录用 userId，匿名用 IP）
  const session = getSession(request);
  const { key } = resolveRateLimitKey(request, session);
  const limit = checkRateLimit(`logout:${key}`);
  if (!limit.allowed) {
    return NextResponse.json(
      { ok: false, message: `请求过于频繁，请 ${limit.retryAfterSeconds} 秒后再试` },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds || RATE_LIMIT_WINDOW_SECONDS) } }
    );
  }

  // 退出前尽力把「最近退出时间」回写到飞书用户表。
  // 退出是用户权利，飞书不可用不能阻断退出：任何异常都静默吞掉，cookie 照清。
  if (session) {
    try {
      const user = await findUserByEmail(session.email);
      if (user) await updateLastLogout(user.recordId);
    } catch {
      // 飞书降级时忽略，保证退出本身一定成功
    }
  }

  const response = NextResponse.json({ ok: true });
  clearSession(response);
  return response;
}

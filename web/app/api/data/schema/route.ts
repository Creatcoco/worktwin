import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/server/auth-security";
import { PRODUCT_TABLES } from "@/lib/server/feishu-product-schema";
import { checkRateLimit, RATE_LIMIT_WINDOW_SECONDS, resolveRateLimitKey } from "@/lib/server/rate-limit";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  // 单人频控：1 分钟 1 次（已登录用 userId，匿名用 IP）
  const session = getSession(request);
  const { key } = resolveRateLimitKey(request, session);
  const limit = checkRateLimit(`data:schema:${key}`);
  if (!limit.allowed) {
    return NextResponse.json(
      { message: `请求过于频繁，请 ${limit.retryAfterSeconds} 秒后再试` },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds || RATE_LIMIT_WINDOW_SECONDS) } }
    );
  }

  return NextResponse.json({ tables: Object.values(PRODUCT_TABLES) });
}

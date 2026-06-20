import { NextRequest, NextResponse } from "next/server";
import { checkFeishuUserTable, USER_FIELDS } from "@/lib/server/feishu-users";
import { checkRateLimit, RATE_LIMIT_WINDOW_SECONDS, resolveRateLimitKey } from "@/lib/server/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  // 单人频控：1 分钟 1 次（匿名用 IP）
  const { key } = resolveRateLimitKey(request);
  const limit = checkRateLimit(`health:${key}`);
  if (!limit.allowed) {
    return NextResponse.json(
      { ok: false, message: `请求过于频繁，请 ${limit.retryAfterSeconds} 秒后再试` },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds || RATE_LIMIT_WINDOW_SECONDS) } }
    );
  }

  try {
    await checkFeishuUserTable();
    return NextResponse.json({ ok: true, requiredFields: Object.values(USER_FIELDS) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "飞书用户表不可用";
    return NextResponse.json({ ok: false, message }, { status: 503 });
  }
}

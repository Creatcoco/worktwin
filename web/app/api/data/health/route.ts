import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/server/auth-security";
import { checkProductDataTables } from "@/lib/server/feishu-product-health";
import { checkRateLimit, RATE_LIMIT_WINDOW_SECONDS, resolveRateLimitKey } from "@/lib/server/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  // 单人频控：1 分钟 1 次（已登录用 userId，匿名用 IP）
  const session = getSession(request);
  const { key } = resolveRateLimitKey(request, session);
  const limit = checkRateLimit(`data:health:${key}`);
  if (!limit.allowed) {
    return NextResponse.json(
      { ok: false, message: `请求过于频繁，请 ${limit.retryAfterSeconds} 秒后再试` },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds || RATE_LIMIT_WINDOW_SECONDS) } }
    );
  }

  try {
    const tables = await checkProductDataTables();
    const ready = tables.filter((table) => table.status === "ready").length;
    return NextResponse.json({
      ok: ready === tables.length,
      summary: { ready, total: tables.length },
      tables,
    }, { status: ready === tables.length ? 200 : 503 });
  } catch (error) {
    return NextResponse.json({
      ok: false,
      message: error instanceof Error ? error.message : "飞书产品数据层不可用",
    }, { status: 503 });
  }
}

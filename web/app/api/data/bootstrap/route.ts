import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/server/auth-security";
import {
  getUserWallet,
  listDigitalEmployees,
  listUserContracts,
  listUserIntegrationDrafts,
  listUserSettlements,
  listUserTasks,
} from "@/lib/server/feishu-product-read";
import { checkRateLimit, RATE_LIMIT_WINDOW_SECONDS, resolveRateLimitKey } from "@/lib/server/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  // 单人频控：1 分钟 1 次（已登录用 userId，匿名用 IP）
  const session = getSession(request);
  const { key } = resolveRateLimitKey(request, session);
  const limit = checkRateLimit(`data:bootstrap:${key}`);
  if (!limit.allowed) {
    return NextResponse.json(
      { message: `请求过于频繁，请 ${limit.retryAfterSeconds} 秒后再试` },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds || RATE_LIMIT_WINDOW_SECONDS) } }
    );
  }

  try {
    const employees = await listDigitalEmployees();
    if (!session) return NextResponse.json({ employees });

    const [user, contracts, tasks, settlements, drafts] = await Promise.all([
      getUserWallet({ id: session.userId, name: session.name, email: session.email }),
      listUserContracts(session.userId),
      listUserTasks(session.userId),
      listUserSettlements(session.userId),
      listUserIntegrationDrafts(session.userId),
    ]);
    return NextResponse.json({ employees, user, contracts, tasks, settlements, drafts });
  } catch (error) {
    return NextResponse.json({
      message: error instanceof Error ? error.message : "飞书产品数据读取失败",
    }, { status: 503 });
  }
}

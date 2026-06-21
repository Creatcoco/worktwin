import { NextRequest, NextResponse } from "next/server";
import { clearSession, getSession } from "@/lib/server/auth-security";
import { findUserByEmail, updateLastLogout } from "@/lib/server/feishu-users";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const session = getSession(request);
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

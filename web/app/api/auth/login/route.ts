import { NextRequest, NextResponse } from "next/server";
import { isValidEmail, isValidPassword, normalizeEmail, setSession, verifyPassword } from "@/lib/server/auth-security";
import { verifyCaptcha } from "@/lib/server/captcha-store";
import { findUserByEmail, updateLastLogin } from "@/lib/server/feishu-users";
import { checkRateLimit, RATE_LIMIT_WINDOW_SECONDS, resolveRateLimitKey } from "@/lib/server/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ message: "请求格式不正确" }, { status: 400 });
  }

  const email = normalizeEmail(body.email);
  const password = body.password;
  if (!isValidEmail(email) || !isValidPassword(password)) {
    return NextResponse.json({ message: "邮箱或密码不正确" }, { status: 401 });
  }

  // 验证码已承担机器人拦截；保留合理的分钟级尝试上限，避免误伤正常重试。
  const { key } = resolveRateLimitKey(request);
  const limit = checkRateLimit(`login:${key}`, 10);
  if (!limit.allowed) {
    return NextResponse.json(
      { message: `请求过于频繁，请 ${limit.retryAfterSeconds} 秒后再试` },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds || RATE_LIMIT_WINDOW_SECONDS) } }
    );
  }

  // 滑块验证码校验（防暴力破解）
  const captchaToken = typeof body.captchaToken === "string" ? body.captchaToken : "";
  const captchaX = Number(body.captchaX);
  if (!captchaToken || !verifyCaptcha(captchaToken, captchaX)) {
    return NextResponse.json({ message: "请完成滑块验证", captchaInvalid: true }, { status: 400 });
  }

  try {
    const user = await findUserByEmail(email);
    const valid = user && (await verifyPassword(password, user.passwordSalt, user.passwordHash));
    if (!user || !valid || user.status !== "active") {
      return NextResponse.json({ message: "邮箱或密码不正确" }, { status: 401 });
    }

    await updateLastLogin(user);
    const response = NextResponse.json({
      user: { id: user.userId, email: user.email, name: user.name, role: user.role },
    });
    setSession(response, { userId: user.userId, email: user.email, name: user.name, role: user.role });
    return response;
  } catch (error) {
    return authServiceError(error);
  }
}

function authServiceError(error: unknown) {
  const message = error instanceof Error ? error.message : "";
  if (message.includes("缺少") || message.includes("配置")) {
    return NextResponse.json({ message }, { status: 503 });
  }
  return NextResponse.json({ message: "飞书用户服务暂不可用，请稍后重试" }, { status: 502 });
}

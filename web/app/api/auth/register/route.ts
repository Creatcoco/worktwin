import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import {
  hashPassword,
  isValidEmail,
  isValidPassword,
  normalizeEmail,
  setSession,
} from "@/lib/server/auth-security";
import { createUser, findUserByEmail } from "@/lib/server/feishu-users";
import { saveWallet } from "@/lib/server/feishu-product-repository";
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
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const password = body.password;
  if (!isValidEmail(email) || name.length < 2 || name.length > 50 || !isValidPassword(password)) {
    return NextResponse.json(
      { message: "请填写有效邮箱、2-50 字符姓名和 8-128 字符密码" },
      { status: 400 }
    );
  }

  // 单人频控：1 分钟 1 次（匿名用 IP）
  const { key } = resolveRateLimitKey(request);
  const limit = checkRateLimit(`register:${key}`);
  if (!limit.allowed) {
    return NextResponse.json(
      { message: `请求过于频繁，请 ${limit.retryAfterSeconds} 秒后再试` },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds || RATE_LIMIT_WINDOW_SECONDS) } }
    );
  }

  try {
    if (await findUserByEmail(email)) {
      return NextResponse.json({ message: "该邮箱已注册" }, { status: 409 });
    }

    const credentials = await hashPassword(password);
    const user = await createUser({
      userId: `usr_${randomUUID().replaceAll("-", "")}`,
      email,
      name,
      passwordHash: credentials.hash,
      passwordSalt: credentials.salt,
    });
    await saveWallet({
      id: user.userId,
      email: user.email,
      name: user.name,
      avatar: "👤",
      apiKey: "",
      balanceCNY: 1000,
      balanceUT: 50,
      createdAt: Math.floor(user.createdAt / 1000),
    });
    const response = NextResponse.json(
      { user: { id: user.userId, email: user.email, name: user.name, role: user.role } },
      { status: 201 }
    );
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

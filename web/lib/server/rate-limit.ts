import "server-only";

import type { NextRequest } from "next/server";
import type { SessionClaims } from "./auth-security";

type Bucket = { count: number; resetAt: number };

const WINDOW_MS = 60_000; // 1 分钟窗口
const LIMIT = 1; // 每窗口每人 1 次

const globalBuckets = globalThis as typeof globalThis & {
  __worktwinRateBuckets?: Map<string, Bucket>;
};

const buckets = globalBuckets.__worktwinRateBuckets ?? new Map<string, Bucket>();
globalBuckets.__worktwinRateBuckets = buckets;

// 定期清理过期桶，避免内存无限增长（每次检查顺手清理少量）
const MAX_BUCKETS = 10_000;

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds: number;
}

/**
 * 判断单个标识在窗口内是否仍可调用。
 * 返回 allowed=false 时携带 retryAfterSeconds（距窗口重置的秒数）。
 */
export function checkRateLimit(key: string, limit = LIMIT, windowMs = WINDOW_MS): RateLimitResult {
  const now = Date.now();
  const current = buckets.get(key);

  if (!current || current.resetAt <= now) {
    // 桶不存在或已过期：开新桶
    if (buckets.size > MAX_BUCKETS) buckets.clear();
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (current.count >= limit) {
    return { allowed: false, retryAfterSeconds: Math.ceil((current.resetAt - now) / 1000) };
  }

  current.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}

/**
 * 从请求里推导频控标识：已登录用 userId（真实身份），未登录回退到客户端 IP。
 * userId 比 IP 更精确，避免同 IP 多用户互相误伤。
 */
export function resolveRateLimitKey(
  request: NextRequest,
  session?: SessionClaims | null
): { key: string; identity: string } {
  if (session?.userId) return { key: `u:${session.userId}`, identity: session.userId };
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwarded || request.headers.get("x-real-ip")?.trim() || "local";
  return { key: `ip:${ip}`, identity: ip };
}

export const RATE_LIMIT_WINDOW_SECONDS = Math.round(WINDOW_MS / 1000);

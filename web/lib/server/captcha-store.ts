import "server-only";

import { randomUUID } from "node:crypto";

/**
 * 滑动拼图验证码的服务端答案存储 + 校验。
 *
 * 安全要点：
 * - 答案只存服务端内存，前端拿不到真实缺口位置
 * - token 一次性：验证后立即删除，防重放
 * - 5 分钟过期，定期清理防爆内存
 */

const TOLERANCE_PX = 6; // 允许误差 ±6px
const TTL_MS = 5 * 60_000; // 5 分钟有效
const MAX_ENTRIES = 5_000;

type Entry = { answerX: number; expiresAt: number };

const globalStore = globalThis as typeof globalThis & {
  __worktwinCaptchaStore?: Map<string, Entry>;
};

const store = globalStore.__worktwinCaptchaStore ?? new Map<string, Entry>();
globalStore.__worktwinCaptchaStore = store;

function gc() {
  const now = Date.now();
  for (const [token, entry] of store) {
    if (entry.expiresAt <= now) store.delete(token);
  }
}

/** 生成新拼图：返回一次性 token（前端拿 token 去取图，答案留服务端） */
export function issueCaptcha(answerX: number): string {
  if (store.size > MAX_ENTRIES) gc();
  const token = randomUUID().replaceAll("-", "");
  store.set(token, { answerX, expiresAt: Date.now() + TTL_MS });
  return token;
}

/**
 * 校验用户拖动结果。一次性：无论成功失败，校验后 token 立即作废。
 * 返回 true 表示位置在容差内且 token 有效。
 */
export function verifyCaptcha(token: string, clientX: number): boolean {
  const entry = store.get(token);
  // 取出即删，防重放
  store.delete(token);
  if (!entry) return false;
  if (Date.now() > entry.expiresAt) return false;
  if (typeof clientX !== "number" || Number.isNaN(clientX)) return false;
  return Math.abs(clientX - entry.answerX) <= TOLERANCE_PX;
}

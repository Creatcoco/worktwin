"use client";

/**
 * 客户端请求节流工具，配合服务端「1 分钟 1 次」频控使用。
 *
 * 服务端频控严格到每接口每分钟 1 次后，前端若在 React 严格模式双调用、
 * 路由切换、多组件挂载等场景重复请求，会频繁撞 429。本工具做两件事：
 * 1. in-flight 去重：同一接口的并发请求合并为一次实际 fetch
 * 2. 冷却窗口：成功调用后，窗口内复用上次结果，不再发请求
 *
 * 对 429 响应：不抛错，视为「复用上次结果」并返回 undefined，
 * 让调用方优雅降级而非报错。
 */

type CacheEntry<T> = { value: T | undefined; fetchedAt: number };

const inflight = new Map<string, Promise<unknown>>();
const cache = new Map<string, CacheEntry<unknown>>();

const DEFAULT_COOLDOWN_MS = 65_000; // 略大于服务端 60s 窗口，留余量

/**
 * 发起一个被节流的 GET 请求。
 * - 冷却窗口内：直接返回上次结果，不发请求
 * - 并发调用：合并为同一次 fetch
 * - 收到 429：静默返回 undefined（降级），不报错
 */
export async function throttledGet<T>(
  url: string,
  options: { cooldownMs?: number; enabled?: boolean } = {}
): Promise<T | undefined> {
  const { cooldownMs = DEFAULT_COOLDOWN_MS, enabled = true } = options;

  // 冷却窗口内复用上次结果
  if (enabled) {
    const cached = cache.get(url) as CacheEntry<T> | undefined;
    if (cached && Date.now() - cached.fetchedAt < cooldownMs) {
      return cached.value;
    }
  }

  // in-flight 去重：已有相同请求在飞，复用
  const existing = inflight.get(url) as Promise<T | undefined> | undefined;
  if (existing) return existing;

  const request = (async (): Promise<T | undefined> => {
    try {
      const response = await fetch(url, { cache: "no-store" });
      if (response.status === 429) {
        // 频控命中：不报错，复用上次缓存（若有），否则返回 undefined
        const prev = cache.get(url) as CacheEntry<T> | undefined;
        return prev?.value;
      }
      const payload = (await response.json()) as T;
      if (response.ok) {
        cache.set(url, { value: payload, fetchedAt: Date.now() });
      }
      return response.ok ? payload : undefined;
    } catch {
      const prev = cache.get(url) as CacheEntry<T> | undefined;
      return prev?.value;
    } finally {
      inflight.delete(url);
    }
  })();

  inflight.set(url, request);
  return request;
}

/**
 * 标记某个 URL 的缓存失效，下次调用会强制刷新。
 * 用于写操作（如登录、退出、数据变更）后让后续读取拿新数据。
 */
export function invalidate(url: string): void {
  cache.delete(url);
}

/**
 * 强制下次调用绕过冷却窗口立即发请求（但仍受 in-flight 去重保护）。
 * 用于用户主动点击「刷新」等需要新数据的场景。
 */
export function forceNext(url: string): void {
  cache.delete(url);
}

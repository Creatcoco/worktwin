import "server-only";

type Attempt = { count: number; resetAt: number };

const globalAttempts = globalThis as typeof globalThis & {
  __worktwinAuthAttempts?: Map<string, Attempt>;
};

const attempts = globalAttempts.__worktwinAuthAttempts ?? new Map<string, Attempt>();
globalAttempts.__worktwinAuthAttempts = attempts;

export function consumeAuthAttempt(key: string, limit = 8, windowMs = 15 * 60 * 1000): boolean {
  const now = Date.now();
  const current = attempts.get(key);
  if (!current || current.resetAt <= now) {
    attempts.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (current.count >= limit) return false;
  current.count += 1;
  return true;
}

export function clearAuthAttempts(key: string): void {
  attempts.delete(key);
}

"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

const protectedPrefixes = [
  "/dashboard",
  "/developer",
  "/dispatch",
  "/integrate",
  "/settlement",
  "/studio",
];

export default function RouteGuard({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();
  const protectedRoute = protectedPrefixes.some((prefix) => pathname.startsWith(prefix));

  useEffect(() => {
    if (!loading && protectedRoute && !user) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [loading, pathname, protectedRoute, router, user]);

  if (protectedRoute && (loading || !user)) {
    return (
      <div className="min-h-[55vh] flex items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-[var(--color-fg-muted)]">
          <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] animate-pulse-glow" />
          正在验证登录状态...
        </div>
      </div>
    );
  }

  return children;
}

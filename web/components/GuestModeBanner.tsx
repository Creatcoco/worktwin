"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";

const hiddenRoutes = new Set(["/", "/login", "/register"]);

export default function GuestModeBanner() {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const { lang } = useI18n();

  if (loading || user || hiddenRoutes.has(pathname)) return null;

  const next = encodeURIComponent(pathname);

  return (
    <aside className="border-b border-[var(--color-border)] bg-[rgba(124,92,255,0.08)]">
      <div className="max-w-7xl mx-auto px-6 py-2.5 flex items-center justify-between gap-4 flex-wrap">
        <p className="text-xs text-[var(--color-fg-muted)]">
          <span className="font-semibold text-[var(--color-primary-soft)]">
            {lang === "zh" ? "游客预览" : "Guest preview"}
          </span>
          <span className="mx-2 text-[var(--color-border)]">|</span>
          {lang === "zh"
            ? "当前运营数据为示例。登录后可保存测评、接入 Agent、雇佣、派单与结算。"
            : "Operational data is illustrative. Sign in to save results, connect agents, hire, dispatch and settle."}
        </p>
        <div className="flex items-center gap-3 shrink-0">
          <Link href={`/login?next=${next}`} className="text-xs font-medium text-[var(--color-primary-soft)] hover:text-white transition-colors">
            {lang === "zh" ? "登录" : "Sign in"}
          </Link>
          <Link href={`/register?next=${next}`} className="px-3 py-1.5 rounded-md bg-[var(--color-primary)] text-xs font-medium text-white hover:brightness-110 transition">
            {lang === "zh" ? "注册领 50 UT" : "Get 50 UT"}
          </Link>
        </div>
      </div>
    </aside>
  );
}

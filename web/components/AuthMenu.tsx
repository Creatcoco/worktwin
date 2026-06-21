"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";

export default function AuthMenu() {
  const router = useRouter();
  const { lang } = useI18n();
  const { user, loading, logout } = useAuth();

  if (loading) return <div className="w-32 h-9 rounded-lg bg-[var(--color-surface)] animate-pulse" />;

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Link href="/login" className="hidden sm:inline-flex px-3 py-2 text-sm text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]">
          {lang === "zh" ? "登录" : "Sign in"}
        </Link>
        <Link href="/register" className="btn-glow px-4 py-2 rounded-lg text-sm font-medium text-white">
          {lang === "zh" ? "注册领 50 UT" : "Get 50 UT"}
        </Link>
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    router.push("/");
    router.refresh();
  };

  return (
    <div className="flex items-center gap-2">
      <Link href="/integrate" className="hidden lg:inline-flex btn-glow px-3 py-2 rounded-lg text-xs font-medium text-white">
        {lang === "zh" ? "创建分身" : "Create twin"}
      </Link>
      <Link href="/dashboard" className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-[var(--color-surface)] transition-colors">
        <span className="w-7 h-7 rounded-full bg-[var(--color-surface-2)] flex items-center justify-center text-xs font-bold">
          {user.name.slice(0, 1).toUpperCase()}
        </span>
        <span className="hidden sm:block max-w-24 truncate text-sm">{user.name}</span>
      </Link>
      <button onClick={handleLogout} title={lang === "zh" ? "退出登录" : "Sign out"} className="w-9 h-9 rounded-lg text-[var(--color-fg-muted)] hover:text-[var(--color-danger)] hover:bg-[var(--color-surface)] transition-colors">
        ↪
      </button>
    </div>
  );
}

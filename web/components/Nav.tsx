"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Nav() {
  const { t } = useI18n();

  const navLinks = [
    { href: "/market", label: t("nav.market") },
    { href: "/integrate", label: t("nav.integrate") },
    { href: "/studio", label: t("nav.studio") },
    { href: "/dispatch", label: t("nav.dispatch") },
    { href: "/settlement", label: t("nav.settlement") },
    { href: "/developer", label: t("nav.developer") },
    { href: "/assessment", label: t("nav.assessment") },
    { href: "/docs", label: t("nav.docs") },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-border)] backdrop-blur-xl bg-[rgba(6,7,13,0.7)]">
      <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center font-bold text-white text-lg shadow-lg shadow-[var(--color-primary)]/30">
            <span className="animate-float">W</span>
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-bold text-[15px] tracking-tight">WorkTwin</span>
            <span className="text-[10px] text-[var(--color-fg-dim)]">
              {t("nav.subtitle")}
            </span>
          </div>
        </Link>

        {/* 导航 */}
        <div className="hidden lg:flex items-center gap-1">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="px-3 py-2 text-sm text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] rounded-lg hover:bg-[var(--color-surface)] transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* 右侧 */}
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <Link
            href="/dashboard"
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] hover:bg-[var(--color-surface)] transition-colors"
          >
            <span>🧑‍💻</span>
            <span>{t("nav.dashboard")}</span>
          </Link>
          <Link
            href="/integrate"
            className="btn-glow px-4 py-2 rounded-lg text-sm font-medium text-white"
          >
            {t("nav.cta")}
          </Link>
        </div>
      </nav>
    </header>
  );
}

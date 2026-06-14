"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Footer() {
  const { t } = useI18n();

  return (
    <footer className="border-t border-[var(--color-border)] mt-20">
      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center font-bold text-white text-xs">
              W
            </div>
            <span className="font-bold">WorkTwin</span>
          </div>
          <p className="text-[var(--color-fg-dim)] text-xs leading-relaxed">
            {t("footer.tagline")}
          </p>
          <div className="mt-4">
            <LanguageSwitcher compact />
          </div>
        </div>

        <div>
          <h4 className="text-[var(--color-fg-muted)] font-medium mb-3">
            {t("footer.products")}
          </h4>
          <ul className="space-y-2 text-[var(--color-fg-dim)]">
            <li><Link href="/market" className="hover:text-[var(--color-primary-soft)]">{t("nav.market")}</Link></li>
            <li><Link href="/integrate" className="hover:text-[var(--color-primary-soft)]">{t("nav.integrate")}</Link></li>
            <li><Link href="/studio" className="hover:text-[var(--color-primary-soft)]">{t("nav.studio")}</Link></li>
            <li><Link href="/dispatch" className="hover:text-[var(--color-primary-soft)]">{t("nav.dispatch")}</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-[var(--color-fg-muted)] font-medium mb-3">
            {t("footer.developers")}
          </h4>
          <ul className="space-y-2 text-[var(--color-fg-dim)]">
            <li><Link href="/developer" className="hover:text-[var(--color-primary-soft)]">{t("nav.developer")}</Link></li>
            <li><Link href="/docs" className="hover:text-[var(--color-primary-soft)]">{t("nav.docs")}</Link></li>
            <li><span className="cursor-default">A2A JSON-RPC</span></li>
            <li><span className="cursor-default">MCP</span></li>
          </ul>
        </div>

        <div>
          <h4 className="text-[var(--color-fg-muted)] font-medium mb-3">
            {t("footer.protocols")}
          </h4>
          <ul className="space-y-2 text-[var(--color-fg-dim)]">
            <li>OpenClaw</li>
            <li>Hermes Agent</li>
            <li>Cursor MCP</li>
            <li>Claude Desktop</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-[var(--color-border)]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-[var(--color-fg-dim)]">
          <span>© 2026 WorkTwin · {t("footer.copyright")} · worktwin.cn</span>
          <span className="flex items-center gap-4">
            <span>API: https://api.worktwin.cn</span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-success)] animate-pulse-glow" />
              {t("footer.allSystemsOk")}
            </span>
          </span>
        </div>
      </div>
    </footer>
  );
}

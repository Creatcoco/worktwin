"use client";

import { useState } from "react";
import { getCurrentUser, store } from "@/lib/store";
import PageHeader from "@/components/PageHeader";
import { useI18n } from "@/lib/i18n";
import Link from "next/link";

const endpoints = [
  { method: "POST", path: "/integrations/sessions" },
  { method: "POST", path: "/integrations/sessions/{id}/auth/start" },
  { method: "GET", path: "/integrations/sessions/{id}/capabilities" },
  { method: "POST", path: "/integrations/sessions/{id}/publish" },
  { method: "GET", path: "/capabilities" },
  { method: "POST", path: "/demands" },
  { method: "POST", path: "/a2a:tasks/send" },
  { method: "GET", path: "/agent_card" },
];

export default function DeveloperPage() {
  const { t, lang } = useI18n();
  const user = getCurrentUser();
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const [rotated, setRotated] = useState(false);

  const copyKey = () => {
    if (!user) return;
    navigator.clipboard?.writeText(user.apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const rotateKey = async () => {
    await store.rotateApiKey();
    setShowKey(false);
    setCopied(false);
    setRotated(true);
    setTimeout(() => setRotated(false), 2000);
  };

  const docLinks = [
    { label: t("docs.quickStart"), href: "/docs", emoji: "🚀" },
    { label: t("docs.agentCard"), href: "/docs", emoji: "📇" },
    { label: t("docs.openclaw"), href: "/docs", emoji: "🦾" },
    { label: t("docs.auth"), href: "/docs", emoji: "🔐" },
    { label: t("docs.capTradeApi").split(" / ")[0], href: "/docs", emoji: "⚡" },
    { label: t("docs.capTradeApi").split(" / ")[1] || "Transaction", href: "/docs", emoji: "💱" },
  ];

  return (
    <div>
      <PageHeader
        emoji="🛠️"
        title={t("developer.title")}
        description={t("developer.desc")}
        breadcrumbs={[{ label: t("bc.home"), href: "/" }, { label: t("bc.developer") }]}
      />

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {/* API Key */}
        <section className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between gap-3 mb-4">
            <h2 className="font-semibold">{t("developer.apiCreds")}</h2>
            <div className="flex items-center gap-2">
              <button onClick={() => void rotateKey()} className="px-3 py-1.5 rounded-lg text-xs border border-[var(--color-border)] hover:border-[var(--color-primary)] transition-colors">
                {rotated ? (lang === "zh" ? "已轮换" : "Rotated") : (lang === "zh" ? "轮换密钥" : "Rotate key")}
              </button>
              <span className="badge" style={{ color: "#a48bff", background: "rgba(124,92,255,0.12)" }}>{t("developer.agentPath")}</span>
            </div>
          </div>
          <p className="text-xs text-[var(--color-fg-muted)] mb-4">{t("developer.apiKeyDesc")}</p>
          <div className="space-y-3">
            <div>
              <div className="text-xs text-[var(--color-fg-dim)] mb-1">X-Api-Key</div>
              <div className="flex items-center gap-2 p-3 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] font-mono text-sm">
                <span className="flex-1 truncate text-[var(--color-accent)]">{showKey ? user?.apiKey : "sk_worktwin_••••••••••••••••"}</span>
                <button onClick={() => setShowKey(!showKey)} className="px-2 py-1 rounded text-xs bg-[var(--color-surface-2)] hover:bg-[var(--color-surface)]">{showKey ? t("developer.hide") : t("developer.show")}</button>
                <button onClick={copyKey} className="px-2 py-1 rounded text-xs bg-[var(--color-surface-2)] hover:bg-[var(--color-surface)]">{copied ? t("developer.copied") : t("developer.copy")}</button>
              </div>
            </div>
            <div>
              <div className="text-xs text-[var(--color-fg-dim)] mb-1">X-Platform-User-Id</div>
              <div className="p-3 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] font-mono text-sm text-[var(--color-accent)]">{user?.id}</div>
            </div>
            <div className="text-xs text-[var(--color-fg-dim)]">{t("developer.humanPathNote")}</div>
          </div>
        </section>

        {/* 响应信封 */}
        <section className="glass rounded-2xl p-6">
          <h2 className="font-semibold mb-3">{t("developer.envelope")}</h2>
          <pre className="text-xs bg-[var(--color-bg)] p-4 rounded-lg border border-[var(--color-border)] overflow-x-auto text-[var(--color-accent)]">
{`{
  "code": 0,
  "message": "success",
  "data": T,
  "timestamp": 1700000000
}`}
          </pre>
        </section>

        {/* API 端点 */}
        <section className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">{t("developer.endpoints")}</h2>
            <span className="text-xs text-[var(--color-fg-dim)]">BASE_URL: https://api.worktwin.cn</span>
          </div>
          <div className="space-y-2">
            {endpoints.map((e) => (
              <div key={e.path} className="flex items-center gap-3 p-3 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)]">
                <span className="badge shrink-0 font-mono" style={{ color: e.method === "GET" ? "#34d399" : e.method === "POST" ? "#fbbf24" : "#22d3ee", background: e.method === "GET" ? "rgba(52,211,153,0.12)" : e.method === "POST" ? "rgba(251,191,36,0.12)" : "rgba(34,211,238,0.12)" }}>{e.method}</span>
                <code className="text-xs text-[var(--color-fg)] flex-1">{e.path}</code>
              </div>
            ))}
          </div>
        </section>

        {/* Agent Card */}
        <section className="glass rounded-2xl p-6">
          <h2 className="font-semibold mb-3">{t("developer.cardPreview")}</h2>
          <p className="text-xs text-[var(--color-fg-muted)] mb-3">{t("developer.cardDesc")}</p>
          <pre className="text-xs bg-[var(--color-bg)] p-4 rounded-lg border border-[var(--color-border)] overflow-x-auto text-[var(--color-accent)]">
{JSON.stringify(
  {
    name: "demo-user-agent",
    description: "User-owned capability bundle",
    version: "1.0.0",
    endpoints: ["https://api.worktwin.cn/a2a/u_demo"],
    capabilities: store.employees.filter((e) => e.ownerId === "u_demo").flatMap((e) => e.agentCard.capabilities),
  },
  null,
  2
)}
          </pre>
        </section>

        {/* 文档入口 */}
        <section className="glass rounded-2xl p-6">
          <h2 className="font-semibold mb-4">{t("developer.protocolDocs")}</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {docLinks.map((d) => (
              <Link key={d.label} href={d.href} className="flex items-center gap-3 p-3 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-primary)] transition-colors text-sm">
                <span className="text-xl">{d.emoji}</span>
                <span className="flex-1">{d.label}</span>
                <span className="text-[var(--color-fg-dim)]">→</span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { useI18n } from "@/lib/i18n";

export default function DocsPage() {
  const { t } = useI18n();

  const sections = [
    { emoji: "🚀", title: t("docs.quickStart"), desc: t("docs.quickStartDesc") },
    { emoji: "📇", title: t("docs.agentCard"), desc: t("docs.agentCardDesc") },
    { emoji: "🦾", title: t("docs.openclaw"), desc: t("docs.openclawDesc"), badge: t("integrate.recommended") },
    { emoji: "⚡", title: t("docs.hermes"), desc: t("docs.hermesDesc") },
    { emoji: "🖱️", title: t("docs.cursor"), desc: t("docs.cursorDesc") },
    { emoji: "🔐", title: t("docs.auth"), desc: t("docs.authDesc") },
    { emoji: "🧪", title: t("docs.firstSkill"), desc: t("docs.firstSkillDesc") },
    { emoji: "⚡", title: t("docs.capTradeApi"), desc: t("docs.capTradeApiDesc") },
  ];

  const termTable = [
    ["供给", "Skill（技能）", "Capability（能力）", "共用分类体系，走不同交易链路"],
    ["需求", "Task（任务）", "Demand（需求）", "人类发布任务；Agent 创建需求"],
    ["成交载体", "Order（订单）", "Transaction（交易）", "任务匹配产生订单；能力撮合产生交易"],
    ["结算币种", "CNY", "UT", "由 owner_type 决定，可在发布时覆盖"],
    ["认证方式", "Bearer <JWT>", "X-Api-Key + X-Platform-User-Id", "认证方式决定 caller_type"],
    ["匹配池", "human 技能池", "agent 能力池", "同类型隔离"],
  ];

  return (
    <div>
      <PageHeader
        emoji="📚"
        title={t("docs.title")}
        description={t("docs.desc")}
        breadcrumbs={[{ label: t("bc.home"), href: "/" }, { label: t("bc.docs") }]}
      />

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-10">
        {/* 从这里出发 */}
        <section>
          <h2 className="text-xl font-bold mb-4">{t("docs.startHere")}</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {sections.map((s) => (
              <Link key={s.title} href="#" className="glass glass-hover rounded-xl p-4 flex items-start gap-3 group">
                <span className="text-2xl">{s.emoji}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-sm">{s.title}</h3>
                    {s.badge && <span className="badge" style={{ color: "#34d399", background: "rgba(52,211,153,0.12)" }}>{s.badge}</span>}
                  </div>
                  <p className="text-xs text-[var(--color-fg-muted)] leading-relaxed">{s.desc}</p>
                </div>
                <span className="text-[var(--color-fg-dim)] group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            ))}
          </div>
        </section>

        {/* 核心术语对照 */}
        <section>
          <h2 className="text-xl font-bold mb-2">{t("docs.termTable")}</h2>
          <p className="text-sm text-[var(--color-fg-muted)] mb-4">{t("docs.termIntro")}</p>
          <div className="glass rounded-2xl overflow-hidden overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)] text-left text-xs text-[var(--color-fg-dim)]">
                  <th className="p-3 font-normal">{t("docs.col.concept")}</th>
                  <th className="p-3 font-normal text-[var(--color-accent)]">{t("docs.col.human")}</th>
                  <th className="p-3 font-normal text-[var(--color-primary-soft)]">{t("docs.col.agent")}</th>
                  <th className="p-3 font-normal">{t("docs.col.note")}</th>
                </tr>
              </thead>
              <tbody>
                {termTable.map((row, i) => (
                  <tr key={i} className="border-b border-[var(--color-border)] last:border-0">
                    <td className="p-3 font-medium">{row[0]}</td>
                    <td className="p-3 text-[var(--color-accent)] font-mono text-xs">{row[1]}</td>
                    <td className="p-3 text-[var(--color-primary-soft)] font-mono text-xs">{row[2]}</td>
                    <td className="p-3 text-xs text-[var(--color-fg-muted)]">{row[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 p-3 rounded-lg bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/30 text-xs text-[var(--color-fg-muted)]">
            {t("docs.note.protocol")}
          </div>
        </section>

        {/* 统一约定 */}
        <section>
          <h2 className="text-xl font-bold mb-4">{t("docs.conventions")}</h2>
          <div className="glass rounded-2xl p-6 space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <span className="text-[var(--color-fg-dim)] mt-0.5">•</span>
              <div>
                <strong>BASE_URL:</strong>{" "}
                <code className="ml-1 text-[var(--color-accent)]">https://api.worktwin.cn</code>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-[var(--color-fg-dim)] mt-0.5">•</span>
              <div className="flex-1">
                <strong>{t("developer.envelope")}:</strong>
                <pre className="mt-2 text-xs bg-[var(--color-bg)] p-3 rounded-lg border border-[var(--color-border)] overflow-x-auto text-[var(--color-accent)]">
{`{
  "code": 0,
  "message": "success",
  "data": T,
  "timestamp": 1700000000
}`}
                </pre>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-[var(--color-fg-dim)] mt-0.5">•</span>
              <div><strong>Agent:</strong> <code className="ml-1 text-[var(--color-accent)]">X-Api-Key</code> + <code className="ml-1 text-[var(--color-accent)]">X-Platform-User-Id</code></div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-[var(--color-fg-dim)] mt-0.5">•</span>
              <div><strong>Human:</strong> <code className="ml-1 text-[var(--color-accent)]">Authorization: Bearer &lt;JWT&gt;</code></div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="glass rounded-2xl p-6 text-center">
          <h3 className="font-bold mb-2">{t("docs.tryNow")}</h3>
          <p className="text-sm text-[var(--color-fg-muted)] mb-4">{t("docs.tryDesc")}</p>
          <Link href="/integrate" className="btn-glow inline-block px-5 py-2 rounded-lg text-sm font-medium text-white">{t("docs.startIntegrate")}</Link>
        </section>
      </div>
    </div>
  );
}

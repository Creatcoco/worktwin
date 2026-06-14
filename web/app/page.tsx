"use client";

import Link from "next/link";
import { store } from "@/lib/store";
import { useI18n } from "@/lib/i18n";

const protocols = ["OpenClaw", "Hermes", "Cursor MCP", "Claude Desktop", "A2A", "MCP"];

export default function Home() {
  const { t } = useI18n();
  const employeeCount = store.employees.length;

  const stats = [
    { value: "1,284", suffix: t("stats.employees").includes("名") ? "名" : "", label: t("stats.employees") },
    { value: "8,452", suffix: t("stats.tasks").includes("单") ? "单" : "", label: t("stats.tasks") },
    { value: "36", suffix: t("stats.categories").includes("类") ? "类" : "", label: t("stats.categories") },
    { value: "1.8", suffix: t("stats.response").includes("秒") ? "秒" : "s", label: t("stats.response") },
  ];

  const features = [
    { emoji: "⚡", title: t("features.f1.title"), desc: t("features.f1.desc"), href: "/integrate", cta: t("features.f1.cta") },
    { emoji: "🪞", title: t("features.f2.title"), desc: t("features.f2.desc"), href: "/studio", cta: t("features.f2.cta") },
    { emoji: "🤝", title: t("features.f3.title"), desc: t("features.f3.desc"), href: "/market", cta: t("features.f3.cta") },
    { emoji: "🌐", title: t("features.f4.title"), desc: t("features.f4.desc"), href: "/docs", cta: t("features.f4.cta") },
  ];

  const tracks = [
    {
      name: t("tracks.human"),
      color: "#22d3ee",
      items: ["Skill", "Task", "Order", "CNY", "Bearer JWT"],
    },
    {
      name: t("tracks.agent"),
      color: "#a48bff",
      items: ["Capability", "Demand", "Transaction", "UT", "X-Api-Key"],
    },
  ];

  return (
    <div>
      {/* ============ Hero ============ */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 pt-20 pb-24 text-center relative">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[600px] h-[600px] rounded-full bg-[var(--color-primary)] opacity-10 blur-3xl animate-pulse-glow" />
          </div>
          <div className="relative">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-xs text-[var(--color-fg-muted)] mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-success)] animate-pulse-glow" />
              {t("hero.badge")}
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]">
              {t("hero.title1")}
              <br />
              <span className="gradient-text">{t("hero.title2")}</span>
            </h1>
            <p className="mt-6 text-base md:text-lg text-[var(--color-fg-muted)] max-w-2xl mx-auto leading-relaxed">
              {t("hero.desc")}
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/integrate" className="btn-glow px-6 py-3 rounded-xl font-medium text-white">
                {t("hero.ctaPrimary")}
              </Link>
              <Link href="/market" className="px-6 py-3 rounded-xl font-medium border border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-primary)] transition-colors">
                {t("hero.ctaSecondary")}
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
              <span className="text-xs text-[var(--color-fg-dim)] mr-2">{t("hero.protocolsLabel")}</span>
              {protocols.map((p) => (
                <span key={p} className="badge" style={{ color: "var(--color-fg-muted)", background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
                  {p}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ Stats ============ */}
      <section className="max-w-7xl mx-auto px-6 -mt-8">
        <div className="glass rounded-2xl p-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-2xl md:text-3xl font-bold gradient-text">
                {s.value}
                <span className="text-sm text-[var(--color-fg-muted)] ml-1">{s.suffix}</span>
              </div>
              <div className="text-xs text-[var(--color-fg-dim)] mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ============ Features ============ */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">{t("features.heading")}</h2>
          <p className="mt-3 text-[var(--color-fg-muted)]">{t("features.subheading")}</p>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {features.map((f) => (
            <Link key={f.title} href={f.href} className="glass glass-hover rounded-2xl p-6 flex flex-col group">
              <div className="text-3xl mb-3">{f.emoji}</div>
              <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-sm text-[var(--color-fg-muted)] leading-relaxed flex-1">{f.desc}</p>
              <span className="mt-4 text-sm text-[var(--color-primary-soft)] group-hover:translate-x-1 transition-transform inline-block">
                {f.cta}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ============ 双轨架构 ============ */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="glass rounded-3xl p-8 md:p-12">
          <div className="text-center mb-10">
            <span className="badge mb-3" style={{ color: "#a48bff", background: "rgba(124,92,255,0.1)" }}>
              {t("tracks.dualTrack")}
            </span>
            <h2 className="text-2xl md:text-3xl font-bold">{t("tracks.heading")}</h2>
            <p className="mt-2 text-sm text-[var(--color-fg-muted)]">{t("tracks.subheading")}</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {tracks.map((tr) => (
              <div key={tr.name} className="rounded-2xl p-6 border" style={{ borderColor: tr.color + "40", background: tr.color + "0d" }}>
                <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: tr.color }}>
                  <span className="w-2 h-2 rounded-full" style={{ background: tr.color }} />
                  {tr.name}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {tr.items.map((it) => (
                    <span key={it} className="badge" style={{ color: tr.color, background: tr.color + "1a" }}>
                      {it}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CTA ============ */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="relative overflow-hidden rounded-3xl p-12 text-center border border-[var(--color-border)]">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)]/20 via-transparent to-[var(--color-accent)]/20" />
          <div className="relative">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("homeCta.title")}</h2>
            <p className="text-[var(--color-fg-muted)] mb-8 max-w-xl mx-auto">{t("homeCta.desc")}</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/integrate" className="btn-glow px-6 py-3 rounded-xl font-medium text-white">
                {t("homeCta.button")} {employeeCount} {t("homeCta.twinCount")}
              </Link>
              <Link href="/docs" className="px-6 py-3 rounded-xl font-medium border border-[var(--color-border)] hover:border-[var(--color-primary)] transition-colors">
                {t("homeCta.docs")}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

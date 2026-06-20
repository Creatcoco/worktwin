"use client";

import Link from "next/link";
import { store } from "@/lib/store";
import { useI18n } from "@/lib/i18n";

const protocols = ["OpenClaw", "Hermes", "Cursor MCP", "Claude Desktop", "A2A", "MCP"];

export default function Home() {
  const { lang, t } = useI18n();
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

  const manifesto =
    lang === "zh"
      ? {
          eyebrow: "新工作宣言",
          line1: "把技能变成资产，",
          line2: "让分身替你上班。",
          desc: "WorkTwin 不是再给你一个工具，而是把你的专业能力包装成可雇佣、可派单、可结算的数字员工。",
          share: "适合发给每一个正在被重复工作占满的人",
          loop: "从想法到收入闭环",
          pitch: "一句话讲清楚",
          pitchText: "这是一个“人雇佣 AI，AI 也雇佣 AI”的工作网络。",
        }
      : {
          eyebrow: "The new work thesis",
          line1: "Turn skills into assets.",
          line2: "Let your twin work for you.",
          desc: "WorkTwin is not another tool. It packages your expertise into a hireable, dispatchable, settleable work twin.",
          share: "Worth sharing with anyone buried in repeat work",
          loop: "From idea to income loop",
          pitch: "The one-line pitch",
          pitchText: "A work network where humans hire AI, and AI hires AI.",
        };

  const proofPoints =
    lang === "zh"
      ? [
          ["镜像", "把你的简历、能力、报价和工具连接成一名分身"],
          ["上架", "像招聘市场一样被发现、面试、雇佣"],
          ["交付", "自然语言派单，分身自动接活并结算"],
        ]
      : [
          ["Mirror", "Connect your resume, skills, rate and tools into one twin"],
          ["List", "Be discovered, interviewed and hired like a talent market"],
          ["Deliver", "Dispatch in natural language; your twin works and settles"],
        ];

  const shareChips =
    lang === "zh"
      ? ["7x24 在岗", "能力资产化", "一键生成", "协议中立", "可雇佣分身"]
      : ["24/7 on duty", "Skills as assets", "One-click spawn", "Protocol-neutral", "Hireable twins"];

  return (
    <div>
      <section className="relative overflow-hidden hero-grid">
        <div className="max-w-7xl mx-auto px-6 pt-16 pb-20 lg:pt-24 lg:pb-24 relative">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute left-1/2 top-10 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-[var(--color-primary)] opacity-10 blur-3xl animate-pulse-glow" />
          </div>
          <div className="relative grid lg:grid-cols-[1.05fr_0.95fr] gap-10 lg:gap-14 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--color-border)] bg-[rgba(18,21,36,0.82)] text-xs text-[var(--color-fg-muted)] mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-success)] animate-pulse-glow" />
                {t("hero.badge")}
              </div>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.02] max-w-4xl">
                {t("hero.title1")}
                <br />
                <span className="gradient-text">{t("hero.title2")}</span>
              </h1>
              <p className="mt-6 text-base md:text-xl text-[var(--color-fg-muted)] max-w-2xl leading-relaxed">
                {t("hero.desc")}
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <Link href="/integrate" className="btn-glow px-6 py-3 rounded-xl font-semibold text-white text-center">
                  {t("hero.ctaPrimary")}
                </Link>
                <Link href="/market" className="px-6 py-3 rounded-xl font-medium border border-[var(--color-border)] bg-[rgba(18,21,36,0.72)] hover:border-[var(--color-primary)] transition-colors text-center">
                  {t("hero.ctaSecondary")}
                </Link>
              </div>
              <div className="mt-9 flex flex-wrap items-center gap-2">
                <span className="text-xs text-[var(--color-fg-dim)] mr-1">{t("hero.protocolsLabel")}</span>
                {protocols.map((p) => (
                  <span key={p} className="badge badge-soft">
                    {p}
                  </span>
                ))}
              </div>
            </div>

            <aside className="share-card relative overflow-hidden rounded-3xl border border-[var(--color-border)] p-6 md:p-8">
              <div className="absolute right-6 top-6 rounded-full border border-[rgba(255,255,255,0.12)] px-3 py-1 text-[11px] text-[var(--color-fg-dim)]">
                worktwin.cn
              </div>
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-accent)]">
                {manifesto.eyebrow}
              </div>
              <div className="mt-8 text-3xl md:text-5xl font-black leading-[1.08] tracking-tight">
                <span>{manifesto.line1}</span>
                <br />
                <span>{manifesto.line2}</span>
              </div>
              <p className="mt-5 text-sm md:text-base text-[var(--color-fg-muted)] leading-relaxed max-w-lg">
                {manifesto.desc}
              </p>
              <div className="mt-7 grid gap-3">
                {proofPoints.map(([title, desc], index) => (
                  <div key={title} className="flex items-start gap-3 rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] p-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[rgba(34,211,238,0.14)] text-xs font-bold text-[var(--color-accent)]">
                      {index + 1}
                    </span>
                    <div>
                      <div className="text-sm font-semibold">{title}</div>
                      <div className="mt-0.5 text-xs text-[var(--color-fg-dim)] leading-relaxed">{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-7 flex flex-wrap gap-2">
                {shareChips.map((chip) => (
                  <span key={chip} className="badge badge-bright">
                    #{chip}
                  </span>
                ))}
              </div>
              <div className="mt-8 border-t border-[rgba(255,255,255,0.08)] pt-4 text-xs text-[var(--color-fg-dim)]">
                {manifesto.share}
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 -mt-6 relative z-10">
        <div className="proposition-strip rounded-3xl border border-[var(--color-border)] p-4 md:p-5">
          <div className="grid md:grid-cols-3 gap-3">
            {proofPoints.map(([title, desc]) => (
              <div key={title} className="rounded-2xl bg-[rgba(6,7,13,0.34)] p-4">
                <div className="text-sm font-semibold text-[var(--color-accent)]">{title}</div>
                <div className="mt-1 text-sm text-[var(--color-fg-muted)] leading-relaxed">{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 pt-8">
        <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-4">
          <div className="glass rounded-3xl p-6 md:p-7">
            <div className="text-xs text-[var(--color-fg-dim)] mb-3">{manifesto.pitch}</div>
            <p className="text-2xl md:text-3xl font-bold leading-tight">{manifesto.pitchText}</p>
          </div>
          <div className="glass rounded-3xl p-5 md:p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((s) => (
              <div key={s.label} className="rounded-2xl border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.03)] p-4">
                <div className="text-2xl md:text-3xl font-black gradient-text">
                  {s.value}
                  <span className="text-sm text-[var(--color-fg-muted)] ml-1">{s.suffix}</span>
                </div>
                <div className="text-xs text-[var(--color-fg-dim)] mt-2 leading-relaxed">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="mb-10 md:flex md:items-end md:justify-between md:gap-8">
          <div>
            <span className="badge badge-soft mb-4">{manifesto.loop}</span>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight">{t("features.heading")}</h2>
          </div>
          <p className="mt-4 md:mt-0 text-[var(--color-fg-muted)] md:text-right max-w-md leading-relaxed">
            {t("features.subheading")}
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {features.map((f, index) => (
            <Link key={f.title} href={f.href} className="feature-card glass glass-hover rounded-3xl p-6 flex flex-col group">
              <div className="flex items-start justify-between gap-4">
                <div className="text-4xl">{f.emoji}</div>
                <span className="text-xs text-[var(--color-fg-dim)]">0{index + 1}</span>
              </div>
              <h3 className="font-bold text-xl mt-5 mb-3">{f.title}</h3>
              <p className="text-sm text-[var(--color-fg-muted)] leading-relaxed flex-1">{f.desc}</p>
              <span className="mt-6 text-sm font-semibold text-[var(--color-primary-soft)] group-hover:translate-x-1 transition-transform inline-block">
                {f.cta}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-10">
        <div className="glass rounded-3xl p-7 md:p-10 overflow-hidden relative">
          <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-[var(--color-accent)] opacity-10 blur-3xl" />
          <div className="relative grid lg:grid-cols-[0.8fr_1.2fr] gap-8 items-center">
            <div>
              <span className="badge mb-4" style={{ color: "#a48bff", background: "rgba(124,92,255,0.14)", border: "1px solid rgba(164,139,255,0.22)" }}>
                {t("tracks.dualTrack")}
              </span>
              <h2 className="text-2xl md:text-4xl font-black tracking-tight">{t("tracks.heading")}</h2>
              <p className="mt-3 text-sm text-[var(--color-fg-muted)] leading-relaxed">{t("tracks.subheading")}</p>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
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
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="relative overflow-hidden rounded-3xl p-8 md:p-12 text-center border border-[var(--color-border)] cta-panel">
          <div className="relative">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4">{t("homeCta.title")}</h2>
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

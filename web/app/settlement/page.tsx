"use client";

import { store, getCurrentUser } from "@/lib/store";
import PageHeader from "@/components/PageHeader";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import Link from "next/link";

export default function SettlementPage() {
  const { t, lang } = useI18n();
  const { user: authUser, loading: authLoading } = useAuth();
  const user = getCurrentUser();
  const settlements = store.settlements;

  // 游客（未登录）或登录态校验中：切换为「介绍模式」，展示结算机制说明
  // 而非空荡荡的个人钱包（getCurrentUser() 在游客态返回 undefined）。
  const isGuest = !authUser && !authLoading;

  const totalCNY = settlements.filter((s) => s.currency === "CNY").reduce((sum, s) => sum + s.amount, 0);
  const totalUT = settlements.filter((s) => s.currency === "UT").reduce((sum, s) => sum + s.amount, 0);
  const totalsForType = (type: "salary" | "per_task" | "subscription") => ({
    CNY: settlements.filter((s) => s.type === type && s.currency === "CNY").reduce((sum, s) => sum + s.amount, 0),
    UT: settlements.filter((s) => s.type === type && s.currency === "UT").reduce((sum, s) => sum + s.amount, 0),
  });
  const byType = {
    salary: totalsForType("salary"),
    per_task: totalsForType("per_task"),
    subscription: totalsForType("subscription"),
  };
  const recent = [...settlements].sort((a, b) => b.createdAt - a.createdAt).slice(0, 7);
  const ledger = [...settlements].sort((a, b) => b.createdAt - a.createdAt);
  const maxAmount = Math.max(...recent.map((s) => s.amount), 1);

  return (
    <div>
      <PageHeader
        emoji="💰"
        title={t("settlement.title")}
        description={t("settlement.desc")}
        breadcrumbs={[{ label: t("bc.home"), href: "/" }, { label: t("bc.settlement") }]}
      />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {isGuest ? (
          <GuestIntro t={t} />
        ) : (
          <>
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[var(--color-fg-dim)]">{t("settlement.walletCNY")}</span>
              <span className="badge" style={{ color: "#34d399", background: "rgba(52,211,153,0.12)" }}>Order</span>
            </div>
            <div className="text-3xl font-bold text-[var(--color-success)]">¥ {user?.balanceCNY.toLocaleString()}</div>
            <div className="text-xs text-[var(--color-fg-dim)] mt-2">{t("settlement.periodSpend")} ¥{totalCNY.toLocaleString()}</div>
          </div>
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[var(--color-fg-dim)]">{t("settlement.walletUT")}</span>
              <span className="badge" style={{ color: "#a48bff", background: "rgba(124,92,255,0.12)" }}>Transaction</span>
            </div>
            <div className="text-3xl font-bold text-[var(--color-primary-soft)]">{user?.balanceUT.toLocaleString()} UT</div>
            <div className="text-xs text-[var(--color-fg-dim)] mt-2">{t("settlement.periodSpend")} {totalUT.toLocaleString()} UT</div>
          </div>
        </div>

        <section className="glass rounded-2xl p-6 mb-6">
          <h2 className="font-semibold mb-4">{t("settlement.byModel")}</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <BillingBreakdown label={t("card.salary")} amounts={byType.salary} totalCNY={totalCNY} totalUT={totalUT} color="#22d3ee" />
            <BillingBreakdown label={t("card.perTask")} amounts={byType.per_task} totalCNY={totalCNY} totalUT={totalUT} color="#a48bff" />
            <BillingBreakdown label={t("card.subscription")} amounts={byType.subscription} totalCNY={totalCNY} totalUT={totalUT} color="#f472b6" />
          </div>
        </section>

        <section className="glass rounded-2xl p-6 mb-6">
          <h2 className="font-semibold mb-4">{t("settlement.recent")}</h2>
          <div className="flex items-end gap-2 h-32 mb-2">
            {recent.map((s) => (
              <div key={s.id} className="flex-1 rounded-t-lg transition-all hover:opacity-80 relative group" style={{ height: `${(s.amount / maxAmount) * 100}%`, background: `linear-gradient(180deg, ${s.currency === "CNY" ? "#34d399" : "#a48bff"} 0%, transparent 100%)`, minHeight: "8px" }}>
                <div className="absolute -top-7 left-1/2 -translate-x-1/2 text-[10px] text-[var(--color-fg-muted)] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">{s.amount} {s.currency}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="glass rounded-2xl p-6">
          <h2 className="font-semibold mb-4">{t("settlement.flow")} ({settlements.length})</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-[var(--color-fg-dim)] border-b border-[var(--color-border)]">
                  <th className="pb-2 pr-4 font-normal">{t("settlement.col.desc")}</th>
                  <th className="pb-2 pr-4 font-normal">{t("settlement.col.billing")}</th>
                  <th className="pb-2 pr-4 font-normal">{t("settlement.col.path")}</th>
                  <th className="pb-2 pr-4 font-normal text-right">{t("settlement.col.amount")}</th>
                  <th className="pb-2 font-normal text-right">{t("settlement.col.time")}</th>
                </tr>
              </thead>
              <tbody>
                {ledger.map((s) => (
                  <tr key={s.id} className="border-b border-[var(--color-border)] last:border-0">
                    <td className="py-3 pr-4">{s.description}</td>
                    <td className="py-3 pr-4 text-xs text-[var(--color-fg-muted)]">{s.type === "salary" ? t("card.salary") : s.type === "per_task" ? t("card.perTask") : t("card.subscription")}</td>
                    <td className="py-3 pr-4">
                      <span className="badge" style={{ color: s.callerType === "human" ? "#34d399" : "#a48bff", background: s.callerType === "human" ? "rgba(52,211,153,0.12)" : "rgba(124,92,255,0.12)" }}>
                        {s.callerType === "human" ? "Order" : "Transaction"}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-right font-bold">
                      <span style={{ color: s.currency === "CNY" ? "#34d399" : "#a48bff" }}>{s.amount} {s.currency}</span>
                    </td>
                    <td className="py-3 text-right text-xs text-[var(--color-fg-dim)]">{formatDate(s.createdAt, lang)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
          </>
        )}
      </div>
    </div>
  );
}

/** 游客介绍模式：解释结算中心怎么运作，引导登录查看真实结算。 */
function GuestIntro({ t }: { t: (key: string, vars?: Record<string, string | number>) => string }) {
  const cards = [
    { icon: "🔀", title: t("settlement.guestC2aTitle"), desc: t("settlement.guestC2aDesc") },
    { icon: "👛", title: t("settlement.guestWalletTitle"), desc: t("settlement.guestWalletDesc") },
    { icon: "✅", title: t("settlement.guestFlowTitle"), desc: t("settlement.guestFlowDesc") },
    { icon: "🧾", title: t("settlement.guestReconTitle"), desc: t("settlement.guestReconDesc") },
  ];
  return (
    <div className="max-w-5xl mx-auto">
      {/* 演示模式横幅 */}
      <div className="glass rounded-2xl p-6 mb-6 flex items-start gap-4 flex-wrap">
        <div className="flex-1 min-w-[240px]">
          <div className="flex items-center gap-2 mb-2">
            <span className="badge" style={{ color: "#fbbf24", background: "rgba(251,191,36,0.12)" }}>{t("settlement.guestBadge")}</span>
            <h2 className="font-bold text-lg">{t("settlement.guestTitle")}</h2>
          </div>
          <p className="text-sm text-[var(--color-fg-muted)] max-w-2xl">{t("settlement.guestLead")}</p>
        </div>
        <Link href="/login?next=/settlement" className="btn-glow shrink-0 inline-block px-5 py-2.5 rounded-lg text-sm font-medium text-white">
          {t("settlement.guestCta")}
        </Link>
      </div>

      {/* 机制卡片 */}
      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        {cards.map((c) => (
          <div key={c.title} className="glass rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">{c.icon}</span>
              <h3 className="font-semibold text-sm">{c.title}</h3>
            </div>
            <p className="text-xs text-[var(--color-fg-muted)] leading-relaxed">{c.desc}</p>
          </div>
        ))}
      </div>

      {/* 三种计费模型 */}
      <div className="glass rounded-2xl p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <span className="text-lg">📦</span>
          {t("settlement.guestModelTitle")}
        </h3>
        <ul className="space-y-3 text-sm">
          <li className="flex items-start gap-3 p-3 rounded-lg bg-[var(--color-surface)]">
            <span className="badge shrink-0" style={{ color: "#22d3ee", background: "rgba(34,211,238,0.12)" }}>salary</span>
            <span className="text-[var(--color-fg-muted)]">{t("settlement.guestModelSalary")}</span>
          </li>
          <li className="flex items-start gap-3 p-3 rounded-lg bg-[var(--color-surface)]">
            <span className="badge shrink-0" style={{ color: "#a48bff", background: "rgba(124,92,255,0.12)" }}>per_task</span>
            <span className="text-[var(--color-fg-muted)]">{t("settlement.guestModelPerTask")}</span>
          </li>
          <li className="flex items-start gap-3 p-3 rounded-lg bg-[var(--color-surface)]">
            <span className="badge shrink-0" style={{ color: "#f472b6", background: "rgba(244,114,182,0.12)" }}>subscription</span>
            <span className="text-[var(--color-fg-muted)]">{t("settlement.guestModelSub")}</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

function formatDate(timestamp: number, lang: "zh" | "en") {
  return new Intl.DateTimeFormat(lang === "zh" ? "zh-CN" : "en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Asia/Shanghai",
  }).format(new Date(timestamp * 1000));
}

function BillingBreakdown({ label, amounts, totalCNY, totalUT, color }: { label: string; amounts: { CNY: number; UT: number }; totalCNY: number; totalUT: number; color: string }) {
  const cnyPct = totalCNY > 0 ? Math.round((amounts.CNY / totalCNY) * 100) : 0;
  const utPct = totalUT > 0 ? Math.round((amounts.UT / totalUT) * 100) : 0;
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <div className="text-sm font-medium mb-3">{label}</div>
      <div className="space-y-3">
        <CurrencyBar label="CNY" amount={amounts.CNY} percent={cnyPct} color="#34d399" />
        <CurrencyBar label="UT" amount={amounts.UT} percent={utPct} color={color} />
      </div>
    </div>
  );
}

function CurrencyBar({ label, amount, percent, color }: { label: string; amount: number; percent: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1.5">
        <span className="text-[var(--color-fg-muted)]">{label} · {amount.toLocaleString()}</span>
        <span style={{ color }}>{percent}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-[var(--color-bg)] overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${percent}%`, background: color }} />
      </div>
    </div>
  );
}

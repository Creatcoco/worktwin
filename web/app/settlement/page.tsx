"use client";

import { store, getCurrentUser } from "@/lib/store";
import PageHeader from "@/components/PageHeader";
import { useI18n } from "@/lib/i18n";

export default function SettlementPage() {
  const { t } = useI18n();
  const user = getCurrentUser();
  const settlements = store.settlements;

  const totalCNY = settlements.filter((s) => s.currency === "CNY").reduce((sum, s) => sum + s.amount, 0);
  const totalUT = settlements.filter((s) => s.currency === "UT").reduce((sum, s) => sum + s.amount, 0);
  const byType = {
    salary: settlements.filter((s) => s.type === "salary").reduce((a, b) => a + b.amount, 0),
    per_task: settlements.filter((s) => s.type === "per_task").reduce((a, b) => a + b.amount, 0),
    subscription: settlements.filter((s) => s.type === "subscription").reduce((a, b) => a + b.amount, 0),
  };
  const recent = [...settlements].sort((a, b) => b.createdAt - a.createdAt).slice(0, 7);
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
            <BillingBar label={t("card.salary")} amount={byType.salary} total={totalCNY + totalUT} color="#22d3ee" />
            <BillingBar label={t("card.perTask")} amount={byType.per_task} total={totalCNY + totalUT} color="#a48bff" />
            <BillingBar label={t("card.subscription")} amount={byType.subscription} total={totalCNY + totalUT} color="#f472b6" />
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
                {settlements.map((s) => (
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
                    <td className="py-3 text-right text-xs text-[var(--color-fg-dim)]">{new Date(s.createdAt * 1000).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

function BillingBar({ label, amount, total, color }: { label: string; amount: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((amount / total) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between text-xs mb-1.5">
        <span className="text-[var(--color-fg-muted)]">{label}</span>
        <span style={{ color }}>{pct}%</span>
      </div>
      <div className="h-2 rounded-full bg-[var(--color-surface)] overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
      <div className="text-xs text-[var(--color-fg-dim)] mt-1">¥{amount.toLocaleString()}</div>
    </div>
  );
}

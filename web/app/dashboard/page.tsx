"use client";

import { store, getCurrentUser } from "@/lib/store";
import PageHeader from "@/components/PageHeader";
import { useI18n } from "@/lib/i18n";
import Link from "next/link";

export default function DashboardPage() {
  const { t } = useI18n();
  const user = getCurrentUser();
  const myContracts = store.contracts.filter((c) => c.employerId === store.currentUserId);
  const myTasks = store.tasks.filter((t2) => t2.assignerId === store.currentUserId);
  const myEmployees = store.employees.filter((e) => e.ownerId === store.currentUserId);
  const earnings = store.settlements.filter((s) => s.callerType === "human").reduce((sum, s) => sum + s.amount, 0);

  const taskCount = (status: string) => myTasks.filter((tk) => tk.status === status).length;
  const statusColors: Record<string, string> = { queued: "#646c87", running: "#22d3ee", review: "#fbbf24", done: "#34d399", rejected: "#f87171" };

  return (
    <div>
      <PageHeader
        emoji="🧑‍💻"
        title={t("dashboard.title")}
        description={t("dashboard.desc")}
        breadcrumbs={[{ label: t("bc.home"), href: "/" }, { label: t("bc.dashboard") }]}
        actions={<Link href="/integrate" className="btn-glow px-4 py-2 rounded-lg text-xs font-medium text-white">{t("dashboard.newEmployee")}</Link>}
      />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard label={t("dashboard.balanceCNY")} value={user?.balanceCNY.toLocaleString() || 0} suffix="¥" color="#34d399" />
          <StatCard label={t("dashboard.balanceUT")} value={user?.balanceUT.toLocaleString() || 0} suffix="UT" color="#a48bff" />
          <StatCard label={t("dashboard.onDuty")} value={myContracts.length} suffix="" color="#22d3ee" />
          <StatCard label={t("dashboard.totalSpend")} value={earnings.toLocaleString()} suffix="¥" color="#fbbf24" />
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          <section className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">{t("dashboard.hired")}</h2>
              <Link href="/market" className="text-xs text-[var(--color-primary-soft)]">{t("dashboard.goHire")}</Link>
            </div>
            {myContracts.length === 0 ? (
              <p className="text-sm text-[var(--color-fg-dim)] py-6 text-center">{t("dashboard.emptyHired")}</p>
            ) : (
              <div className="space-y-3">
                {myContracts.map((c) => {
                  const emp = store.employees.find((e) => e.id === c.employeeId);
                  return (
                    <div key={c.id} className="flex items-center gap-3 p-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
                      <div className="w-10 h-10 rounded-lg bg-[var(--color-surface-2)] flex items-center justify-center text-xl">{emp?.avatar || "🤖"}</div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">{c.employeeName}</div>
                        <div className="text-xs text-[var(--color-fg-dim)]">{c.metrics.completed}/{c.metrics.assigned} · ★ {c.metrics.rating}</div>
                      </div>
                      <span className="badge" style={{ color: c.status === "active" ? "#34d399" : "#fbbf24", background: c.status === "active" ? "rgba(52,211,153,0.12)" : "rgba(251,191,36,0.12)" }}>
                        {c.status === "active" ? t("card.hired") : t("card.offline")}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <section className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">{t("dashboard.myTwins")}</h2>
              <Link href="/studio" className="text-xs text-[var(--color-primary-soft)]">{t("dashboard.studioMgmt")}</Link>
            </div>
            {myEmployees.length === 0 ? (
              <p className="text-sm text-[var(--color-fg-dim)] py-6 text-center">{t("dashboard.emptyMine")}</p>
            ) : (
              <div className="space-y-3">
                {myEmployees.map((e) => (
                  <div key={e.id} className="flex items-center gap-3 p-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
                    <div className="w-10 h-10 rounded-lg bg-[var(--color-surface-2)] flex items-center justify-center text-xl">{e.avatar}</div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{e.name}</div>
                      <div className="text-xs text-[var(--color-fg-dim)]">{e.resume.completedCount} · ★ {e.resume.rating}</div>
                    </div>
                    <span className="badge" style={{ color: e.status === "available" ? "#34d399" : "#fbbf24", background: e.status === "available" ? "rgba(52,211,153,0.12)" : "rgba(251,191,36,0.12)" }}>
                      {e.status === "available" ? t("card.available") : t("card.hired")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <section className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">{t("dashboard.taskProgress")}</h2>
            <Link href="/dispatch" className="text-xs text-[var(--color-primary-soft)]">{t("dashboard.dispatchCenter")}</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <MiniStat label={t("dashboard.queued")} value={taskCount("queued")} color="#646c87" />
            <MiniStat label={t("dashboard.running")} value={taskCount("running")} color="#22d3ee" />
            <MiniStat label={t("dashboard.review")} value={taskCount("review")} color="#fbbf24" />
            <MiniStat label={t("dashboard.done")} value={taskCount("done")} color="#34d399" />
          </div>
          <div className="space-y-2">
            {myTasks.slice(0, 5).map((tk) => (
              <div key={tk.id} className="flex items-center gap-3 p-3 rounded-lg bg-[var(--color-surface)] text-sm">
                <span className="text-[var(--color-primary-soft)]">▸</span>
                <span className="flex-1 truncate">{tk.brief}</span>
                <span className="text-xs text-[var(--color-fg-dim)]">{tk.assigneeName}</span>
                <span className="badge" style={{ color: statusColors[tk.status], background: statusColors[tk.status] + "1f" }}>
                  {t("dispatch.s." + tk.status)}
                </span>
              </div>
            ))}
            {myTasks.length === 0 && <p className="text-sm text-[var(--color-fg-dim)] py-4 text-center">{t("dashboard.noTasks")}</p>}
          </div>
        </section>
      </div>
    </div>
  );
}

function StatCard({ label, value, suffix, color }: { label: string; value: number | string; suffix: string; color: string }) {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="text-xs text-[var(--color-fg-dim)] mb-2">{label}</div>
      <div className="text-2xl font-bold" style={{ color }}>
        {value}<span className="text-xs text-[var(--color-fg-muted)] ml-1">{suffix}</span>
      </div>
    </div>
  );
}

function MiniStat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="p-3 rounded-xl bg-[var(--color-surface)] text-center">
      <div className="text-xl font-bold" style={{ color }}>{value}</div>
      <div className="text-xs text-[var(--color-fg-dim)] mt-0.5">{label}</div>
    </div>
  );
}

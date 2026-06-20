"use client";

import { useState } from "react";
import Link from "next/link";
import { store } from "@/lib/store";
import PageHeader from "@/components/PageHeader";
import { useI18n } from "@/lib/i18n";
import type { TaskOrder } from "@/types";

export default function DispatchPage() {
  const { t, lang } = useI18n();
  const myContracts = store.contracts.filter((c) => c.employerId === store.currentUserId);
  const onDutyEmployees = myContracts.map((c) => store.employees.find((e) => e.id === c.employeeId)).filter(Boolean) as typeof store.employees;

  const [brief, setBrief] = useState("");
  const [assigneeId, setAssigneeId] = useState<string>(onDutyEmployees[0]?.id || "");
  const [priority, setPriority] = useState<"low" | "normal" | "high">("normal");
  const [deadline, setDeadline] = useState(3);
  const [tasks, setTasks] = useState<TaskOrder[]>(() => store.tasks.filter((tk) => tk.assignerId === store.currentUserId));
  const [error, setError] = useState("");

  const assign = async () => {
    setError("");
    try {
      await store.createTask({ assigneeEmployeeId: assigneeId, brief, priority, deadlineDays: deadline });
      setTasks([...store.tasks.filter((tk) => tk.assignerId === store.currentUserId)]);
      setBrief("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : (lang === "zh" ? "派单失败，请稍后重试。" : "Dispatch failed. Try again later."));
    }
  };

  const advance = async (id: string) => {
    setError("");
    try {
      await store.advanceTask(id);
      setTasks([...store.tasks.filter((x) => x.assignerId === store.currentUserId)]);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : (lang === "zh" ? "任务推进失败。" : "Task update failed."));
    }
  };

  return (
    <div>
      <PageHeader
        emoji="📤"
        title={t("dispatch.title")}
        description={t("dispatch.desc")}
        breadcrumbs={[{ label: t("bc.home"), href: "/" }, { label: t("bc.dispatch") }]}
      />

      <div className="max-w-5xl mx-auto px-6 py-8">
        {onDutyEmployees.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center">
            <div className="text-4xl mb-3">🤝</div>
            <h2 className="font-bold mb-2">{t("dispatch.noOnDuty")}</h2>
            <p className="text-sm text-[var(--color-fg-muted)] mb-4">{t("dispatch.noOnDutyDesc")}</p>
            <Link href="/market" className="btn-glow inline-block px-5 py-2 rounded-lg text-sm font-medium text-white">{t("dispatch.goMarket")}</Link>
          </div>
        ) : (
          <>
            <section className="glass rounded-2xl p-6 mb-6">
              <h2 className="font-semibold mb-4">{t("dispatch.newTask")}</h2>
              <textarea value={brief} onChange={(e) => setBrief(e.target.value)} rows={3} placeholder={t("dispatch.briefPh")} className="w-full px-4 py-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] focus:border-[var(--color-primary)] outline-none text-sm resize-none mb-4" />
              <div className="grid sm:grid-cols-3 gap-3 mb-4">
                <label className="block">
                  <span className="block text-xs text-[var(--color-fg-muted)] mb-1.5">{t("dispatch.assignTo")}</span>
                  <select value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-sm outline-none focus:border-[var(--color-primary)]">
                    {onDutyEmployees.map((e) => (<option key={e.id} value={e.id}>{e.avatar} {e.name}</option>))}
                  </select>
                </label>
                <label className="block">
                  <span className="block text-xs text-[var(--color-fg-muted)] mb-1.5">{t("dispatch.priority")}</span>
                  <select value={priority} onChange={(e) => setPriority(e.target.value as "low" | "normal" | "high")} className="w-full px-3 py-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-sm outline-none focus:border-[var(--color-primary)]">
                    <option value="low">{t("dispatch.pLow")}</option>
                    <option value="normal">{t("dispatch.pNormal")}</option>
                    <option value="high">{t("dispatch.pHigh")}</option>
                  </select>
                </label>
                <label className="block">
                  <span className="block text-xs text-[var(--color-fg-muted)] mb-1.5">{t("dispatch.deadline")}</span>
                  <input type="number" min={1} value={deadline} onChange={(e) => setDeadline(Number(e.target.value))} className="w-full px-3 py-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-sm outline-none focus:border-[var(--color-primary)]" />
                </label>
              </div>
              <button onClick={() => void assign()} disabled={!brief.trim()} className="btn-glow w-full py-2.5 rounded-xl text-sm font-medium text-white disabled:opacity-40">{t("dispatch.send")}</button>
              {error && <p className="mt-3 text-xs text-[var(--color-danger)]">{error}</p>}
            </section>

            <section className="glass rounded-2xl p-6">
              <h2 className="font-semibold mb-4">{t("dispatch.queue")} ({tasks.length})</h2>
              {tasks.length === 0 ? (
                <p className="text-sm text-[var(--color-fg-dim)] py-6 text-center">{t("dispatch.empty")}</p>
              ) : (
                <div className="space-y-3">
                  {tasks.map((tk) => {
                    const sc: Record<string, string> = { queued: "#646c87", running: "#22d3ee", review: "#fbbf24", done: "#34d399", rejected: "#f87171" };
                    return (
                      <div key={tk.id} className="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex-1">
                            <p className="text-sm">{tk.brief}</p>
                            <div className="flex items-center gap-2 mt-1.5 text-xs text-[var(--color-fg-dim)]">
                              <span>{tk.assigneeName}</span>
                              <span>·</span>
                              <span>{tk.priority === "high" ? "🔴 " + t("dispatch.pHigh") : tk.priority === "normal" ? "🟡 " + t("dispatch.pNormal") : "⚪ " + t("dispatch.pLow")}</span>
                            </div>
                          </div>
                          <span className="badge shrink-0" style={{ color: sc[tk.status], background: sc[tk.status] + "1f" }}>{t("dispatch.s." + tk.status)}</span>
                        </div>
                        {tk.result && <div className="mt-2 p-2 rounded-lg bg-[var(--color-bg)] text-xs text-[var(--color-success)]">{tk.result}</div>}
                        {tk.status !== "done" && (
                          <button onClick={() => void advance(tk.id)} className="mt-3 px-3 py-1 rounded-lg text-xs bg-[var(--color-surface-2)] hover:bg-[var(--color-primary)] hover:text-white transition-colors">{t("dispatch.advance")}</button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}

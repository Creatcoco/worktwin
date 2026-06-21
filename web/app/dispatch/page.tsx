"use client";

import { useState } from "react";
import Link from "next/link";
import { seedContracts, seedEmployees, seedTasks, store } from "@/lib/store";
import PageHeader from "@/components/PageHeader";
import InlineLoginGate from "@/components/InlineLoginGate";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import type { TaskOrder } from "@/types";

const STATUS_COLORS: Record<string, string> = {
  queued: "#646c87",
  running: "#22d3ee",
  review: "#fbbf24",
  done: "#34d399",
  rejected: "#f87171",
};

export default function DispatchPage() {
  const { t, lang } = useI18n();
  const { user } = useAuth();
  const isGuest = !user;

  const contractSource = isGuest ? seedContracts : store.contracts;
  const employeeSource = isGuest ? seedEmployees : store.employees;
  const taskSource = isGuest ? seedTasks : store.tasks;
  const myContracts = contractSource.filter((c) => c.employerId === (isGuest ? "u_demo" : store.currentUserId));
  const onDutyEmployees = myContracts
    .map((c) => employeeSource.find((e) => e.id === c.employeeId))
    .filter(Boolean) as typeof employeeSource;

  // JD 表单状态
  const [role, setRole] = useState("");
  const [responsibilities, setResponsibilities] = useState("");
  const [requirements, setRequirements] = useState("");
  const [deliverables, setDeliverables] = useState("");
  const [skillTags, setSkillTags] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [budget, setBudget] = useState<string>("");
  const [assigneeId, setAssigneeId] = useState<string>(onDutyEmployees[0]?.id || "");
  const [priority, setPriority] = useState<"low" | "normal" | "high">("normal");
  const [deadline, setDeadline] = useState(3);
  const [, setVersion] = useState(0);
  const tasks: TaskOrder[] = taskSource.filter((tk) => tk.assignerId === (isGuest ? "u_demo" : store.currentUserId));
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const activeAssigneeId = onDutyEmployees.some((employee) => employee.id === assigneeId)
    ? assigneeId
    : onDutyEmployees[0]?.id || "";

  const addSkill = (value: string) => {
    const v = value.trim();
    if (v && !skillTags.includes(v)) setSkillTags([...skillTags, v]);
    setSkillInput("");
  };

  const removeSkill = (tag: string) => setSkillTags(skillTags.filter((s) => s !== tag));

  const canSubmit = role.trim() && responsibilities.trim() && requirements.trim() && deliverables.trim() && activeAssigneeId;

  const assign = async () => {
    setError("");
    setInfo("");
    try {
      await store.createTask({
        assigneeEmployeeId: activeAssigneeId,
        role: role.trim(),
        responsibilities: responsibilities.trim(),
        requirements: requirements.trim(),
        deliverables: deliverables.trim(),
        budget: budget ? Number(budget) : 0,
        skillTags,
        priority,
        deadlineDays: deadline,
      });
      setVersion((value) => value + 1);
      // 清空表单
      setRole("");
      setResponsibilities("");
      setRequirements("");
      setDeliverables("");
      setSkillTags([]);
      setBudget("");
      setInfo(lang === "zh" ? "需求已发布并指派。" : "Requirement posted and assigned.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : (lang === "zh" ? "发布失败，请稍后重试。" : "Failed to post. Try again later."));
    }
  };

  const advance = async (id: string) => {
    setError("");
    try {
      await store.advanceTask(id);
      setVersion((value) => value + 1);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : (lang === "zh" ? "推进失败。" : "Update failed."));
    }
  };

  // 把多行文本切成要点列表
  const toLines = (text: string) => text.split("\n").map((l) => l.trim()).filter(Boolean);

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
            {/* 招聘 JD 表单 */}
            <section className="glass rounded-2xl p-6 mb-6">
              <h2 className="font-semibold mb-4">{t("dispatch.newTask")}</h2>
              <div className="space-y-4">
                {/* 岗位标题 */}
                <label className="block">
                  <span className="block text-xs text-[var(--color-fg-muted)] mb-1.5">{t("dispatch.role")} <span className="text-[var(--color-danger)]">*</span></span>
                  <input value={role} onChange={(e) => setRole(e.target.value)} className="input" placeholder={t("dispatch.rolePh")} />
                </label>

                {/* 岗位职责 */}
                <label className="block">
                  <span className="block text-xs text-[var(--color-fg-muted)] mb-1.5">{t("dispatch.responsibilities")} <span className="text-[var(--color-danger)]">*</span></span>
                  <textarea value={responsibilities} onChange={(e) => setResponsibilities(e.target.value)} rows={3} className="w-full px-4 py-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] focus:border-[var(--color-primary)] outline-none text-sm resize-none" placeholder={t("dispatch.responsibilitiesPh")} />
                </label>

                {/* 任职要求 */}
                <label className="block">
                  <span className="block text-xs text-[var(--color-fg-muted)] mb-1.5">{t("dispatch.requirements")} <span className="text-[var(--color-danger)]">*</span></span>
                  <textarea value={requirements} onChange={(e) => setRequirements(e.target.value)} rows={3} className="w-full px-4 py-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] focus:border-[var(--color-primary)] outline-none text-sm resize-none" placeholder={t("dispatch.requirementsPh")} />
                </label>

                {/* 交付标准 */}
                <label className="block">
                  <span className="block text-xs text-[var(--color-fg-muted)] mb-1.5">{t("dispatch.deliverables")} <span className="text-[var(--color-danger)]">*</span></span>
                  <textarea value={deliverables} onChange={(e) => setDeliverables(e.target.value)} rows={3} className="w-full px-4 py-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] focus:border-[var(--color-primary)] outline-none text-sm resize-none" placeholder={t("dispatch.deliverablesPh")} />
                </label>

                {/* 技能标签 */}
                <label className="block">
                  <span className="block text-xs text-[var(--color-fg-muted)] mb-1.5">{t("dispatch.skills")}</span>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {skillTags.map((tag) => (
                      <span key={tag} className="badge badge-bright cursor-pointer" onClick={() => removeSkill(tag)} title={lang === "zh" ? "点击移除" : "Click to remove"}>
                        {tag} ✕
                      </span>
                    ))}
                  </div>
                  <input
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addSkill(skillInput);
                      }
                    }}
                    className="input"
                    placeholder={t("dispatch.skillsPh")}
                  />
                </label>

                {/* 预算 + 指派 + 优先级 + 期限 */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <label className="block">
                    <span className="block text-xs text-[var(--color-fg-muted)] mb-1.5">{t("dispatch.budget")}</span>
                    <input type="number" min={0} value={budget} onChange={(e) => setBudget(e.target.value)} className="input" placeholder={t("dispatch.byContract")} />
                  </label>
                  <label className="block">
                    <span className="block text-xs text-[var(--color-fg-muted)] mb-1.5">{t("dispatch.assignTo")}</span>
                    <select value={activeAssigneeId} onChange={(e) => setAssigneeId(e.target.value)} className="input">
                      {onDutyEmployees.map((e) => (<option key={e.id} value={e.id}>{e.avatar} {e.name}</option>))}
                    </select>
                  </label>
                  <label className="block">
                    <span className="block text-xs text-[var(--color-fg-muted)] mb-1.5">{t("dispatch.priority")}</span>
                    <select value={priority} onChange={(e) => setPriority(e.target.value as "low" | "normal" | "high")} className="input">
                      <option value="low">{t("dispatch.pLow")}</option>
                      <option value="normal">{t("dispatch.pNormal")}</option>
                      <option value="high">{t("dispatch.pHigh")}</option>
                    </select>
                  </label>
                  <label className="block">
                    <span className="block text-xs text-[var(--color-fg-muted)] mb-1.5">{t("dispatch.deadline")}</span>
                    <input type="number" min={1} value={deadline} onChange={(e) => setDeadline(Number(e.target.value))} className="input" />
                  </label>
                </div>
                {budget && <p className="text-[11px] text-[var(--color-fg-dim)]">{t("dispatch.budgetHint")}</p>}
              </div>

              <InlineLoginGate action={t("dispatch.send")} onConfirm={() => void assign()}>
                {(handleClick) => (
                  <button onClick={handleClick} disabled={!canSubmit} className="btn-glow w-full mt-5 py-2.5 rounded-xl text-sm font-medium text-white disabled:opacity-40 disabled:cursor-not-allowed">{t("dispatch.send")}</button>
                )}
              </InlineLoginGate>
              {error && <p className="mt-3 text-xs text-[var(--color-danger)]">{error}</p>}
              {info && <p className="mt-3 text-xs text-[var(--color-success)]">{info}</p>}
            </section>

            {/* 需求列表（JD 卡片）*/}
            <section className="glass rounded-2xl p-6">
              <h2 className="font-semibold mb-4">{t("dispatch.queue")} ({tasks.length})</h2>
              {tasks.length === 0 ? (
                <p className="text-sm text-[var(--color-fg-dim)] py-6 text-center">{t("dispatch.empty")}</p>
              ) : (
                <div className="space-y-4">
                  {tasks.map((tk) => {
                    const respLines = toLines(tk.responsibilities || tk.brief);
                    const reqLines = toLines(tk.requirements);
                    const delivLines = toLines(tk.deliverables);
                    const tags = tk.skillTags || [];
                    return (
                      <div key={tk.id} className="p-5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
                        {/* 卡片头：标题 + 状态 */}
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-[var(--color-fg)]">{tk.role || tk.brief}</h3>
                            <div className="flex items-center gap-2 mt-1 text-xs text-[var(--color-fg-dim)]">
                              <span>{tk.assigneeName}</span>
                              <span>·</span>
                              <span>{tk.priority === "high" ? "🔴 " + t("dispatch.pHigh") : tk.priority === "normal" ? "🟡 " + t("dispatch.pNormal") : "⚪ " + t("dispatch.pLow")}</span>
                              {tk.deadline > 0 && (<><span>·</span><span>{t("dispatch.deadline")}: {tk.deadline}</span></>)}
                              {tk.budget > 0 && (<><span>·</span><span className="text-[var(--color-accent)]">¥{tk.budget}</span></>)}
                            </div>
                          </div>
                          <span className="badge shrink-0" style={{ color: STATUS_COLORS[tk.status], background: STATUS_COLORS[tk.status] + "1f" }}>{t("dispatch.s." + tk.status)}</span>
                        </div>

                        {/* 技能标签 */}
                        {tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {tags.map((tag) => (<span key={tag} className="badge badge-soft">{tag}</span>))}
                          </div>
                        )}

                        {/* 三段 JD 详情 */}
                        <div className="space-y-2 text-xs">
                          {respLines.length > 0 && (
                            <div>
                              <p className="text-[var(--color-fg-muted)] font-medium mb-1">{t("dispatch.responsibilities")}</p>
                              <ul className="list-disc list-inside text-[var(--color-fg-dim)] space-y-0.5">
                                {respLines.slice(0, 4).map((line, i) => (<li key={i}>{line}</li>))}
                              </ul>
                            </div>
                          )}
                          {reqLines.length > 0 && (
                            <div>
                              <p className="text-[var(--color-fg-muted)] font-medium mb-1">{t("dispatch.requirements")}</p>
                              <ul className="list-disc list-inside text-[var(--color-fg-dim)] space-y-0.5">
                                {reqLines.slice(0, 4).map((line, i) => (<li key={i}>{line}</li>))}
                              </ul>
                            </div>
                          )}
                          {delivLines.length > 0 && (
                            <div>
                              <p className="text-[var(--color-fg-muted)] font-medium mb-1">{t("dispatch.deliverables")}</p>
                              <ul className="list-disc list-inside text-[var(--color-fg-dim)] space-y-0.5">
                                {delivLines.slice(0, 4).map((line, i) => (<li key={i}>{line}</li>))}
                              </ul>
                            </div>
                          )}
                        </div>

                        {/* 交付结果 */}
                        {tk.result && <div className="mt-3 p-2 rounded-lg bg-[var(--color-bg)] text-xs text-[var(--color-success)]">{tk.result}</div>}

                        {/* 推进按钮 */}
                        {tk.status !== "done" && (
                          <InlineLoginGate action={t("dispatch.advance")} onConfirm={() => void advance(tk.id)}>
                            {(handleClick) => (
                              <button onClick={handleClick} className="mt-3 px-3 py-1 rounded-lg text-xs bg-[var(--color-surface-2)] hover:bg-[var(--color-primary)] hover:text-white transition-colors">{t("dispatch.advance")}</button>
                            )}
                          </InlineLoginGate>
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

"use client";

import { useState } from "react";
import Link from "next/link";
import { store, genId } from "@/lib/store";
import PageHeader from "@/components/PageHeader";
import { useI18n } from "@/lib/i18n";
import type { PlatformKind, IntegrationState, PricingModel, Currency } from "@/types";

const platforms: { kind: PlatformKind; name: string; emoji: string; badgeKey?: string; authKey: string }[] = [
  { kind: "openclaw", name: "OpenClaw", emoji: "🦾", badgeKey: "integrate.recommended", authKey: "integrate.connectOpenclaw" },
  { kind: "hermes", name: "Hermes Agent", emoji: "⚡", authKey: "integrate.connectHermes" },
  { kind: "cursor", name: "Cursor MCP", emoji: "🖱️", authKey: "integrate.connectCursor" },
  { kind: "claude", name: "Claude Desktop", emoji: "🟠", authKey: "integrate.connectClaude" },
  { kind: "custom", name: "Custom", emoji: "⚙️", authKey: "integrate.connectCustom" },
];

const mockDiscovered = [
  { id: "dc1", kind: "skill", name: "Data Analysis", desc: "Clean / stats / visualize", category: "数据分析" },
  { id: "dc2", kind: "mcp_tool", name: "sql_query", desc: "Run SQL & return results", category: "数据分析" },
  { id: "dc3", kind: "mcp_tool", name: "chart_gen", desc: "ECharts visualizations", category: "数据分析" },
  { id: "dc4", kind: "skill", name: "Report Writing", desc: "Turn analysis into readable reports", category: "写作" },
  { id: "dc5", kind: "a2a_endpoint", name: "/a2a/notify", desc: "A2A task-complete endpoint", category: "开发" },
];

export default function IntegratePage() {
  const { t } = useI18n();
  const [activeKind, setActiveKind] = useState<PlatformKind | null>(null);
  const [state, setState] = useState<IntegrationState>("pending");
  const [selectedCaps, setSelectedCaps] = useState<string[]>([]);
  const [apiKey, setApiKey] = useState("");
  const [form, setForm] = useState({
    name: "", role: "", bio: "",
    pricingModel: "per_task" as PricingModel,
    rate: "199",
    currency: "CNY" as Currency,
  });

  const activePlatform = platforms.find((p) => p.kind === activeKind);
  const stateFlow: { state: IntegrationState; label: string; desc: string }[] = [
    { state: "pending", label: t("integrate.stepSelect"), desc: t("integrate.stepSelectDesc") },
    { state: "authenticating", label: t("integrate.stepAuth"), desc: t("integrate.stepAuthDesc") },
    { state: "discovering", label: t("integrate.stepDiscover"), desc: t("integrate.stepDiscoverDesc") },
    { state: "composing", label: t("integrate.stepCompose"), desc: t("integrate.stepComposeDesc") },
    { state: "connected", label: t("integrate.stepConnected"), desc: t("integrate.stepConnectedDesc") },
  ];
  const stateIdx = stateFlow.findIndex((s) => s.state === state);

  const startAuth = () => { setState("authenticating"); setTimeout(() => setState("discovering"), 1200); };
  const selectCap = (id: string) => setSelectedCaps((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);
  const goToCompose = () => { if (selectedCaps.length) setState("composing"); };
  const publish = () => {
    if (!form.name || !form.role) return;
    store.drafts.push({
      sessionId: genId("session"), platform: activeKind!, state: "connected",
      selectedCapabilityIds: selectedCaps, name: form.name, role: form.role, bio: form.bio,
      pricingModel: form.pricingModel, rate: Number(form.rate), currency: form.currency,
      createdAt: Math.floor(Date.now() / 1000),
    });
    setState("connected");
  };
  const reset = () => {
    setActiveKind(null); setState("pending"); setSelectedCaps([]); setApiKey("");
    setForm({ name: "", role: "", bio: "", pricingModel: "per_task", rate: "199", currency: "CNY" });
  };

  return (
    <div>
      <PageHeader
        emoji="⚡"
        title={t("integrate.title")}
        description={t("integrate.desc")}
        breadcrumbs={[{ label: t("bc.home"), href: "/" }, { label: t("bc.integrate") }]}
      />

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* 状态机进度条 */}
        <div className="glass rounded-2xl p-5 mb-6">
          <div className="flex items-center justify-between overflow-x-auto">
            {stateFlow.map((s, i) => {
              const done = i < stateIdx;
              const current = i === stateIdx;
              return (
                <div key={s.state} className="flex items-center flex-1 min-w-0">
                  <div className="flex flex-col items-center text-center min-w-[80px]">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${done ? "bg-[var(--color-success)] border-[var(--color-success)] text-white" : current ? "bg-[var(--color-primary)] border-[var(--color-primary)] text-white animate-pulse-glow" : "bg-transparent border-[var(--color-border)] text-[var(--color-fg-dim)]"}`}>
                      {done ? "✓" : i + 1}
                    </div>
                    <div className={`text-xs mt-1.5 ${current || done ? "text-[var(--color-fg)]" : "text-[var(--color-fg-dim)]"}`}>{s.label}</div>
                  </div>
                  {i < stateFlow.length - 1 && <div className={`flex-1 h-0.5 mx-1 ${done ? "bg-[var(--color-success)]" : "bg-[var(--color-border)]"}`} />}
                </div>
              );
            })}
          </div>
        </div>

        {/* STEP 1: 选平台 */}
        {!activeKind && (
          <div className="grid sm:grid-cols-2 gap-4">
            {platforms.map((p) => (
              <button key={p.kind} onClick={() => { setActiveKind(p.kind); setState("pending"); }} className="glass glass-hover rounded-2xl p-5 text-left relative">
                {p.badgeKey && (
                  <span className="badge absolute top-4 right-4" style={{ color: "#34d399", background: "rgba(52,211,153,0.12)" }}>{t(p.badgeKey)}</span>
                )}
                <div className="text-3xl mb-3">{p.emoji}</div>
                <h3 className="font-semibold mb-1">{p.name}</h3>
                <div className="mt-3 text-xs text-[var(--color-fg-dim)]">🔐 {t(p.authKey)}</div>
              </button>
            ))}
          </div>
        )}

        {/* STEP 2: 鉴权 */}
        {activeKind && state === "pending" && (
          <div className="glass rounded-2xl p-8 max-w-lg mx-auto text-center">
            <div className="text-4xl mb-3">{activePlatform?.emoji}</div>
            <h2 className="text-xl font-bold mb-6">{activePlatform?.name}</h2>
            {activeKind === "custom" ? (
              <div className="space-y-3 text-left">
                <label className="block text-xs text-[var(--color-fg-muted)]">Base URL
                  <input defaultValue="https://api.worktwin.cn" className="mt-1 w-full px-3 py-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-sm outline-none focus:border-[var(--color-primary)]" />
                </label>
                <label className="block text-xs text-[var(--color-fg-muted)]">API Key
                  <input value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="sk_worktwin_xxx" className="mt-1 w-full px-3 py-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-sm outline-none focus:border-[var(--color-primary)]" />
                </label>
              </div>
            ) : (
              <div className="my-6">
                <div className="w-40 h-40 mx-auto rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center animate-pulse-glow">
                  <span className="text-5xl">📱</span>
                </div>
                <p className="text-xs text-[var(--color-fg-dim)] mt-3">{t("integrate.scanQR")}</p>
              </div>
            )}
            <div className="flex gap-2 justify-center mt-6">
              <button onClick={() => setActiveKind(null)} className="px-4 py-2 rounded-lg text-sm bg-[var(--color-surface)] hover:bg-[var(--color-surface-2)]">{t("integrate.changePlatform")}</button>
              <button onClick={startAuth} disabled={activeKind === "custom" && !apiKey} className="btn-glow px-6 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-40">{t("integrate.startAuth")}</button>
            </div>
          </div>
        )}

        {/* 鉴权中 */}
        {state === "authenticating" && (
          <div className="glass rounded-2xl p-12 text-center">
            <div className="text-4xl mb-4 animate-pulse-glow">{activePlatform?.emoji}</div>
            <p className="text-sm text-[var(--color-fg-muted)]">{t("integrate.authing")}</p>
          </div>
        )}

        {/* STEP 3: 发现能力 */}
        {state === "discovering" && (
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">{t("integrate.discovered")} ({mockDiscovered.length})</h2>
              <span className="text-xs text-[var(--color-fg-dim)]">{activePlatform?.name} · tools/list</span>
            </div>
            <div className="space-y-2 mb-4">
              {mockDiscovered.map((c) => {
                const checked = selectedCaps.includes(c.id);
                return (
                  <label key={c.id} className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${checked ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5" : "border-[var(--color-border)] bg-[var(--color-surface)]"}`}>
                    <input type="checkbox" checked={checked} onChange={() => selectCap(c.id)} className="mt-1 accent-[var(--color-primary)]" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{c.name}</span>
                        <span className="badge" style={{ color: "var(--color-accent)", background: "rgba(34,211,238,0.1)" }}>{c.kind}</span>
                      </div>
                      <p className="text-xs text-[var(--color-fg-muted)] mt-0.5">{c.desc}</p>
                    </div>
                  </label>
                );
              })}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-[var(--color-fg-dim)]">{t("integrate.selected", { n: selectedCaps.length })}</span>
              <button onClick={goToCompose} disabled={selectedCaps.length === 0} className="btn-glow px-5 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-40">{t("integrate.nextCompose")}</button>
            </div>
          </div>
        )}

        {/* STEP 4: 组装员工 */}
        {state === "composing" && (
          <div className="glass rounded-2xl p-6 max-w-2xl mx-auto">
            <h2 className="font-semibold mb-4">{t("integrate.composeTitle")}</h2>
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-3">
                <Field label={t("integrate.fieldName")}>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={t("integrate.fieldNamePh")} className="input" />
                </Field>
                <Field label={t("integrate.fieldRole")}>
                  <input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder={t("integrate.fieldRolePh")} className="input" />
                </Field>
              </div>
              <Field label={t("integrate.fieldBio")}>
                <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={2} placeholder={t("integrate.fieldBioPh")} className="input resize-none" />
              </Field>
              <div className="grid sm:grid-cols-3 gap-3">
                <Field label={t("integrate.fieldPricing")}>
                  <select value={form.pricingModel} onChange={(e) => setForm({ ...form, pricingModel: e.target.value as PricingModel })} className="input">
                    <option value="per_task">{t("card.perTask")}</option>
                    <option value="salary">{t("card.salary")}</option>
                    <option value="subscription">{t("card.subscription")}</option>
                  </select>
                </Field>
                <Field label={t("integrate.fieldPrice")}>
                  <input type="number" value={form.rate} onChange={(e) => setForm({ ...form, rate: e.target.value })} className="input" />
                </Field>
                <Field label={t("integrate.fieldCurrency")}>
                  <select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value as Currency })} className="input">
                    <option value="CNY">{t("integrate.currencyCNY")}</option>
                    <option value="UT">{t("integrate.currencyUT")}</option>
                  </select>
                </Field>
              </div>
            </div>
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-[var(--color-border)]">
              <button onClick={() => setState("discovering")} className="text-sm text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]">{t("integrate.reselect")}</button>
              <button onClick={publish} disabled={!form.name || !form.role} className="btn-glow px-6 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-40">{t("integrate.publish")}</button>
            </div>
          </div>
        )}

        {/* STEP 5: 完成 */}
        {state === "connected" && (
          <div className="glass rounded-2xl p-12 text-center">
            <div className="text-5xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold mb-2">{t("integrate.done")}</h2>
            <p className="text-sm text-[var(--color-fg-muted)] mb-6">
              <strong className="text-[var(--color-fg)]">{form.name || "—"}</strong> {t("integrate.doneDesc")}
            </p>
            <div className="flex gap-2 justify-center">
              <Link href="/market" className="btn-glow px-5 py-2 rounded-lg text-sm font-medium text-white">{t("integrate.goMarket")}</Link>
              <button onClick={reset} className="px-5 py-2 rounded-lg text-sm bg-[var(--color-surface)] hover:bg-[var(--color-surface-2)]">{t("integrate.another")}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs text-[var(--color-fg-muted)] mb-1.5">{label}</span>
      {children}
    </label>
  );
}

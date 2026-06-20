"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { store } from "@/lib/store";
import PageHeader from "@/components/PageHeader";
import { useI18n } from "@/lib/i18n";
import type { PricingModel } from "@/types";

export default function EmployeeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { t, lang } = useI18n();
  const employee = store.employees.find((e) => e.id === id);
  const [hireError, setHireError] = useState("");
  const [hired, setHired] = useState(() =>
    Boolean(
      store.contracts.find(
        (c) =>
          c.employeeId === id &&
          c.employerId === store.currentUserId &&
          c.status === "active"
      )
    )
  );

  if (!employee) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-20 text-center">
        <div className="text-4xl mb-3">🔍</div>
        <h1 className="font-bold mb-2">{t("detail.notFound")}</h1>
        <Link href="/market" className="text-sm text-[var(--color-primary-soft)]">
          {t("detail.back")}
        </Link>
      </div>
    );
  }

  const pricingLabel: Record<PricingModel, string> = {
    salary: t("card.salary"),
    per_task: t("card.perTask"),
    subscription: t("card.subscription"),
  };

  const hire = async () => {
    setHireError("");
    try {
      await store.hireEmployee(employee.id);
      setHired(true);
    } catch (error) {
      setHireError(error instanceof Error ? error.message : (lang === "zh" ? "雇佣失败，请稍后重试。" : "Hiring failed. Try again later."));
    }
  };

  const isOwner = employee.ownerId === store.currentUserId;

  return (
    <div>
      <PageHeader
        title={employee.name}
        breadcrumbs={[
          { label: t("bc.home"), href: "/" },
          { label: t("bc.market"), href: "/market" },
          { label: t("bc.employeeDetail") },
        ]}
      />

      <div className="max-w-5xl mx-auto px-6 py-8">
        <button onClick={() => router.back()} className="text-xs text-[var(--color-fg-dim)] hover:text-[var(--color-fg)] mb-4">
          ← {t("detail.back").replace("← ", "")}
        </button>

        {/* 头部 */}
        <div className="glass rounded-2xl p-6 mb-6">
          <div className="flex items-start gap-5 flex-wrap">
            <div className="w-20 h-20 rounded-2xl bg-[var(--color-surface-2)] flex items-center justify-center text-4xl">
              {employee.avatar}
            </div>
            <div className="flex-1 min-w-[200px]">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold">{employee.name}</h1>
                <span className="badge" style={{ color: employee.ownerType === "agent" ? "#a48bff" : "#22d3ee", background: employee.ownerType === "agent" ? "rgba(124,92,255,0.12)" : "rgba(34,211,238,0.12)" }}>
                  {employee.ownerType === "agent" ? "🤖 Agent" : "👤 Human"}
                </span>
              </div>
              <p className="text-sm text-[var(--color-fg-muted)] mt-1">{employee.title}</p>
              <p className="text-sm text-[var(--color-fg-muted)] mt-2 max-w-2xl">{employee.bio}</p>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {employee.tags.map((tag) => (
                  <span key={tag} className="badge" style={{ color: "var(--color-primary-soft)", background: "rgba(124,92,255,0.1)" }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-[var(--color-fg-dim)]">{pricingLabel[employee.pricingModel]}</div>
              <div className="text-3xl font-bold gradient-text">
                {employee.rate}
                <span className="text-sm text-[var(--color-fg-muted)] ml-1">{employee.currency}</span>
              </div>
              {isOwner ? (
                <Link href="/studio" className="mt-3 inline-block px-4 py-2 rounded-lg text-xs font-medium bg-[var(--color-surface-2)] hover:bg-[var(--color-primary)] hover:text-white transition-colors">
                  {lang === "zh" ? "管理我的分身" : "Manage my twin"}
                </Link>
              ) : hired ? (
                <Link href="/dispatch" className="mt-3 inline-block px-4 py-2 rounded-lg text-xs font-medium bg-[var(--color-success)] text-white">
                  {t("detail.hired")}
                </Link>
              ) : (
                <button onClick={() => void hire()} disabled={employee.status === "offline"} className="btn-glow mt-3 px-4 py-2 rounded-lg text-xs font-medium text-white disabled:opacity-40">
                  {t("detail.hire")}
                </button>
              )}
              {hireError && <p className="mt-2 max-w-48 text-xs text-[var(--color-danger)]">{hireError}</p>}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            {/* 能力清单 */}
            <section className="glass rounded-2xl p-6">
              <h2 className="font-semibold mb-4">{t("detail.capabilities")}</h2>
              <div className="space-y-3">
                {employee.capabilities.map((c) => (
                  <div key={c.id} className="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-medium text-sm">{c.name}</h3>
                      <span className="badge" style={{ color: "var(--color-accent)", background: "rgba(34,211,238,0.1)" }}>
                        {c.kind}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--color-fg-muted)]">{c.description}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* 样例作品 */}
            <section className="glass rounded-2xl p-6">
              <h2 className="font-semibold mb-4">{t("detail.examples")}</h2>
              <ul className="space-y-2">
                {employee.resume.examples.map((ex, i) => (
                  <li key={i} className="flex items-center gap-3 p-3 rounded-lg bg-[var(--color-surface)] text-sm">
                    <span className="text-[var(--color-primary-soft)]">▸</span>
                    {ex}
                  </li>
                ))}
              </ul>
            </section>

            {/* 评价 */}
            <section className="glass rounded-2xl p-6">
              <h2 className="font-semibold mb-4">
                {t("detail.reviews")} ({employee.resume.reviews.length})
              </h2>
              {employee.resume.reviews.length === 0 ? (
                <p className="text-sm text-[var(--color-fg-dim)]">{t("detail.noReviews")}</p>
              ) : (
                <div className="space-y-3">
                  {employee.resume.reviews.map((r) => (
                    <div key={r.id} className="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">{r.fromName}</span>
                        <span className="text-xs text-[var(--color-warning)]">{"★".repeat(r.rating)}</span>
                      </div>
                      <p className="text-xs text-[var(--color-fg-muted)]">{r.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* 右侧 */}
          <div className="space-y-6">
            <section className="glass rounded-2xl p-6">
              <h2 className="font-semibold mb-4">{t("detail.resume")}</h2>
              <div className="space-y-3 text-sm">
                <Row label={t("detail.rating")}>
                  <span className="font-bold text-[var(--color-warning)]">★ {employee.resume.rating}</span>
                </Row>
                <Row label={t("detail.completedOrders")}>
                  <span className="font-bold">{employee.resume.completedCount}</span>
                </Row>
                <Row label={t("detail.ownership")}>{employee.ownerName}</Row>
                <Row label={t("detail.bindings")}>
                  {employee.bindings.map((b) => b.platform).join(", ")}
                </Row>
              </div>
            </section>

            <section className="glass rounded-2xl p-6">
              <h2 className="font-semibold mb-3">{t("detail.agentCard")}</h2>
              <p className="text-xs text-[var(--color-fg-dim)] mb-3">{t("detail.agentCardDesc")}</p>
              <pre className="text-xs bg-[var(--color-bg)] p-3 rounded-lg overflow-x-auto border border-[var(--color-border)] text-[var(--color-accent)]">
{JSON.stringify(employee.agentCard, null, 2)}
              </pre>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-[var(--color-fg-muted)]">{label}</span>
      <span>{children}</span>
    </div>
  );
}

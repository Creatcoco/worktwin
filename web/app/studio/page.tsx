"use client";

import { store } from "@/lib/store";
import PageHeader from "@/components/PageHeader";
import { useI18n } from "@/lib/i18n";

export default function StudioPage() {
  const { t } = useI18n();
  const allEmployees = store.employees;

  return (
    <div>
      <PageHeader
        emoji="👤"
        title={t("studio.title")}
        description={t("studio.desc")}
        breadcrumbs={[{ label: t("bc.home"), href: "/" }, { label: t("bc.studio") }]}
      />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <section className="glass rounded-2xl p-6 mb-6">
          <h2 className="font-semibold mb-1">{t("studio.templates")}</h2>
          <p className="text-xs text-[var(--color-fg-dim)] mb-4">{t("studio.templatesDesc")}</p>
          <a href="/integrate" className="btn-glow mt-2 inline-block px-4 py-2 rounded-lg text-xs font-medium text-white">
            {t("studio.newFromIntegrate")}
          </a>
        </section>

        <section>
          <h2 className="font-semibold mb-4">{t("studio.allTwins")} ({allEmployees.length})</h2>
          <div className="space-y-3">
            {allEmployees.map((e) => (
              <div key={e.id} className="glass rounded-2xl p-5 flex items-center gap-4 flex-wrap">
                <div className="w-12 h-12 rounded-xl bg-[var(--color-surface-2)] flex items-center justify-center text-2xl">{e.avatar}</div>
                <div className="flex-1 min-w-[180px]">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm">{e.name}</h3>
                    <span className="badge" style={{ color: e.status === "available" ? "#34d399" : e.status === "hired" ? "#fbbf24" : "#646c87", background: e.status === "available" ? "rgba(52,211,153,0.12)" : e.status === "hired" ? "rgba(251,191,36,0.12)" : "rgba(100,108,135,0.12)" }}>
                      {e.status === "available" ? t("card.available") : e.status === "hired" ? t("card.hired") : t("card.offline")}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--color-fg-muted)] mt-0.5">
                    {e.role} · {e.capabilities.length} · ★ {e.resume.rating} · {e.resume.completedCount}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold">{e.rate} {e.currency}</div>
                  <div className="text-xs text-[var(--color-fg-dim)]">
                    {e.pricingModel === "per_task" ? t("card.perTask") : e.pricingModel === "salary" ? t("card.salary") : t("card.subscription")}
                  </div>
                </div>
                <a href={`/market/${e.id}`} className="px-3 py-1.5 rounded-lg text-xs bg-[var(--color-surface-2)] hover:bg-[var(--color-primary)] hover:text-white transition-colors">
                  {t("studio.detail")}
                </a>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

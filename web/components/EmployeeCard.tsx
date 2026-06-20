"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import type {
  DigitalEmployee,
  EmployeeStatus,
  PricingModel,
} from "@/types";

export default function EmployeeCard({
  employee,
}: {
  employee: DigitalEmployee;
}) {
  const { t } = useI18n();

  const statusConfig: Record<
    EmployeeStatus,
    { label: string; color: string; bg: string }
  > = {
    available: { label: t("card.available"), color: "#34d399", bg: "rgba(52,211,153,0.12)" },
    hired: { label: t("card.hired"), color: "#fbbf24", bg: "rgba(251,191,36,0.12)" },
    offline: { label: t("card.offline"), color: "#646c87", bg: "rgba(100,108,135,0.12)" },
  };

  const pricingLabel: Record<PricingModel, string> = {
    salary: t("card.salary"),
    per_task: t("card.perTask"),
    subscription: t("card.subscription"),
  };

  const unit = employee.pricingModel === "per_task" ? t("card.perTaskUnit") : t("card.perMonthUnit");
  const ownerTag = employee.ownerType === "agent" ? "🤖 Agent" : "👤 Human";

  const s = statusConfig[employee.status];

  return (
    <div className="glass glass-hover rounded-2xl p-5 flex flex-col">
      {/* 头部 */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[var(--color-surface-2)] flex items-center justify-center text-2xl">
            {employee.avatar}
          </div>
          <div>
            <h3 className="font-semibold text-[15px] leading-tight">
              {employee.name}
            </h3>
            <p className="text-xs text-[var(--color-fg-dim)] mt-0.5">
              {employee.role}
            </p>
          </div>
        </div>
        <span className="badge" style={{ color: s.color, background: s.bg }}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.color }} />
          {s.label}
        </span>
      </div>

      <p className="text-xs text-[var(--color-fg-muted)] line-clamp-2 mb-3 min-h-[32px]">
        {employee.bio}
      </p>

      {/* 能力标签 */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {employee.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="badge"
            style={{ color: "var(--color-primary-soft)", background: "rgba(124,92,255,0.1)" }}
          >
            {tag}
          </span>
        ))}
      </div>

      {/* 简历指标 */}
      <div className="flex items-center gap-3 text-xs text-[var(--color-fg-dim)] mb-4 pb-4 border-b border-[var(--color-border)]">
        <span className="flex items-center gap-1">
          <span className="text-[var(--color-warning)]">★</span>
          {employee.resume.rating}
        </span>
        <span>·</span>
        <span>{t("card.completed")} {employee.resume.completedCount}</span>
        <span>·</span>
        <span>{ownerTag}</span>
      </div>

      {/* 价格 + CTA */}
      <div className="mt-auto flex items-end justify-between">
        <div>
          <div className="text-xs text-[var(--color-fg-dim)]">
            {pricingLabel[employee.pricingModel]}
          </div>
          <div className="text-lg font-bold">
            {employee.rate}
            <span className="text-xs text-[var(--color-fg-muted)] ml-1">
              {employee.currency}
              {unit}
            </span>
          </div>
        </div>
        <Link
          href={`/market/${employee.id}`}
          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--color-surface-2)] hover:bg-[var(--color-primary)] hover:text-white transition-colors"
        >
          {t("market.viewResume")}
        </Link>
      </div>
    </div>
  );
}

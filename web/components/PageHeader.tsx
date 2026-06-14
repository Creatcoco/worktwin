"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";

interface PageHeaderProps {
  title: string;
  description?: string;
  emoji?: string;
  actions?: React.ReactNode;
  breadcrumbs?: { label: string; href?: string }[];
}

export default function PageHeader({
  title,
  description,
  emoji,
  actions,
  breadcrumbs,
}: PageHeaderProps) {
  const { t } = useI18n();
  return (
    <div className="border-b border-[var(--color-border)] bg-[rgba(12,14,26,0.5)]">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {breadcrumbs && (
          <nav className="flex items-center gap-2 text-xs text-[var(--color-fg-dim)] mb-3">
            {breadcrumbs.map((b, i) => (
              <span key={i} className="flex items-center gap-2">
                {i > 0 && <span>/</span>}
                {b.href ? (
                  <Link href={b.href} className="hover:text-[var(--color-primary-soft)]">
                    {b.label}
                  </Link>
                ) : (
                  <span className="text-[var(--color-fg-muted)]">{b.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-3">
              {emoji && <span>{emoji}</span>}
              {title}
            </h1>
            {description && (
              <p className="mt-2 text-sm text-[var(--color-fg-muted)] max-w-2xl">
                {description}
              </p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import { store } from "@/lib/store";
import EmployeeCard from "@/components/EmployeeCard";
import PageHeader from "@/components/PageHeader";
import { useI18n } from "@/lib/i18n";
import type { OwnerType } from "@/types";

const categoryKeys = [
  { key: "all", zh: "全部", en: "All" },
  { key: "数据分析", zh: "数据分析", en: "Data" },
  { key: "翻译", zh: "翻译", en: "Translation" },
  { key: "设计", zh: "设计", en: "Design" },
  { key: "开发", zh: "开发", en: "Dev" },
  { key: "写作", zh: "写作", en: "Writing" },
  { key: "营销", zh: "营销", en: "Marketing" },
  { key: "客服", zh: "客服", en: "Support" },
];

export default function MarketPage() {
  const { t, lang } = useI18n();
  const [category, setCategory] = useState("all");
  const [ownerType, setOwnerType] = useState<"all" | OwnerType>("all");
  const [sort, setSort] = useState("rating");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    let list = [...store.employees];
    if (category !== "all") {
      list = list.filter((e) => e.tags.includes(category) || e.capabilities.some((c) => c.category === category));
    }
    if (ownerType !== "all") list = list.filter((e) => e.ownerType === ownerType);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.bio.toLowerCase().includes(q) ||
          e.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    }
    list.sort((a, b) => {
      if (sort === "rating") return b.resume.rating - a.resume.rating;
      if (sort === "completed") return b.resume.completedCount - a.resume.completedCount;
      if (sort === "price_asc") return a.rate - b.rate;
      if (sort === "price_desc") return b.rate - a.rate;
      return 0;
    });
    return list;
  }, [category, ownerType, sort, query]);

  const ownerOptions: { value: "all" | OwnerType; label: string }[] = [
    { value: "all", label: t("market.ownerAll") },
    { value: "human", label: t("market.ownerHuman") },
    { value: "agent", label: t("market.ownerAgent") },
  ];

  const sortOptions = [
    { value: "rating", label: t("market.sortRating") },
    { value: "completed", label: t("market.sortCompleted") },
    { value: "price_asc", label: t("market.sortPriceAsc") },
    { value: "price_desc", label: t("market.sortPriceDesc") },
  ];

  return (
    <div>
      <PageHeader
        emoji="🤝"
        title={t("market.title")}
        description={t("market.desc")}
        breadcrumbs={[{ label: t("bc.home"), href: "/" }, { label: t("bc.market") }]}
      />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* 搜索 + 筛选条 */}
        <div className="glass rounded-2xl p-4 mb-6 flex flex-col gap-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("market.searchPlaceholder")}
            className="w-full px-4 py-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] focus:border-[var(--color-primary)] outline-none text-sm"
          />
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex flex-wrap gap-1.5">
              {categoryKeys.map((c) => (
                <button
                  key={c.key}
                  onClick={() => setCategory(c.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
                    category === c.key
                      ? "bg-[var(--color-primary)] text-white"
                      : "bg-[var(--color-surface)] text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]"
                  }`}
                >
                  {lang === "zh" ? c.zh : c.en}
                </button>
              ))}
            </div>
            <div className="flex-1" />
            <div className="flex items-center gap-1.5">
              {ownerOptions.map((o) => (
                <button
                  key={o.value}
                  onClick={() => setOwnerType(o.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
                    ownerType === o.value
                      ? "bg-[var(--color-surface-2)] text-[var(--color-fg)] border border-[var(--color-primary)]"
                      : "bg-[var(--color-surface)] text-[var(--color-fg-muted)]"
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="px-3 py-1.5 rounded-lg text-xs bg-[var(--color-surface)] border border-[var(--color-border)] outline-none"
            >
              {sortOptions.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-xs text-[var(--color-fg-dim)] mb-4">
          {t("market.resultCount", { n: filtered.length })}
        </div>

        {filtered.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center text-[var(--color-fg-dim)]">
            {t("market.empty")}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((e) => (
              <EmployeeCard key={e.id} employee={e} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

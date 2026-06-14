"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n, type Lang } from "@/lib/i18n";

const options: { value: Lang; label: string; flag: string }[] = [
  { value: "zh", label: "中文", flag: "🇨🇳" },
  { value: "en", label: "English", flag: "🇺🇸" },
];

export default function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { lang, setLang } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // 点击外部关闭
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const current = options.find((o) => o.value === lang)!;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Language"
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] hover:bg-[var(--color-surface)] transition-colors ${
          compact ? "text-xs" : ""
        }`}
      >
        <span className="text-base leading-none">🌐</span>
        <span className="font-medium">{current.label}</span>
        <span
          className={`text-[10px] transition-transform ${open ? "rotate-180" : ""}`}
        >
          ▾
        </span>
      </button>

      {open && (
        <div className="absolute right-0 mt-1 w-40 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xl overflow-hidden z-50">
          {options.map((o) => (
            <button
              key={o.value}
              onClick={() => {
                setLang(o.value);
                setOpen(false);
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors ${
                o.value === lang
                  ? "text-[var(--color-primary-soft)] bg-[var(--color-primary)]/10"
                  : "text-[var(--color-fg-muted)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-fg)]"
              }`}
            >
              <span className="text-base">{o.flag}</span>
              <span className="flex-1 text-left">{o.label}</span>
              {o.value === lang && <span className="text-xs">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

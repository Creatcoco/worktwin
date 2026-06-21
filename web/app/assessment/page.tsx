"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import InlineLoginGate from "@/components/InlineLoginGate";
import PageHeader from "@/components/PageHeader";
import { useI18n } from "@/lib/i18n";

interface Question {
  qKey: string;
  options: { labelKey: string; tags: string[]; value: number }[];
}

const questions: Question[] = [
  {
    qKey: "assessment.q1",
    options: [
      { labelKey: "assessment.q1a1", tags: ["数据分析", "商业洞察"], value: 3 },
      { labelKey: "assessment.q1a2", tags: ["UI 设计", "品牌"], value: 3 },
      { labelKey: "assessment.q1a3", tags: ["全栈开发", "代码审查"], value: 3 },
      { labelKey: "assessment.q1a4", tags: ["文案写作", "SEO"], value: 3 },
    ],
  },
  {
    qKey: "assessment.q2",
    options: [
      { labelKey: "assessment.q2a1", tags: ["逻辑思维"], value: 2 },
      { labelKey: "assessment.q2a2", tags: ["用户视角", "设计"], value: 2 },
      { labelKey: "assessment.q2a3", tags: ["工程", "开发"], value: 2 },
      { labelKey: "assessment.q2a4", tags: ["营销", "增长"], value: 2 },
    ],
  },
  {
    qKey: "assessment.q3",
    options: [
      { labelKey: "assessment.q3a1", tags: ["per_task"], value: 1 },
      { labelKey: "assessment.q3a2", tags: ["subscription"], value: 1 },
      { labelKey: "assessment.q3a3", tags: ["salary"], value: 1 },
      { labelKey: "assessment.q3a4", tags: ["per_task"], value: 1 },
    ],
  },
  {
    qKey: "assessment.q4",
    options: [
      { labelKey: "assessment.q4a1", tags: ["agent", "7×24"], value: 2 },
      { labelKey: "assessment.q4a2", tags: ["human"], value: 1 },
      { labelKey: "assessment.q4a3", tags: ["human"], value: 1 },
    ],
  },
  {
    qKey: "assessment.q5",
    options: [
      { labelKey: "assessment.q5a1", tags: ["开发", "cursor"], value: 2 },
      { labelKey: "assessment.q5a2", tags: ["agent", "openclaw"], value: 2 },
      { labelKey: "assessment.q5a3", tags: ["数据分析"], value: 2 },
      { labelKey: "assessment.q5a4", tags: ["设计"], value: 2 },
    ],
  },
];

// 添加问答文案到字典需要扩展——这里用 inline 字典避免改动 i18n.tsx
const qLabels: Record<string, { zh: string; en: string }> = {
  "assessment.q1": { zh: "你最擅长哪类工作？", en: "What kind of work are you best at?" },
  "assessment.q1a1": { zh: "和数据打交道 — 分析、统计、可视化", en: "Data — analysis, stats, visualization" },
  "assessment.q1a2": { zh: "把想法变成设计稿或视觉作品", en: "Turn ideas into design or visuals" },
  "assessment.q1a3": { zh: "写代码、做产品、搭系统", en: "Code, product, systems" },
  "assessment.q1a4": { zh: "写文案、做内容、搞营销", en: "Copywriting, content, marketing" },
  "assessment.q2": { zh: "面对一个新任务，你的第一反应是？", en: "First instinct on a new task?" },
  "assessment.q2a1": { zh: "先理清逻辑和结构", en: "Clarify logic & structure first" },
  "assessment.q2a2": { zh: "先想最终用户看到什么", en: "Think about end-user experience" },
  "assessment.q2a3": { zh: "先评估技术可行性", en: "Assess technical feasibility" },
  "assessment.q2a4": { zh: "先想怎么传播和变现", en: "How to spread & monetize" },
  "assessment.q3": { zh: "你希望你的能力以什么形式变现？", en: "How do you want to monetize?" },
  "assessment.q3a1": { zh: "按任务计件 — 做一单收一单", en: "Per task — get paid per job" },
  "assessment.q3a2": { zh: "月度订阅 — 稳定被动收入", en: "Monthly subscription" },
  "assessment.q3a3": { zh: "全职月薪 — 长期合作", en: "Full-time salary" },
  "assessment.q3a4": { zh: "都行，看任务量", en: "Any — depends on volume" },
  "assessment.q4": { zh: "你能投入的时间是？", en: "How much time can you commit?" },
  "assessment.q4a1": { zh: "7×24 — 我睡觉 Agent 也能接单", en: "24/7 — agent works while I sleep" },
  "assessment.q4a2": { zh: "工作时间为主", en: "Work hours mainly" },
  "assessment.q4a3": { zh: "业余时间接单", en: "Spare time only" },
  "assessment.q5": { zh: "你最常用的工具链是？", en: "Your go-to toolchain?" },
  "assessment.q5a1": { zh: "Cursor / VSCode 等编辑器", en: "Cursor / VSCode editors" },
  "assessment.q5a2": { zh: "OpenClaw / Claude Desktop 等 Agent", en: "OpenClaw / Claude Desktop agents" },
  "assessment.q5a3": { zh: "Excel / SQL / BI 工具", en: "Excel / SQL / BI tools" },
  "assessment.q5a4": { zh: "Figma / PS 等设计工具", en: "Figma / PS design tools" },
};

const suggestedPrices: Record<string, { model: string; rate: number; currency: string }> = {
  数据分析: { model: "per_task", rate: 199, currency: "CNY" },
  "UI 设计": { model: "per_task", rate: 499, currency: "CNY" },
  全栈开发: { model: "salary", rate: 8000, currency: "CNY" },
  文案写作: { model: "per_task", rate: 299, currency: "CNY" },
  SEO: { model: "per_task", rate: 399, currency: "CNY" },
};

export default function AssessmentPage() {
  const { t, lang } = useI18n();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [done, setDone] = useState(false);

  const L = (key: string) => (qLabels[key] ? qLabels[key][lang] : key);

  const choose = (optIdx: number) => {
    const next = [...answers];
    next[step] = optIdx;
    setAnswers(next);
    if (step < questions.length - 1) setTimeout(() => setStep(step + 1), 200);
    else setTimeout(() => setDone(true), 200);
  };

  const allTags: { tag: string; count: number }[] = [];
  if (done) {
    const tagCount: Record<string, number> = {};
    answers.forEach((a, i) => {
      questions[i].options[a].tags.forEach((tag) => { tagCount[tag] = (tagCount[tag] || 0) + 1; });
    });
    Object.entries(tagCount).sort(([, a], [, b]) => b - a).forEach(([tag, count]) => allTags.push({ tag, count }));
  }
  const topTag = allTags[0]?.tag || "数据分析";
  const price = suggestedPrices[topTag] || suggestedPrices["数据分析"];
  const progress = ((step + (done ? 1 : 0)) / questions.length) * 100;

  return (
    <div>
      <PageHeader
        emoji="🧠"
        title={t("assessment.title")}
        description={t("assessment.desc")}
        breadcrumbs={[{ label: t("bc.home"), href: "/" }, { label: t("bc.assessment") }]}
      />

      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="mb-8">
          <div className="flex justify-between text-xs text-[var(--color-fg-dim)] mb-2">
            <span>{done ? t("assessment.complete") : t("assessment.step", { n: step + 1, total: questions.length })}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-[var(--color-surface)] overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {!done ? (
          <div className="glass rounded-2xl p-8">
            <h2 className="text-xl font-bold mb-6">{L(questions[step].qKey)}</h2>
            <div className="space-y-3">
              {questions[step].options.map((o, i) => (
                <button key={i} onClick={() => choose(i)} className="w-full text-left p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 transition-all text-sm">
                  {L(o.labelKey)}
                </button>
              ))}
            </div>
            {step > 0 && (
              <button onClick={() => setStep(step - 1)} className="mt-4 text-xs text-[var(--color-fg-dim)] hover:text-[var(--color-fg)]">{t("assessment.prev")}</button>
            )}
          </div>
        ) : (
          <div className="glass rounded-2xl p-8">
            <div className="text-center mb-6">
              <div className="text-5xl mb-3">🎯</div>
              <h2 className="text-2xl font-bold gradient-text mb-2">{t("assessment.result")}</h2>
              <p className="text-sm text-[var(--color-fg-muted)]">{t("assessment.resultDesc")}</p>
            </div>
            <div className="mb-6">
              <h3 className="text-xs text-[var(--color-fg-dim)] mb-2">{t("assessment.tags")}</h3>
              <div className="flex flex-wrap gap-2">
                {allTags.slice(0, 6).map(({ tag, count }) => (
                  <span key={tag} className="badge" style={{ color: "var(--color-primary-soft)", background: `rgba(124,92,255,${0.05 + count * 0.06})`, fontSize: "12px", padding: "4px 10px" }}>
                    {tag} × {count}
                  </span>
                ))}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] mb-6">
              <div className="text-xs text-[var(--color-fg-dim)] mb-1">{t("assessment.suggestedPrice")}</div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-[var(--color-success)]">{price.rate}</span>
                <span className="text-sm text-[var(--color-fg-muted)]">{price.currency} / {price.model === "per_task" ? t("card.perTask") : price.model === "salary" ? t("card.salary") : t("card.subscription")}</span>
              </div>
              <div className="text-xs text-[var(--color-fg-dim)] mt-1">{t("assessment.coreSkill")}<strong className="text-[var(--color-fg)]">{topTag}</strong></div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <InlineLoginGate action={t("assessment.useResult")} onConfirm={() => router.push("/integrate")}>
                {(handleClick) => (
                  <button onClick={handleClick} className="btn-glow flex-1 py-2.5 rounded-xl text-sm font-medium text-white">{t("assessment.useResult")}</button>
                )}
              </InlineLoginGate>
              <button onClick={() => { setStep(0); setAnswers([]); setDone(false); }} className="px-4 py-2.5 rounded-xl text-sm bg-[var(--color-surface)] hover:bg-[var(--color-surface-2)]">{t("assessment.retake")}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

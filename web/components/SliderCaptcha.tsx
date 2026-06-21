"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";

type PuzzleData = {
  token: string;
  bgDataUrl: string;
  puzzleDataUrl: string;
  puzzleSize: number;
  trackWidth: number;
  canvasWidth: number;
  canvasHeight: number;
  puzzleY: number;
};

type Status = "loading" | "ready" | "dragging" | "success" | "fail";

type Props = {
  /** 验证通过时回调，返回服务端要校验的 token 与用户拖动的 X 坐标 */
  onVerified: (token: string, x: number) => void;
  /** 重置回未验证状态时回调（清掉父组件持有的验证结果） */
  onReset?: () => void;
};

const SLIDER_WIDTH = 42; // 滑块按钮宽度，与 puzzleSize 对齐

export default function SliderCaptcha({ onVerified, onReset }: Props) {
  const { t } = useI18n();
  const [puzzle, setPuzzle] = useState<PuzzleData | null>(null);
  const [status, setStatus] = useState<Status>("loading");
  const [offset, setOffset] = useState(0); // 当前拼图块/滑块的 X 偏移
  const [error, setError] = useState("");

  const trackRef = useRef<HTMLDivElement>(null);
  const dragStartX = useRef(0);
  const startOffset = useRef(0);

  // 用 ref 存最新回调，避免回调引用变化导致换图（输入时父组件 re-render 传新内联函数会误触发）
  const onResetRef = useRef(onReset);
  const onVerifiedRef = useRef(onVerified);
  useEffect(() => {
    onResetRef.current = onReset;
    onVerifiedRef.current = onVerified;
  });

  /** 从服务端拉取新拼图。依赖刻意为空：只在挂载和用户点「换一张」时调用 */
  const loadPuzzle = useCallback(async () => {
    setStatus("loading");
    setError("");
    setOffset(0);
    onResetRef.current?.();
    try {
      const res = await fetch("/api/auth/captcha", { cache: "no-store" });
      if (res.status === 429) {
        setError(t("captcha.rateLimited"));
        setStatus("fail");
        return;
      }
      if (!res.ok) {
        setError(t("captcha.loadFailed"));
        setStatus("fail");
        return;
      }
      const data = (await res.json()) as PuzzleData;
      setPuzzle(data);
      setStatus("ready");
    } catch {
      setError(t("captcha.loadFailed"));
      setStatus("fail");
    }
  }, [t]);

  // 仅在组件挂载时加载一次拼图，输入打字不应触发刷新
  useEffect(() => {
    const timer = window.setTimeout(() => void loadPuzzle(), 0);
    return () => window.clearTimeout(timer);
  }, [loadPuzzle]);

  /** 限制偏移在 [0, trackWidth] 内 */
  const clamp = (val: number, max: number) => Math.max(0, Math.min(val, max));

  const handlePointerDown = (e: React.PointerEvent) => {
    if (status !== "ready" || !puzzle) return;
    dragStartX.current = e.clientX;
    startOffset.current = offset;
    setStatus("dragging");
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (status !== "dragging" || !puzzle) return;
    const delta = e.clientX - dragStartX.current;
    setOffset(clamp(startOffset.current + delta, puzzle.trackWidth));
  };

  const handlePointerUp = () => {
    if (status !== "dragging" || !puzzle) return;
    // 松手即提交校验：把当前 offset 交给父组件，由父组件随表单一起提交给服务端
    // 这里先乐观判定为已验证（真正校验在服务端提交时做）
    setStatus("success");
    onVerifiedRef.current(puzzle.token, Math.round(offset));
  };

  return (
    <div className="glass rounded-xl p-3">
      {/* 拼图区域 */}
      <div
        className="relative mx-auto overflow-hidden rounded-lg"
        style={{
          width: puzzle?.canvasWidth ?? 300,
          height: puzzle?.canvasHeight ?? 160,
          background: "var(--color-bg-soft)",
        }}
      >
        {puzzle ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={puzzle.bgDataUrl}
              alt="captcha"
              className="absolute inset-0 h-full w-full select-none"
              draggable={false}
            />
            {/* 拼图块：随 offset 水平移动，垂直定位到 puzzleY 与缺口对齐 */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={puzzle.puzzleDataUrl}
              alt=""
              className={`absolute left-0 select-none ${status === "fail" ? "animate-[shake_0.3s]" : ""}`}
              style={{
                top: puzzle.puzzleY,
                width: puzzle.puzzleSize,
                height: puzzle.puzzleSize,
                transform: `translateX(${offset}px)`,
                filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.4))",
              }}
              draggable={false}
            />
            {status === "success" && (
              <div className="absolute inset-0 flex items-center justify-center bg-emerald-500/15 backdrop-blur-[1px]">
                <span className="text-2xl">✅</span>
              </div>
            )}
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-[var(--color-fg-muted)]">
            {status === "loading" ? t("captcha.loading") : error}
          </div>
        )}
      </div>

      {/* 滑块轨道 */}
      <div
        ref={trackRef}
        className="relative mt-3 h-10 rounded-lg bg-[var(--color-surface)]"
        style={{ width: puzzle?.canvasWidth ?? 300 }}
      >
        {/* 占位提示文字 */}
        {status !== "success" && (
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-xs text-[var(--color-fg-dim)]">
            {status === "fail" ? t("captcha.fail") : t("captcha.hint")}
          </span>
        )}

        {/* 滑动进度条（滑块左侧填充） */}
        <div
          className="absolute left-0 top-0 h-full rounded-lg transition-[width] duration-100"
          style={{
            width: offset + SLIDER_WIDTH,
            background:
              status === "success"
                ? "linear-gradient(90deg, rgba(52,211,153,0.25), rgba(52,211,153,0.4))"
                : status === "fail"
                  ? "linear-gradient(90deg, rgba(248,113,113,0.25), rgba(248,113,113,0.4))"
                  : "linear-gradient(90deg, rgba(124,92,255,0.2), rgba(34,211,238,0.2))",
          }}
        />

        {/* 滑块按钮 */}
        <button
          type="button"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          disabled={!puzzle || status === "success"}
          className="absolute top-1/2 flex touch-none -translate-y-1/2 cursor-grab items-center justify-center rounded-lg border active:cursor-grabbing disabled:cursor-default"
          style={{
            left: offset,
            width: SLIDER_WIDTH,
            height: 36,
            top: "50%",
            marginTop: -18,
            background:
              status === "success"
                ? "var(--color-success)"
                : status === "fail"
                  ? "var(--color-danger)"
                  : "var(--color-surface-2)",
            borderColor:
              status === "success"
                ? "var(--color-success)"
                : status === "fail"
                  ? "var(--color-danger)"
                  : "var(--color-border)",
          }}
          aria-label="拖动滑块完成验证"
        >
          <span className="text-xs text-[var(--color-fg)]">
            {status === "success" ? "✓" : status === "fail" ? "✕" : "→"}
          </span>
        </button>
      </div>

      {/* 底部操作 */}
      <div className="mt-2 flex items-center justify-between">
        <span className="text-[11px] text-[var(--color-fg-dim)]">
          {status === "success"
            ? t("captcha.success")
            : status === "fail"
              ? error || t("captcha.fail")
              : t("captcha.title")}
        </span>
        <button
          type="button"
          onClick={() => void loadPuzzle()}
          className="text-[11px] text-[var(--color-fg-muted)] underline-offset-2 hover:text-[var(--color-primary)] hover:underline"
        >
          ↻ {t("captcha.refresh")}
        </button>
      </div>

      {/* 抖动动画 */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(var(--tx, 0)); }
          25% { transform: translateX(calc(var(--tx, 0px) - 6px)); }
          75% { transform: translateX(calc(var(--tx, 0px) + 6px)); }
        }
      `}</style>
    </div>
  );
}

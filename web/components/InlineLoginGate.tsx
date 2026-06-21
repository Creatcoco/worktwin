"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";

/**
 * 游客写操作内联登录门。
 *
 * 用法（包裹式）：
 * ```tsx
 * <InlineLoginGate action="发布需求" onConfirm={assign}>
 *   {(handleClick) => <button onClick={handleClick}>发布需求</button>}
 * </InlineLoginGate>
 * ```
 *
 * - 已登录：`handleClick` 直接调用 `onConfirm`（真正的写操作）。
 * - 未登录：`handleClick` 阻止执行并弹出居中轻量登录提示弹窗，提供「去登录」与「取消」。
 *
 * 后端 dataAction 仍以 401 兜底，本组件仅做 UX 层拦截，用干净提示替代抛错。
 */
export default function InlineLoginGate({
  action,
  onConfirm,
  children,
}: {
  /** 动作短词，会插值进「登录后即可{action}」文案，如「发布需求」「雇佣」。 */
  action: string;
  /** 已登录时真正执行的动作。 */
  onConfirm: () => void;
  /** 渲染函数，接收 handleClick 绑定到写按钮的 onClick。 */
  children: (handleClick: () => void) => ReactNode;
}) {
  const { user } = useAuth();
  const { t } = useI18n();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const handleClick = () => {
    if (user) {
      onConfirm();
      return;
    }
    setOpen(true);
  };

  return (
    <>
      {children(handleClick)}

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="glass rounded-2xl p-8 max-w-sm w-full text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-4xl mb-3">🔐</div>
            <h3 className="font-bold mb-2">{t("guest.loginToAction", { action })}</h3>
            <p className="text-sm text-[var(--color-fg-muted)] mb-5">{t("guest.loginToActionDesc")}</p>
            <div className="flex items-center justify-center gap-3">
              <Link
                href={`/login?next=${encodeURIComponent(pathname)}`}
                className="btn-glow inline-block px-5 py-2 rounded-lg text-sm font-medium text-white"
              >
                {t("guest.goLogin")}
              </Link>
              <button
                onClick={() => setOpen(false)}
                className="px-5 py-2 rounded-lg text-sm text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] hover:bg-[var(--color-surface)] transition-colors"
              >
                {t("guest.cancel")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

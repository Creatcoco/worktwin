"use client";

import type { ReactNode } from "react";

/**
 * 路由守卫壳。
 *
 * 历史上这里会拦截未登录用户并跳转 /login。为了让游客也能浏览所有主要模块的
 * 演示内容，已移除硬跳转逻辑：所有页面均可进入，写操作由各页内的
 * InlineLoginGate 组件做轻量内联拦截（点击时弹登录提示），后端 dataAction
 * 仍以 401 兜底。
 *
 * 保留组件壳以兼容 layout.tsx 的引用，避免改动布局结构。
 */
export default function RouteGuard({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

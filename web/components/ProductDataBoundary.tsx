"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useProductData } from "@/lib/product-data";

const dataRoutes = ["/market", "/dashboard", "/dispatch", "/integrate", "/settlement", "/studio", "/developer"];

export default function ProductDataBoundary({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { loading, error, refresh } = useProductData();
  const needsData = dataRoutes.some((route) => pathname.startsWith(route));

  if (needsData && loading) {
    return <div className="min-h-[55vh] flex items-center justify-center text-sm text-[var(--color-fg-muted)]">正在读取飞书业务数据...</div>;
  }
  if (needsData && error) {
    return (
      <div className="min-h-[55vh] flex items-center justify-center px-6">
        <div className="glass rounded-2xl p-6 text-center max-w-md">
          <h2 className="font-semibold">业务数据暂不可用</h2>
          <p className="text-sm text-[var(--color-fg-muted)] mt-2">{error}</p>
          <button onClick={() => void refresh()} className="btn-glow mt-4 px-4 py-2 rounded-lg text-sm text-white">重试</button>
        </div>
      </div>
    );
  }
  return children;
}

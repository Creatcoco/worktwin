"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@/lib/auth";
import { forceNext } from "@/lib/client/throttle";
import { store } from "@/lib/store";
import { throttledGet } from "@/lib/client/throttle";
import type {
  DigitalEmployee,
  EmploymentContract,
  IntegrationDraft,
  Settlement,
  TaskOrder,
  User,
} from "@/types";

type ProductSnapshot = {
  employees: DigitalEmployee[];
  user?: User;
  contracts?: EmploymentContract[];
  tasks?: TaskOrder[];
  settlements?: Settlement[];
  drafts?: IntegrationDraft[];
};

type ProductDataContextValue = {
  loading: boolean;
  error: string;
  refresh: () => Promise<boolean>;
};

const ProductDataContext = createContext<ProductDataContextValue | null>(null);
const BOOTSTRAP_URL = "/api/data/bootstrap";

export function ProductDataProvider({ children }: { children: ReactNode }) {
  const { loading: authLoading, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      // 用户主动刷新：绕过冷却窗口立即请求（仍受 in-flight 去重保护）
      forceNext(BOOTSTRAP_URL);
      const payload = await throttledGet<ProductSnapshot>(BOOTSTRAP_URL, { enabled: false });
      if (!payload) {
        setError("无法读取飞书中的真实业务数据，请稍后重试");
        return false;
      }
      store.hydrateRemoteSnapshot(payload);
      return true;
    } catch {
      setError("网络异常，无法连接产品数据服务");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    let active = true;
    void throttledGet<ProductSnapshot>(BOOTSTRAP_URL).then((snapshot) => {
      if (!active) return;
      if (snapshot) {
        store.hydrateRemoteSnapshot(snapshot);
        setError("");
      } else if (user) {
        setError("无法读取飞书中的真实业务数据，请稍后重试");
      }
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [authLoading, user]);

  const value = useMemo(() => ({ loading, error, refresh }), [loading, error, refresh]);
  return <ProductDataContext.Provider value={value}>{children}</ProductDataContext.Provider>;
}

export function useProductData(): ProductDataContextValue {
  const context = useContext(ProductDataContext);
  if (!context) throw new Error("useProductData must be used within ProductDataProvider");
  return context;
}

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
import { store } from "@/lib/store";
import { forceNext, invalidate, throttledGet } from "@/lib/client/throttle";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: "user" | "admin";
}

type AuthResponse = { user: AuthUser | null };

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  refresh: () => Promise<AuthUser | null>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const ME_URL = "/api/auth/me";

async function fetchCurrentUser(force = false): Promise<AuthUser | null> {
  if (force) forceNext(ME_URL);
  // throttledGet 会做 in-flight 去重 + 冷却窗口，并在 429 时优雅降级返回上次结果
  const payload = await throttledGet<AuthResponse>(ME_URL);
  return payload?.user ?? null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const nextUser = await fetchCurrentUser(true);
    setUser(nextUser);
    if (nextUser) store.activateAuthenticatedUser(nextUser);
    setLoading(false);
    return nextUser;
  }, []);

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    invalidate(ME_URL); // 退出后清缓存，下次读取拿最新（未登录）状态
  }, []);

  useEffect(() => {
    let active = true;
    void fetchCurrentUser().then((nextUser) => {
      if (!active) return;
      setUser(nextUser);
      if (nextUser) store.activateAuthenticatedUser(nextUser);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  const value = useMemo(() => ({ user, loading, refresh, logout }), [user, loading, refresh, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}

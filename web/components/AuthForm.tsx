"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { useProductData } from "@/lib/product-data";

export default function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const { refresh } = useAuth();
  const { refresh: refreshProductData } = useProductData();
  const { lang } = useI18n();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isRegister = mode === "register";
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    if (isRegister && !accepted) {
      setError(lang === "zh" ? "请先同意服务条款和隐私政策" : "Please accept the terms and privacy policy");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const payload = (await response.json()) as { message?: string };
      if (!response.ok) {
        setError(payload.message || (lang === "zh" ? "操作失败，请稍后重试" : "Something went wrong"));
        return;
      }

      await refresh();
      await refreshProductData();
      const requested = new URLSearchParams(window.location.search).get("next");
      const target = requested?.startsWith("/") && !requested.startsWith("//") ? requested : "/dashboard";
      router.push(target);
      router.refresh();
    } catch {
      setError(lang === "zh" ? "网络异常，请稍后重试" : "Network error. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="glass rounded-2xl p-6 md:p-8 w-full max-w-md">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center font-bold text-white">W</div>
          <div>
            <div className="font-bold">WorkTwin</div>
            <div className="text-xs text-[var(--color-fg-dim)]">{lang === "zh" ? "你的工作分身" : "Your work twin"}</div>
          </div>
        </div>
        <h1 className="text-2xl font-bold">{isRegister ? (lang === "zh" ? "创建账号" : "Create account") : (lang === "zh" ? "欢迎回来" : "Welcome back")}</h1>
        <p className="text-sm text-[var(--color-fg-muted)] mt-2">
          {isRegister
            ? (lang === "zh" ? "注册后即可接入并上架你的工作分身。" : "Connect and list your work twins after registering.")
            : (lang === "zh" ? "登录后管理分身、任务与结算。" : "Manage twins, tasks and settlements.")}
        </p>
      </div>

      <div className="space-y-4">
        {isRegister && (
          <label className="block">
            <span className="block text-xs text-[var(--color-fg-muted)] mb-1.5">{lang === "zh" ? "姓名" : "Name"}</span>
            <input value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" minLength={2} maxLength={50} required className="input" placeholder={lang === "zh" ? "你的姓名" : "Your name"} />
          </label>
        )}
        <label className="block">
          <span className="block text-xs text-[var(--color-fg-muted)] mb-1.5">{lang === "zh" ? "邮箱" : "Email"}</span>
          <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" autoComplete="email" required className="input" placeholder="name@company.com" />
        </label>
        <label className="block">
          <span className="block text-xs text-[var(--color-fg-muted)] mb-1.5">{lang === "zh" ? "密码" : "Password"}</span>
          <div className="relative">
            <input value={password} onChange={(event) => setPassword(event.target.value)} type={showPassword ? "text" : "password"} autoComplete={isRegister ? "new-password" : "current-password"} minLength={8} maxLength={128} required className="input pr-16" placeholder={lang === "zh" ? "至少 8 个字符" : "At least 8 characters"} />
            <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-xs text-[var(--color-fg-dim)] hover:text-[var(--color-fg)]">
              {showPassword ? (lang === "zh" ? "隐藏" : "Hide") : (lang === "zh" ? "显示" : "Show")}
            </button>
          </div>
        </label>
        {isRegister && (
          <label className="flex items-start gap-3 text-xs text-[var(--color-fg-muted)]">
            <input type="checkbox" checked={accepted} onChange={(event) => setAccepted(event.target.checked)} className="mt-0.5 accent-[var(--color-primary)]" />
            <span>{lang === "zh" ? "我同意服务条款和隐私政策。" : "I agree to the Terms and Privacy Policy."}</span>
          </label>
        )}
      </div>

      {error && <div className="mt-4 rounded-lg border border-[rgba(248,113,113,0.3)] bg-[rgba(248,113,113,0.08)] p-3 text-xs text-[var(--color-danger)]">{error}</div>}

      <button type="submit" disabled={loading} className="btn-glow w-full mt-6 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50">
        {loading
          ? (lang === "zh" ? "处理中..." : "Processing...")
          : isRegister
            ? (lang === "zh" ? "注册并进入工作台" : "Create account")
            : (lang === "zh" ? "登录" : "Sign in")}
      </button>

      <p className="text-center text-xs text-[var(--color-fg-dim)] mt-5">
        {isRegister ? (lang === "zh" ? "已有账号？" : "Already registered?") : (lang === "zh" ? "还没有账号？" : "New to WorkTwin?")}{" "}
        <Link href={isRegister ? "/login" : "/register"} className="text-[var(--color-primary-soft)] hover:text-[var(--color-fg)]">
          {isRegister ? (lang === "zh" ? "去登录" : "Sign in") : (lang === "zh" ? "免费注册" : "Register")}
        </Link>
      </p>
    </form>
  );
}

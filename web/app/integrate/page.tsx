"use client";

import { useState } from "react";
import Link from "next/link";
import { store } from "@/lib/store";
import PageHeader from "@/components/PageHeader";
import InlineLoginGate from "@/components/InlineLoginGate";
import { useI18n } from "@/lib/i18n";
import type { CapabilityKind, PlatformKind, IntegrationState, PricingModel, Currency, DigitalEmployee } from "@/types";

type DiscoveredCapability = {
  id: string;
  kind: CapabilityKind;
  name: string;
  desc: string;
  category: string;
};

const platforms: { kind: PlatformKind; name: string; emoji: string; badgeKey?: string; authKey: string }[] = [
  { kind: "openclaw", name: "OpenClaw", emoji: "🦾", badgeKey: "integrate.recommended", authKey: "integrate.connectOpenclaw" },
  { kind: "hermes", name: "Hermes Agent", emoji: "⚡", authKey: "integrate.connectHermes" },
  { kind: "cursor", name: "Cursor MCP", emoji: "🖱️", authKey: "integrate.connectCursor" },
  { kind: "claude", name: "Claude Desktop", emoji: "🟠", authKey: "integrate.connectClaude" },
  { kind: "custom", name: "Custom", emoji: "⚙️", authKey: "integrate.connectCustom" },
];

const openClawDiscovered: DiscoveredCapability[] = [
  { id: "oc_agent_default", kind: "a2a_endpoint", name: "openclaw/default", desc: "Gateway 默认 Agent，可通过 /v1/responses 或 WebSocket RPC 派活", category: "Agent" },
  { id: "oc_tool_sessions", kind: "mcp_tool", name: "sessions_send", desc: "向指定 OpenClaw 会话发送任务或上下文", category: "会话" },
  { id: "oc_tool_browser", kind: "mcp_tool", name: "browser", desc: "浏览器操作能力，受 Gateway 工具策略与沙箱限制", category: "浏览器" },
  { id: "oc_tool_exec", kind: "mcp_tool", name: "exec", desc: "命令执行能力；上架前建议要求人工确认或沙箱运行", category: "运行时" },
  { id: "oc_skill_research", kind: "skill", name: "Research Skill Pack", desc: "从 SKILL.md 加载的研究/检索工作流指令包", category: "Skill" },
  { id: "oc_plugin_webhooks", kind: "skill_pack", name: "Webhook Plugin Surface", desc: "插件提供的 HTTP/webhook 扩展能力", category: "插件" },
];

const genericDiscovered: DiscoveredCapability[] = [
  { id: "dc1", kind: "skill", name: "Data Analysis", desc: "Clean / stats / visualize", category: "数据分析" },
  { id: "dc2", kind: "mcp_tool", name: "sql_query", desc: "Run SQL & return results", category: "数据分析" },
  { id: "dc3", kind: "mcp_tool", name: "chart_gen", desc: "ECharts visualizations", category: "数据分析" },
  { id: "dc4", kind: "skill", name: "Report Writing", desc: "Turn analysis into readable reports", category: "写作" },
  { id: "dc5", kind: "a2a_endpoint", name: "/a2a/notify", desc: "A2A task-complete endpoint", category: "开发" },
];

const hermesDiscovered: DiscoveredCapability[] = [
  { id: "hm_agent", kind: "a2a_endpoint", name: "hermes_agent", desc: "Hermes Agent 默认入口，按 platform_type=hermes_agent 归入 Agent 路径", category: "Agent" },
  { id: "hm_tool_plan", kind: "mcp_tool", name: "plan_task", desc: "将自然语言需求拆解为可执行步骤", category: "编排" },
  { id: "hm_tool_execute", kind: "mcp_tool", name: "execute_step", desc: "调用 Hermes 侧工具执行单步任务", category: "执行" },
  { id: "hm_tool_report", kind: "mcp_tool", name: "summarize_result", desc: "汇总执行结果并输出验收摘要", category: "交付" },
  { id: "hm_skill_agent_ops", kind: "skill_pack", name: "Agent Ops Pack", desc: "Hermes Agent 的任务编排、状态回传、失败重试能力包", category: "Skill" },
];

const cursorDiscovered: DiscoveredCapability[] = [
  { id: "cu_server_project", kind: "mcp_tool", name: "project_mcp_servers", desc: "从项目或用户级 mcp.json 读取 MCP server 配置", category: "MCP" },
  { id: "cu_tool_repo", kind: "mcp_tool", name: "workspace_context", desc: "读取当前代码仓库、文件树、符号和相关上下文", category: "代码" },
  { id: "cu_tool_edit", kind: "mcp_tool", name: "code_edit", desc: "在 Cursor Agent 中执行代码修改和补丁生成", category: "开发" },
  { id: "cu_tool_terminal", kind: "mcp_tool", name: "terminal_command", desc: "运行项目命令，建议上架为需确认能力", category: "运行时" },
  { id: "cu_skill_review", kind: "skill", name: "Code Review Workflow", desc: "基于仓库上下文的 review / test / fix 工作流", category: "Skill" },
];

const claudeDiscovered: DiscoveredCapability[] = [
  { id: "cl_code_mcp", kind: "mcp_tool", name: "claude_code_mcp", desc: "从 Claude Code MCP 配置读取 HTTP / stdio / ws server", category: "MCP" },
  { id: "cl_desktop_mcp", kind: "mcp_tool", name: "claude_desktop_servers", desc: "读取 Claude Desktop 的 mcpServers 配置和可用工具", category: "桌面" },
  { id: "cl_tool_resources", kind: "mcp_tool", name: "resources_list", desc: "同步 MCP resources、prompts 与 tools/list 能力", category: "资源" },
  { id: "cl_skill", kind: "skill", name: "Claude Skill / Prompt Pack", desc: "将 Claude 侧 prompts / skills 映射为可雇佣工作流", category: "Skill" },
  { id: "cl_channel", kind: "a2a_endpoint", name: "channel_push", desc: "支持外部事件推送到 Claude 会话时，可映射为 Agent 回调入口", category: "事件" },
];

const customDiscovered: DiscoveredCapability[] = [
  { id: "ct_openapi", kind: "mcp_tool", name: "openapi_import", desc: "从 OpenAPI / JSON Schema 生成可调用能力", category: "API" },
  { id: "ct_mcp", kind: "mcp_tool", name: "mcp_tools_list", desc: "通过 MCP initialize + tools/list 发现工具", category: "MCP" },
  { id: "ct_a2a", kind: "a2a_endpoint", name: "a2a_agent_card", desc: "读取 Agent Card，注册 A2A endpoint", category: "A2A" },
  { id: "ct_webhook", kind: "a2a_endpoint", name: "webhook_callback", desc: "任务完成、进度变更、失败重试回调入口", category: "Webhook" },
  { id: "ct_health", kind: "skill", name: "Health & SLA Probe", desc: "定时健康检查、超时阈值、错误语义映射", category: "运维" },
];

const discoveredByPlatform: Record<PlatformKind, DiscoveredCapability[]> = {
  openclaw: openClawDiscovered,
  hermes: hermesDiscovered,
  cursor: cursorDiscovered,
  claude: claudeDiscovered,
  custom: customDiscovered,
};

const openClawChecks = [
  "openclaw gateway status --require-rpc",
  "GET /v1/models 返回 openclaw/default 或 openclaw/<agentId>",
  "Gateway auth token/password 已配置",
  "非 loopback 暴露已走 Tailscale / SSH tunnel / trusted proxy",
];

const hermesChecks = [
  "platform_type 固定为 hermes_agent",
  "Device Auth / API Key 已换取 Hermes access token",
  "MCP initialize 成功并返回 tools/list",
  "任务状态回调 endpoint 已配置",
];

const cursorChecks = [
  "检测项目级 .cursor/mcp.json 或用户级 Cursor MCP 配置",
  "MCP server command / args / env 可启动",
  "tools/list 返回工具目录，terminal 类能力需确认",
  "仅同步当前 workspace 授权范围内的能力",
];

const claudeChecks = [
  "Claude Code 支持 HTTP / stdio / SSE / WebSocket MCP server",
  "Claude Desktop 使用 claude_desktop_config.json 的 mcpServers",
  "读取 tools / prompts / resources，并监听 list_changed",
  "OAuth 或 header token 仅按 server scope 保存",
];

const customChecks = [
  "Base URL / health check 可访问",
  "鉴权 header 或 API Key 有效",
  "OpenAPI / MCP / A2A schema 可解析",
  "幂等、超时、回调和错误码映射已配置",
];

const checksByPlatform: Record<PlatformKind, string[]> = {
  openclaw: openClawChecks,
  hermes: hermesChecks,
  cursor: cursorChecks,
  claude: claudeChecks,
  custom: customChecks,
};

export default function IntegratePage() {
  const { lang, t } = useI18n();
  const [activeKind, setActiveKind] = useState<PlatformKind | null>(null);
  const [state, setState] = useState<IntegrationState>("pending");
  const [selectedCaps, setSelectedCaps] = useState<string[]>([]);
  const [publishedEmployee, setPublishedEmployee] = useState<DigitalEmployee | null>(null);
  const [publishError, setPublishError] = useState("");
  const [openClawConfig, setOpenClawConfig] = useState({
    gatewayUrl: "http://127.0.0.1:18789",
    authToken: "",
    agentId: "default",
    transport: "http",
    exposure: "local",
    allowRiskyTools: false,
  });
  const [hermesConfig, setHermesConfig] = useState({
    authMode: "device",
    platformType: "hermes_agent",
    baseUrl: "https://api.hermes-agent.local",
    agentId: "hermes_agent",
    callbackUrl: "https://api.worktwin.cn/webhooks/hermes",
    accessToken: "",
  });
  const [cursorConfig, setCursorConfig] = useState({
    scope: "project",
    configPath: ".cursor/mcp.json",
    serverName: "worktwin",
    transport: "stdio",
    command: "npx",
    args: "-y @worktwin/cursor-mcp",
    workspaceRoot: "",
  });
  const [claudeConfig, setClaudeConfig] = useState({
    client: "code",
    scope: "project",
    serverName: "worktwin",
    transport: "http",
    serverUrl: "https://api.worktwin.cn/mcp",
    authToken: "",
    configPath: "claude_desktop_config.json",
  });
  const [customConfig, setCustomConfig] = useState({
    baseUrl: "https://api.example.com",
    authHeader: "Authorization",
    apiKey: "",
    schemaType: "openapi",
    schemaUrl: "https://api.example.com/openapi.json",
    healthPath: "/health",
    callbackUrl: "https://api.worktwin.cn/webhooks/custom",
  });
  const [form, setForm] = useState({
    name: "", role: "", bio: "",
    pricingModel: "per_task" as PricingModel,
    rate: "199",
    currency: "CNY" as Currency,
  });

  const activePlatform = platforms.find((p) => p.kind === activeKind);
  const stateFlow: { state: IntegrationState; label: string; desc: string }[] = [
    { state: "pending", label: t("integrate.stepSelect"), desc: t("integrate.stepSelectDesc") },
    { state: "authenticating", label: t("integrate.stepAuth"), desc: t("integrate.stepAuthDesc") },
    { state: "discovering", label: t("integrate.stepDiscover"), desc: t("integrate.stepDiscoverDesc") },
    { state: "composing", label: t("integrate.stepCompose"), desc: t("integrate.stepComposeDesc") },
    { state: "connected", label: t("integrate.stepConnected"), desc: t("integrate.stepConnectedDesc") },
  ];
  const stateIdx = stateFlow.findIndex((s) => s.state === state);
  const discovered = activeKind ? discoveredByPlatform[activeKind] : genericDiscovered;

  const startAuth = () => { setState("authenticating"); setTimeout(() => setState("discovering"), 1200); };
  const selectCap = (id: string) => setSelectedCaps((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);
  const goToCompose = () => { if (selectedCaps.length) setState("composing"); };
  const publish = async () => {
    if (!activeKind || !form.name || !form.role) return;
    setPublishError("");
    try {
      const employee = await store.publishIntegration({
        platform: activeKind,
        selectedCapabilities: discovered.filter((c) => selectedCaps.includes(c.id)),
        name: form.name,
        role: form.role,
        bio: form.bio,
        pricingModel: form.pricingModel,
        rate: Number(form.rate),
        currency: form.currency,
      });
      setPublishedEmployee(employee);
      setState("connected");
    } catch (error) {
      setPublishError(error instanceof Error ? error.message : (lang === "zh" ? "发布失败，请稍后重试。" : "Publish failed. Try again later."));
    }
  };
  const reset = () => {
    setActiveKind(null); setState("pending"); setSelectedCaps([]); setPublishedEmployee(null); setPublishError("");
    setOpenClawConfig({ gatewayUrl: "http://127.0.0.1:18789", authToken: "", agentId: "default", transport: "http", exposure: "local", allowRiskyTools: false });
    setHermesConfig({ authMode: "device", platformType: "hermes_agent", baseUrl: "https://api.hermes-agent.local", agentId: "hermes_agent", callbackUrl: "https://api.worktwin.cn/webhooks/hermes", accessToken: "" });
    setCursorConfig({ scope: "project", configPath: ".cursor/mcp.json", serverName: "worktwin", transport: "stdio", command: "npx", args: "-y @worktwin/cursor-mcp", workspaceRoot: "" });
    setClaudeConfig({ client: "code", scope: "project", serverName: "worktwin", transport: "http", serverUrl: "https://api.worktwin.cn/mcp", authToken: "", configPath: "claude_desktop_config.json" });
    setCustomConfig({ baseUrl: "https://api.example.com", authHeader: "Authorization", apiKey: "", schemaType: "openapi", schemaUrl: "https://api.example.com/openapi.json", healthPath: "/health", callbackUrl: "https://api.worktwin.cn/webhooks/custom" });
    setForm({ name: "", role: "", bio: "", pricingModel: "per_task", rate: "199", currency: "CNY" });
  };

  const canConnect =
    activeKind === "custom"
      ? Boolean(customConfig.baseUrl && customConfig.apiKey)
      : activeKind === "openclaw"
        ? Boolean(openClawConfig.gatewayUrl && openClawConfig.authToken)
        : activeKind === "hermes"
          ? Boolean(hermesConfig.platformType && hermesConfig.baseUrl && (hermesConfig.authMode === "device" || hermesConfig.accessToken))
          : activeKind === "cursor"
            ? Boolean(cursorConfig.configPath && cursorConfig.serverName && (cursorConfig.transport === "http" || cursorConfig.command))
            : activeKind === "claude"
              ? Boolean(claudeConfig.serverName && (claudeConfig.transport === "stdio" || claudeConfig.serverUrl))
              : false;

  return (
    <div>
      <PageHeader
        emoji="⚡"
        title={t("integrate.title")}
        description={t("integrate.desc")}
        breadcrumbs={[{ label: t("bc.home"), href: "/" }, { label: t("bc.integrate") }]}
      />

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* 状态机进度条 */}
        <div className="glass rounded-2xl p-5 mb-6">
          <div className="flex items-center justify-between overflow-x-auto">
            {stateFlow.map((s, i) => {
              const done = i < stateIdx;
              const current = i === stateIdx;
              return (
                <div key={s.state} className="flex items-center flex-1 min-w-0">
                  <div className="flex flex-col items-center text-center min-w-[80px]">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${done ? "bg-[var(--color-success)] border-[var(--color-success)] text-white" : current ? "bg-[var(--color-primary)] border-[var(--color-primary)] text-white animate-pulse-glow" : "bg-transparent border-[var(--color-border)] text-[var(--color-fg-dim)]"}`}>
                      {done ? "✓" : i + 1}
                    </div>
                    <div className={`text-xs mt-1.5 ${current || done ? "text-[var(--color-fg)]" : "text-[var(--color-fg-dim)]"}`}>{s.label}</div>
                  </div>
                  {i < stateFlow.length - 1 && <div className={`flex-1 h-0.5 mx-1 ${done ? "bg-[var(--color-success)]" : "bg-[var(--color-border)]"}`} />}
                </div>
              );
            })}
          </div>
        </div>

        {/* STEP 1: 选平台 */}
        {!activeKind && (
          <div className="grid sm:grid-cols-2 gap-4">
            {platforms.map((p) => (
              <button key={p.kind} onClick={() => { setActiveKind(p.kind); setState("pending"); }} className="glass glass-hover rounded-2xl p-5 text-left relative">
                {p.badgeKey && (
                  <span className="badge absolute top-4 right-4" style={{ color: "#34d399", background: "rgba(52,211,153,0.12)" }}>{t(p.badgeKey)}</span>
                )}
                <div className="text-3xl mb-3">{p.emoji}</div>
                <h3 className="font-semibold mb-1">{p.name}</h3>
                <div className="mt-3 text-xs text-[var(--color-fg-dim)]">🔐 {t(p.authKey)}</div>
              </button>
            ))}
          </div>
        )}

        {/* STEP 2: 鉴权 */}
        {activeKind && state === "pending" && (
          <div className="glass rounded-2xl p-8 mx-auto max-w-4xl">
            <div className="text-4xl mb-3">{activePlatform?.emoji}</div>
            <h2 className="text-xl font-bold mb-2">{activePlatform?.name}</h2>
            {activeKind === "openclaw" && (
              <p className="text-sm text-[var(--color-fg-muted)] mb-6">
                {lang === "zh"
                  ? "连接用户本机或自托管 OpenClaw Gateway，读取 agents / tools / skills 后包装成 WorkTwin 数字员工。"
                  : "Connect a local or self-hosted OpenClaw Gateway, discover agents / tools / skills, then package them as a WorkTwin."}
              </p>
            )}
            {activeKind === "openclaw" ? (
              <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-5 text-left">
                <div className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-3">
                    <Field label={lang === "zh" ? "Gateway URL" : "Gateway URL"}>
                      <input value={openClawConfig.gatewayUrl} onChange={(e) => setOpenClawConfig({ ...openClawConfig, gatewayUrl: e.target.value })} className="input" />
                    </Field>
                    <Field label={lang === "zh" ? "Agent ID" : "Agent ID"}>
                      <input value={openClawConfig.agentId} onChange={(e) => setOpenClawConfig({ ...openClawConfig, agentId: e.target.value })} placeholder="default" className="input" />
                    </Field>
                  </div>
                  <Field label={lang === "zh" ? "Gateway Token / Password" : "Gateway Token / Password"}>
                    <input value={openClawConfig.authToken} onChange={(e) => setOpenClawConfig({ ...openClawConfig, authToken: e.target.value })} type="password" placeholder="OPENCLAW_GATEWAY_TOKEN" className="input" />
                  </Field>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <Field label={lang === "zh" ? "传输方式" : "Transport"}>
                      <select value={openClawConfig.transport} onChange={(e) => setOpenClawConfig({ ...openClawConfig, transport: e.target.value })} className="input">
                        <option value="http">HTTP / OpenAI-compatible</option>
                        <option value="ws">WebSocket Gateway RPC</option>
                      </select>
                    </Field>
                    <Field label={lang === "zh" ? "暴露方式" : "Exposure"}>
                      <select value={openClawConfig.exposure} onChange={(e) => setOpenClawConfig({ ...openClawConfig, exposure: e.target.value })} className="input">
                        <option value="local">Loopback / SSH tunnel</option>
                        <option value="vpn">Tailscale / VPN</option>
                        <option value="proxy">Trusted proxy</option>
                      </select>
                    </Field>
                  </div>
                  <label className="flex items-start gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-sm">
                    <input type="checkbox" checked={openClawConfig.allowRiskyTools} onChange={(e) => setOpenClawConfig({ ...openClawConfig, allowRiskyTools: e.target.checked })} className="mt-1 accent-[var(--color-primary)]" />
                    <span>
                      <span className="block font-medium">{lang === "zh" ? "允许发现高风险工具" : "Discover high-risk tools"}</span>
                      <span className="block text-xs text-[var(--color-fg-dim)] mt-0.5">
                        {lang === "zh" ? "如 exec、browser、file write。默认会标记为需人工确认或沙箱运行。" : "Examples: exec, browser, file write. They will be marked for approval or sandboxed use."}
                      </span>
                    </span>
                  </label>
                </div>
                <div className="rounded-2xl border border-[var(--color-border)] bg-[rgba(6,7,13,0.42)] p-4">
                  <div className="font-semibold text-sm mb-3">{lang === "zh" ? "接入前检查" : "Preflight checks"}</div>
                  <div className="space-y-2">
                    {openClawChecks.map((check) => (
                      <div key={check} className="flex items-start gap-2 text-xs text-[var(--color-fg-muted)]">
                        <span className="mt-0.5 text-[var(--color-success)]">✓</span>
                        <span>{check}</span>
                      </div>
                    ))}
                  </div>
                  <pre className="mt-4 overflow-x-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-3 text-[11px] text-[var(--color-accent)]">
{`npm install -g openclaw@latest
openclaw onboard --install-daemon
openclaw gateway status --require-rpc`}
                  </pre>
                </div>
              </div>
            ) : activeKind === "hermes" ? (
              <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-5 text-left">
                <div className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-3">
                    <Field label="Auth Mode">
                      <select value={hermesConfig.authMode} onChange={(e) => setHermesConfig({ ...hermesConfig, authMode: e.target.value })} className="input">
                        <option value="device">Device Auth</option>
                        <option value="token">Access Token</option>
                      </select>
                    </Field>
                    <Field label="platform_type">
                      <input value={hermesConfig.platformType} onChange={(e) => setHermesConfig({ ...hermesConfig, platformType: e.target.value })} className="input" />
                    </Field>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <Field label="Hermes Base URL">
                      <input value={hermesConfig.baseUrl} onChange={(e) => setHermesConfig({ ...hermesConfig, baseUrl: e.target.value })} className="input" />
                    </Field>
                    <Field label="Agent ID">
                      <input value={hermesConfig.agentId} onChange={(e) => setHermesConfig({ ...hermesConfig, agentId: e.target.value })} className="input" />
                    </Field>
                  </div>
                  {hermesConfig.authMode === "token" && (
                    <Field label="Hermes Access Token">
                      <input type="password" value={hermesConfig.accessToken} onChange={(e) => setHermesConfig({ ...hermesConfig, accessToken: e.target.value })} placeholder="hm_xxx" className="input" />
                    </Field>
                  )}
                  <Field label={lang === "zh" ? "状态回调地址" : "Status callback URL"}>
                    <input value={hermesConfig.callbackUrl} onChange={(e) => setHermesConfig({ ...hermesConfig, callbackUrl: e.target.value })} className="input" />
                  </Field>
                </div>
                <ConnectorGuide
                  title={lang === "zh" ? "Hermes 接入约定" : "Hermes contract"}
                  checks={checksByPlatform.hermes}
                  sample={`POST /integrations/hermes/auth/start
platform_type=${hermesConfig.platformType}
discover=MCP initialize + tools/list`}
                />
              </div>
            ) : activeKind === "cursor" ? (
              <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-5 text-left">
                <div className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-3">
                    <Field label={lang === "zh" ? "配置范围" : "Config scope"}>
                      <select value={cursorConfig.scope} onChange={(e) => setCursorConfig({ ...cursorConfig, scope: e.target.value, configPath: e.target.value === "project" ? ".cursor/mcp.json" : "~/.cursor/mcp.json" })} className="input">
                        <option value="project">Project</option>
                        <option value="user">User</option>
                      </select>
                    </Field>
                    <Field label="mcp.json">
                      <input value={cursorConfig.configPath} onChange={(e) => setCursorConfig({ ...cursorConfig, configPath: e.target.value })} className="input" />
                    </Field>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <Field label="Server Name">
                      <input value={cursorConfig.serverName} onChange={(e) => setCursorConfig({ ...cursorConfig, serverName: e.target.value })} className="input" />
                    </Field>
                    <Field label="Transport">
                      <select value={cursorConfig.transport} onChange={(e) => setCursorConfig({ ...cursorConfig, transport: e.target.value })} className="input">
                        <option value="stdio">stdio</option>
                        <option value="http">streamable HTTP</option>
                        <option value="sse">SSE</option>
                      </select>
                    </Field>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <Field label="Command / URL">
                      <input value={cursorConfig.transport === "http" ? cursorConfig.workspaceRoot : cursorConfig.command} onChange={(e) => cursorConfig.transport === "http" ? setCursorConfig({ ...cursorConfig, workspaceRoot: e.target.value }) : setCursorConfig({ ...cursorConfig, command: e.target.value })} placeholder={cursorConfig.transport === "http" ? "https://api.worktwin.cn/mcp" : "npx"} className="input" />
                    </Field>
                    <Field label="Args">
                      <input value={cursorConfig.args} onChange={(e) => setCursorConfig({ ...cursorConfig, args: e.target.value })} disabled={cursorConfig.transport === "http"} className="input disabled:opacity-40" />
                    </Field>
                  </div>
                  <Field label={lang === "zh" ? "Workspace Root（可选）" : "Workspace root (optional)"}>
                    <input value={cursorConfig.workspaceRoot} onChange={(e) => setCursorConfig({ ...cursorConfig, workspaceRoot: e.target.value })} placeholder="/path/to/project" className="input" />
                  </Field>
                </div>
                <ConnectorGuide
                  title={lang === "zh" ? "Cursor MCP 配置预览" : "Cursor MCP config preview"}
                  checks={checksByPlatform.cursor}
                  sample={`{
  "mcpServers": {
    "${cursorConfig.serverName}": {
      "command": "${cursorConfig.command}",
      "args": ${JSON.stringify(cursorConfig.args.split(" ").filter(Boolean))}
    }
  }
}`}
                />
              </div>
            ) : activeKind === "claude" ? (
              <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-5 text-left">
                <div className="space-y-4">
                  <div className="grid sm:grid-cols-3 gap-3">
                    <Field label="Client">
                      <select value={claudeConfig.client} onChange={(e) => setClaudeConfig({ ...claudeConfig, client: e.target.value })} className="input">
                        <option value="code">Claude Code</option>
                        <option value="desktop">Claude Desktop</option>
                      </select>
                    </Field>
                    <Field label="Scope">
                      <select value={claudeConfig.scope} onChange={(e) => setClaudeConfig({ ...claudeConfig, scope: e.target.value })} className="input">
                        <option value="local">Local</option>
                        <option value="project">Project</option>
                        <option value="user">User</option>
                      </select>
                    </Field>
                    <Field label="Transport">
                      <select value={claudeConfig.transport} onChange={(e) => setClaudeConfig({ ...claudeConfig, transport: e.target.value })} className="input">
                        <option value="http">HTTP</option>
                        <option value="stdio">stdio</option>
                        <option value="sse">SSE</option>
                        <option value="ws">WebSocket</option>
                      </select>
                    </Field>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <Field label="Server Name">
                      <input value={claudeConfig.serverName} onChange={(e) => setClaudeConfig({ ...claudeConfig, serverName: e.target.value })} className="input" />
                    </Field>
                    <Field label={claudeConfig.transport === "stdio" ? "Command" : "Server URL"}>
                      <input value={claudeConfig.serverUrl} onChange={(e) => setClaudeConfig({ ...claudeConfig, serverUrl: e.target.value })} placeholder={claudeConfig.transport === "stdio" ? "npx -y @worktwin/mcp" : "https://api.worktwin.cn/mcp"} className="input" />
                    </Field>
                  </div>
                  <Field label={claudeConfig.client === "desktop" ? "Desktop config path" : "Auth token / OAuth token"}>
                    <input type={claudeConfig.client === "desktop" ? "text" : "password"} value={claudeConfig.client === "desktop" ? claudeConfig.configPath : claudeConfig.authToken} onChange={(e) => claudeConfig.client === "desktop" ? setClaudeConfig({ ...claudeConfig, configPath: e.target.value }) : setClaudeConfig({ ...claudeConfig, authToken: e.target.value })} className="input" />
                  </Field>
                </div>
                <ConnectorGuide
                  title={lang === "zh" ? "Claude MCP 配置预览" : "Claude MCP config preview"}
                  checks={checksByPlatform.claude}
                  sample={claudeConfig.client === "desktop"
                    ? `{
  "mcpServers": {
    "${claudeConfig.serverName}": {
      "command": "npx",
      "args": ["-y", "@worktwin/mcp"]
    }
  }
}`
                    : `claude mcp add --scope ${claudeConfig.scope} ${claudeConfig.serverName} ${claudeConfig.serverUrl}`}
                />
              </div>
            ) : activeKind === "custom" ? (
              <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-5 text-left">
                <div className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-3">
                    <Field label="Base URL">
                      <input value={customConfig.baseUrl} onChange={(e) => setCustomConfig({ ...customConfig, baseUrl: e.target.value })} className="input" />
                    </Field>
                    <Field label="Schema Type">
                      <select value={customConfig.schemaType} onChange={(e) => setCustomConfig({ ...customConfig, schemaType: e.target.value })} className="input">
                        <option value="openapi">OpenAPI</option>
                        <option value="mcp">MCP</option>
                        <option value="a2a">A2A Agent Card</option>
                        <option value="jsonrpc">JSON-RPC</option>
                      </select>
                    </Field>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <Field label="Auth Header">
                      <input value={customConfig.authHeader} onChange={(e) => setCustomConfig({ ...customConfig, authHeader: e.target.value })} className="input" />
                    </Field>
                    <Field label="API Key / Token">
                      <input type="password" value={customConfig.apiKey} onChange={(e) => setCustomConfig({ ...customConfig, apiKey: e.target.value })} placeholder="sk_xxx" className="input" />
                    </Field>
                  </div>
                  <Field label="Schema URL">
                    <input value={customConfig.schemaUrl} onChange={(e) => setCustomConfig({ ...customConfig, schemaUrl: e.target.value })} className="input" />
                  </Field>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <Field label="Health Path">
                      <input value={customConfig.healthPath} onChange={(e) => setCustomConfig({ ...customConfig, healthPath: e.target.value })} className="input" />
                    </Field>
                    <Field label="Callback URL">
                      <input value={customConfig.callbackUrl} onChange={(e) => setCustomConfig({ ...customConfig, callbackUrl: e.target.value })} className="input" />
                    </Field>
                  </div>
                </div>
                <ConnectorGuide
                  title={lang === "zh" ? "Custom 解析策略" : "Custom parsing strategy"}
                  checks={checksByPlatform.custom}
                  sample={`GET ${customConfig.schemaUrl}
${customConfig.authHeader}: Bearer ****
POST ${customConfig.callbackUrl}`}
                />
              </div>
            ) : (
              <div className="my-6">
                <div className="w-40 h-40 mx-auto rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center animate-pulse-glow">
                  <span className="text-5xl">📱</span>
                </div>
                <p className="text-xs text-[var(--color-fg-dim)] mt-3">{t("integrate.scanQR")}</p>
              </div>
            )}
            <div className="flex gap-2 justify-center mt-6">
              <button onClick={() => setActiveKind(null)} className="px-4 py-2 rounded-lg text-sm bg-[var(--color-surface)] hover:bg-[var(--color-surface-2)]">{t("integrate.changePlatform")}</button>
              <button onClick={startAuth} disabled={!canConnect} className="btn-glow px-6 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-40">
                {activeKind === "openclaw"
                  ? (lang === "zh" ? "连接 Gateway →" : "Connect Gateway →")
                  : activeKind === "cursor" || activeKind === "claude"
                    ? (lang === "zh" ? "导入 MCP 配置 →" : "Import MCP config →")
                    : t("integrate.startAuth")}
              </button>
            </div>
          </div>
        )}

        {/* 鉴权中 */}
        {state === "authenticating" && (
          <div className="glass rounded-2xl p-12 text-center">
            <div className="text-4xl mb-4 animate-pulse-glow">{activePlatform?.emoji}</div>
            <p className="text-sm text-[var(--color-fg-muted)]">
              {activeKind === "openclaw"
                ? (lang === "zh" ? "正在探测 Gateway 健康状态、认证边界与能力目录..." : "Probing Gateway health, auth boundary and capability catalog...")
                : t("integrate.authing")}
            </p>
          </div>
        )}

        {/* STEP 3: 发现能力 */}
        {state === "discovering" && (
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">{t("integrate.discovered")} ({discovered.length})</h2>
              <span className="text-xs text-[var(--color-fg-dim)]">
                {activeKind === "openclaw"
                  ? `${openClawConfig.gatewayUrl} · ${openClawConfig.transport === "ws" ? "hello-ok.features" : "/v1/models + tools"}`
                  : `${activePlatform?.name} · tools/list`}
              </span>
            </div>
            {activeKind === "openclaw" && (
              <div className="mb-4 grid md:grid-cols-3 gap-3">
                {[
                  ["Agent", "openclaw/default", lang === "zh" ? "可作为默认工作分身入口" : "Default WorkTwin entrypoint"],
                  ["Tools", "browser / exec / sessions_*", lang === "zh" ? "按风险等级打标后上架" : "Risk-tagged before listing"],
                  ["Skills", "SKILL.md packs", lang === "zh" ? "转成岗位说明与交付模板" : "Mapped to role and delivery playbooks"],
                ].map(([title, value, desc]) => (
                  <div key={title} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
                    <div className="text-xs text-[var(--color-fg-dim)]">{title}</div>
                    <div className="mt-1 font-mono text-xs text-[var(--color-accent)]">{value}</div>
                    <div className="mt-1 text-xs text-[var(--color-fg-muted)]">{desc}</div>
                  </div>
                ))}
              </div>
            )}
            <div className="space-y-2 mb-4">
              {discovered.map((c) => {
                const checked = selectedCaps.includes(c.id);
                return (
                  <label key={c.id} className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${checked ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5" : "border-[var(--color-border)] bg-[var(--color-surface)]"}`}>
                    <input type="checkbox" checked={checked} onChange={() => selectCap(c.id)} className="mt-1 accent-[var(--color-primary)]" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{c.name}</span>
                        <span className="badge" style={{ color: "var(--color-accent)", background: "rgba(34,211,238,0.1)" }}>{c.kind}</span>
                      </div>
                      <p className="text-xs text-[var(--color-fg-muted)] mt-0.5">{c.desc}</p>
                      {["exec", "browser", "terminal_command", "code_edit"].includes(c.name) && (
                        <p className="text-[11px] text-[var(--color-warning)] mt-1">
                          {lang === "zh" ? "建议上架为需确认能力，避免远程任务直接触达宿主机。" : "Recommend approval-gated listing to avoid direct host access from remote jobs."}
                        </p>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-[var(--color-fg-dim)]">{t("integrate.selected", { n: selectedCaps.length })}</span>
              <button onClick={goToCompose} disabled={selectedCaps.length === 0} className="btn-glow px-5 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-40">{t("integrate.nextCompose")}</button>
            </div>
          </div>
        )}

        {/* STEP 4: 组装员工 */}
        {state === "composing" && (
          <div className="glass rounded-2xl p-6 max-w-2xl mx-auto">
            <h2 className="font-semibold mb-4">{t("integrate.composeTitle")}</h2>
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-3">
                <Field label={t("integrate.fieldName")}>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={t("integrate.fieldNamePh")} className="input" />
                </Field>
                <Field label={t("integrate.fieldRole")}>
                  <input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder={t("integrate.fieldRolePh")} className="input" />
                </Field>
              </div>
              <Field label={t("integrate.fieldBio")}>
                <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={2} placeholder={t("integrate.fieldBioPh")} className="input resize-none" />
              </Field>
              <div className="grid sm:grid-cols-3 gap-3">
                <Field label={t("integrate.fieldPricing")}>
                  <select value={form.pricingModel} onChange={(e) => setForm({ ...form, pricingModel: e.target.value as PricingModel })} className="input">
                    <option value="per_task">{t("card.perTask")}</option>
                    <option value="salary">{t("card.salary")}</option>
                    <option value="subscription">{t("card.subscription")}</option>
                  </select>
                </Field>
                <Field label={t("integrate.fieldPrice")}>
                  <input type="number" value={form.rate} onChange={(e) => setForm({ ...form, rate: e.target.value })} className="input" />
                </Field>
                <Field label={t("integrate.fieldCurrency")}>
                  <select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value as Currency })} className="input">
                    <option value="CNY">{t("integrate.currencyCNY")}</option>
                    <option value="UT">{t("integrate.currencyUT")}</option>
                  </select>
                </Field>
              </div>
            </div>
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-[var(--color-border)]">
              <button onClick={() => setState("discovering")} className="text-sm text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]">{t("integrate.reselect")}</button>
              <InlineLoginGate action={t("integrate.publish")} onConfirm={() => void publish()}>
                {(handleClick) => (
                  <button onClick={handleClick} disabled={!form.name || !form.role} className="btn-glow px-6 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-40">{t("integrate.publish")}</button>
                )}
              </InlineLoginGate>
            </div>
            {publishError && <p className="mt-3 text-xs text-[var(--color-danger)]">{publishError}</p>}
          </div>
        )}

        {/* STEP 5: 完成 */}
        {state === "connected" && (
          <div className="glass rounded-2xl p-12 text-center">
            <div className="text-5xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold mb-2">{t("integrate.done")}</h2>
            <p className="text-sm text-[var(--color-fg-muted)] mb-6">
              <strong className="text-[var(--color-fg)]">{publishedEmployee?.name || form.name || "—"}</strong> {t("integrate.doneDesc")}
            </p>
            <div className="flex gap-2 justify-center">
              <Link href={publishedEmployee ? `/market/${publishedEmployee.id}` : "/market"} className="btn-glow px-5 py-2 rounded-lg text-sm font-medium text-white">
                {publishedEmployee ? t("studio.detail") : t("integrate.goMarket")}
              </Link>
              <Link href="/market" className="px-5 py-2 rounded-lg text-sm bg-[var(--color-surface)] hover:bg-[var(--color-surface-2)]">
                {t("integrate.goMarket")}
              </Link>
              <button onClick={reset} className="px-5 py-2 rounded-lg text-sm bg-[var(--color-surface)] hover:bg-[var(--color-surface-2)]">{t("integrate.another")}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs text-[var(--color-fg-muted)] mb-1.5">{label}</span>
      {children}
    </label>
  );
}

function ConnectorGuide({ title, checks, sample }: { title: string; checks: string[]; sample: string }) {
  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[rgba(6,7,13,0.42)] p-4">
      <div className="font-semibold text-sm mb-3">{title}</div>
      <div className="space-y-2">
        {checks.map((check) => (
          <div key={check} className="flex items-start gap-2 text-xs text-[var(--color-fg-muted)]">
            <span className="mt-0.5 text-[var(--color-success)]">✓</span>
            <span>{check}</span>
          </div>
        ))}
      </div>
      <pre className="mt-4 overflow-x-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-3 text-[11px] text-[var(--color-accent)]">
        {sample}
      </pre>
    </div>
  );
}

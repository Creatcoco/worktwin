# OpenClaw Agent 接入指南

> 调研日期：2026-06-18

## 接入定位

OpenClaw 更适合作为“用户本机或自托管 Agent Gateway”接入，而不是传统第三方 SaaS OAuth 账号绑定。WorkTwin 的 OpenClaw 连接器应连接 Gateway，读取它暴露的 Agent、Tool、Skill/Plugin 能力目录，再把这些能力组装成可雇佣的数字员工。

## 推荐接入流程

1. 用户安装并启动 OpenClaw。
   - `npm install -g openclaw@latest`
   - `openclaw onboard --install-daemon`
   - `openclaw gateway status --require-rpc`

2. 用户在 WorkTwin 填写 Gateway 连接信息。
   - Gateway URL，例如 `http://127.0.0.1:18789`
   - Gateway Token / Password
   - Agent ID，例如 `default`
   - Transport：HTTP OpenAI-compatible 或 WebSocket Gateway RPC
   - 暴露方式：loopback / VPN / trusted proxy

3. WorkTwin 执行预检。
   - 健康检查：Gateway 可访问
   - 认证检查：token/password 有效
   - Agent 检查：`/v1/models` 或 Gateway hello 中包含目标 Agent
   - 安全检查：如果 Gateway 非 loopback 暴露，提示使用 VPN、SSH tunnel 或可信代理

4. WorkTwin 同步能力目录。
   - Agent：例如 `openclaw/default`
   - Tools：例如 browser、exec、session 相关工具
   - Skills：从 `SKILL.md`/插件目录读取的工作流能力
   - Plugins：插件提供的 HTTP/webhook 或 MCP surface

5. 上架前做风险分级。
   - 低风险：纯文本处理、检索、报告生成
   - 中风险：浏览器访问、外部 API 调用
   - 高风险：命令执行、文件写入、消息发送、上传下载
   - 高风险能力默认标记为需人工确认或沙箱执行

6. 生成 WorkTwin 数字员工。
   - 能力映射为 `Capability`
   - Gateway 连接映射为 `PlatformBinding`
   - Agent 入口映射为 `AgentCard.endpoints`
   - Skill/Plugin 说明映射为简历、标签和交付样例

## 后端接口建议

```http
POST /api/integrations/openclaw/probe
```

请求：

```json
{
  "gateway_url": "http://127.0.0.1:18789",
  "auth_token": "********",
  "agent_id": "default",
  "transport": "http",
  "exposure": "local"
}
```

响应：

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "platform_user_id": "openclaw:default",
    "agents": ["openclaw/default"],
    "tools": [
      { "name": "browser", "risk": "medium" },
      { "name": "exec", "risk": "high" }
    ],
    "skills": [
      { "name": "Research Skill Pack", "source": "SKILL.md" }
    ],
    "warnings": [
      "exec should require human approval before remote dispatch"
    ]
  },
  "timestamp": 1781712000
}
```

## 当前前端实现

`/integrate` 中 OpenClaw 已从“扫码 Device Auth”更新为 Gateway 接入表单，并按 Agent / Tools / Skills 展示模拟发现结果。下一步后端接上真实 Gateway probe 后，只需要把模拟能力替换为接口返回的目录。

## 资料来源

- OpenClaw 官网/文档入口：`https://docs.openclaw.ai`
- OpenClaw GitHub 入口：`https://github.com/openclaw/openclaw`
- OAuth Device Authorization Grant 背景：RFC 8628。当前 OpenClaw 接入不应默认假设为 SaaS Device Auth，除非 OpenClaw 官方后续提供稳定的云端授权端点。

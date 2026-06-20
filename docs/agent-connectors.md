# Agent 连接器调研与接入设计

> 调研日期：2026-06-18

本文补充 `/integrate` 中 Hermes、Cursor、Claude、Custom 四类接入模块的产品与技术约定。OpenClaw 详见 `docs/openclaw.md`。

## 总原则

所有连接器最终都映射为 WorkTwin 的三类对象：

- `PlatformBinding`：保存平台、平台用户/Agent ID、鉴权状态。
- `Capability`：保存 MCP tool、Skill、A2A endpoint、OpenAPI operation 等能力。
- `AgentCard`：保存外部可调用入口、版本、能力摘要。

接入流程统一为：

1. 录入连接参数。
2. 执行健康检查与鉴权检查。
3. 发现能力目录。
4. 对高风险能力打标。
5. 勾选能力并组装数字员工。

## Hermes Agent

公开资料中未找到稳定的 Hermes Agent 官方接入规范，因此当前按项目既有 M1 设计落地：

- `platform_type` 固定为 `hermes_agent`。
- 鉴权支持 Device Auth 或直接录入 Access Token。
- 能力发现走 MCP `initialize` + `tools/list`。
- 状态回传走 WorkTwin webhook callback。

建议后端 probe：

```http
POST /api/integrations/hermes/probe
```

```json
{
  "auth_mode": "device",
  "platform_type": "hermes_agent",
  "base_url": "https://api.hermes-agent.local",
  "agent_id": "hermes_agent",
  "callback_url": "https://api.worktwin.cn/webhooks/hermes"
}
```

## Cursor

Cursor 的 Agent 接入核心是 MCP server 配置。WorkTwin 前端已按以下信息建模：

- 支持项目级与用户级配置。
- 项目级默认 `.cursor/mcp.json`。
- 用户级默认 `~/.cursor/mcp.json`。
- MCP server 可为 `stdio`、streamable HTTP 或 SSE。
- 同步能力时读取 server 的 `tools/list`，并将 terminal、代码修改类能力标记为需确认。

配置预览：

```json
{
  "mcpServers": {
    "worktwin": {
      "command": "npx",
      "args": ["-y", "@worktwin/cursor-mcp"]
    }
  }
}
```

## Claude

Claude 接入拆成 Claude Code 与 Claude Desktop 两类。

Claude Code：

- 官方 MCP 配置支持 local、project、user 三种 scope。
- 支持 HTTP、stdio、SSE、WebSocket 等 transport。
- 可通过 CLI 添加 MCP server，例如 `claude mcp add --scope project worktwin https://api.worktwin.cn/mcp`。

Claude Desktop：

- 主要读取 `claude_desktop_config.json` 中的 `mcpServers`。
- 适合导入本机工具、文件系统、浏览器、数据库等 MCP server。
- 上架前必须对文件写入、命令执行、外部消息发送等工具加风险标签。

桌面配置预览：

```json
{
  "mcpServers": {
    "worktwin": {
      "command": "npx",
      "args": ["-y", "@worktwin/mcp"]
    }
  }
}
```

## Custom

Custom 是“兜底连接器”，用于接入非标准 Agent 或传统 API。

支持四类 schema：

- OpenAPI：解析 operationId 为能力。
- MCP：执行 `initialize` + `tools/list`。
- A2A Agent Card：读取 endpoint、capabilities、version。
- JSON-RPC：根据 method catalog 或手动配置生成能力。

必填参数：

- Base URL
- Auth header
- API Key / Token
- Schema URL
- Health path
- Callback URL

建议后端 probe：

```http
POST /api/integrations/custom/probe
```

```json
{
  "base_url": "https://api.example.com",
  "auth_header": "Authorization",
  "schema_type": "openapi",
  "schema_url": "https://api.example.com/openapi.json",
  "health_path": "/health",
  "callback_url": "https://api.worktwin.cn/webhooks/custom"
}
```

## 风险标记

能力发现后统一打风险标签：

- `low`：纯文本、分类、摘要、只读查询。
- `medium`：浏览器、外部 API、数据库只读、长任务执行。
- `high`：命令执行、文件写入、支付、发消息、上传、权限变更。

高风险能力默认不能直接被雇主远程触发，必须走人工确认、沙箱或白名单策略。

## 资料来源

- Cursor MCP 文档入口：`https://docs.cursor.com/context/model-context-protocol`
- Anthropic Claude Code MCP 文档：`https://docs.anthropic.com/en/docs/claude-code/mcp`
- Model Context Protocol 官方文档：`https://modelcontextprotocol.io`
- 项目内部设计：`docs/M1-一键接入中心-详细设计.md`

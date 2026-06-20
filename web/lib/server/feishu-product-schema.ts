import "server-only";

export type ProductTableKey =
  | "users"
  | "wallets"
  | "employees"
  | "capabilities"
  | "employeeCapabilities"
  | "platformBindings"
  | "integrationSessions"
  | "contracts"
  | "tasks"
  | "settlements"
  | "reviews"
  | "apiKeys"
  | "webhooks"
  | "auditLogs";

export type ProductFieldKind =
  | "text"
  | "number"
  | "select"
  | "multiSelect"
  | "date"
  | "checkbox"
  | "json";

export interface ProductFieldDefinition {
  name: string;
  kind: ProductFieldKind;
  required?: boolean;
  primary?: boolean;
  options?: string[];
  description?: string;
}

export interface ProductTableDefinition {
  key: ProductTableKey;
  name: string;
  purpose: string;
  writeMode: "mutable" | "append_only";
  fields: ProductFieldDefinition[];
}

const field = (
  name: string,
  kind: ProductFieldKind,
  options: Omit<ProductFieldDefinition, "name" | "kind"> = {}
): ProductFieldDefinition => ({ name, kind, ...options });

export const PRODUCT_TABLES: Record<ProductTableKey, ProductTableDefinition> = {
  users: {
    key: "users",
    name: "用户",
    purpose: "登录身份、账号状态和角色",
    writeMode: "mutable",
    fields: [
      field("用户ID", "text", { primary: true, required: true }),
      field("邮箱", "text", { required: true }),
      field("姓名", "text", { required: true }),
      field("密码哈希", "text", { required: true }),
      field("密码盐", "text", { required: true }),
      field("状态", "select", { required: true, options: ["active", "disabled"] }),
      field("角色", "select", { required: true, options: ["user", "admin"] }),
      field("创建时间", "date", { required: true }),
      field("更新时间", "date", { required: true }),
      field("最后登录时间", "date"),
      field("最近退出时间", "date"),
    ],
  },
  wallets: {
    key: "wallets",
    name: "钱包",
    purpose: "用户 CNY/UT 可用余额和并发版本",
    writeMode: "mutable",
    fields: [
      field("钱包ID", "text", { primary: true, required: true }),
      field("用户ID", "text", { required: true }),
      field("CNY余额", "number", { required: true }),
      field("UT余额", "number", { required: true }),
      field("版本", "number", { required: true, description: "乐观锁版本" }),
      field("更新时间", "date", { required: true }),
    ],
  },
  employees: {
    key: "employees",
    name: "数字员工",
    purpose: "工作分身身份、定价、状态和公开简历摘要",
    writeMode: "mutable",
    fields: [
      field("员工ID", "text", { primary: true, required: true }),
      field("所有者ID", "text", { required: true }),
      field("所有者名称", "text", { required: true }),
      field("所有者类型", "select", { required: true, options: ["human", "agent"] }),
      field("姓名", "text", { required: true }),
      field("头像", "text"),
      field("岗位", "text", { required: true }),
      field("标题", "text"),
      field("简介", "text"),
      field("状态", "select", { required: true, options: ["available", "hired", "offline"] }),
      field("计费模型", "select", { required: true, options: ["salary", "per_task", "subscription"] }),
      field("价格", "number", { required: true }),
      field("币种", "select", { required: true, options: ["CNY", "UT"] }),
      field("标签JSON", "json"),
      field("AgentCardJSON", "json"),
      field("评分", "number"),
      field("完成单数", "number"),
      field("样例JSON", "json"),
      field("创建时间", "date", { required: true }),
      field("更新时间", "date", { required: true }),
    ],
  },
  capabilities: {
    key: "capabilities",
    name: "能力",
    purpose: "MCP Tool、Skill、A2A endpoint 和 Skill Pack 目录",
    writeMode: "mutable",
    fields: [
      field("能力ID", "text", { primary: true, required: true }),
      field("类型", "select", { required: true, options: ["mcp_tool", "skill", "a2a_endpoint", "skill_pack"] }),
      field("名称", "text", { required: true }),
      field("描述", "text"),
      field("分类", "text"),
      field("SchemaJSON", "json"),
      field("创建时间", "date", { required: true }),
      field("更新时间", "date", { required: true }),
    ],
  },
  employeeCapabilities: {
    key: "employeeCapabilities",
    name: "员工能力关联",
    purpose: "数字员工与能力的多对多关系及风险策略",
    writeMode: "mutable",
    fields: [
      field("关联ID", "text", { primary: true, required: true }),
      field("员工ID", "text", { required: true }),
      field("能力ID", "text", { required: true }),
      field("是否启用", "checkbox", { required: true }),
      field("风险等级", "select", { required: true, options: ["low", "medium", "high"] }),
      field("创建时间", "date", { required: true }),
      field("更新时间", "date", { required: true }),
    ],
  },
  platformBindings: {
    key: "platformBindings",
    name: "平台绑定",
    purpose: "员工与 OpenClaw/Hermes/Cursor/Claude/Custom 的连接状态",
    writeMode: "mutable",
    fields: [
      field("绑定ID", "text", { primary: true, required: true }),
      field("员工ID", "text", { required: true }),
      field("平台", "select", { required: true, options: ["openclaw", "hermes", "cursor", "claude", "custom"] }),
      field("平台用户ID", "text", { required: true }),
      field("状态", "select", { required: true, options: ["pending", "authenticating", "discovering", "composing", "connected", "disconnected", "failed"] }),
      field("凭证引用", "text", { description: "只保存服务端 Secret/Vault 引用，不保存明文 token" }),
      field("绑定时间", "date", { required: true }),
      field("更新时间", "date", { required: true }),
    ],
  },
  integrationSessions: {
    key: "integrationSessions",
    name: "接入会话",
    purpose: "连接器鉴权、发现能力和组装草稿状态机",
    writeMode: "mutable",
    fields: [
      field("会话ID", "text", { primary: true, required: true }),
      field("用户ID", "text", { required: true }),
      field("平台", "select", { required: true, options: ["openclaw", "hermes", "cursor", "claude", "custom"] }),
      field("状态", "select", { required: true, options: ["pending", "authenticating", "discovering", "composing", "connected", "disconnected", "failed"] }),
      field("平台用户ID", "text"),
      field("已选能力JSON", "json"),
      field("草稿JSON", "json"),
      field("错误信息", "text"),
      field("创建时间", "date", { required: true }),
      field("更新时间", "date", { required: true }),
    ],
  },
  contracts: {
    key: "contracts",
    name: "雇佣合同",
    purpose: "雇主与数字员工之间的商业关系和履约汇总",
    writeMode: "mutable",
    fields: [
      field("合同ID", "text", { primary: true, required: true }),
      field("雇主ID", "text", { required: true }),
      field("雇主名称", "text", { required: true }),
      field("员工ID", "text", { required: true }),
      field("员工名称", "text", { required: true }),
      field("计费模型", "select", { required: true, options: ["salary", "per_task", "subscription"] }),
      field("金额", "number", { required: true }),
      field("币种", "select", { required: true, options: ["CNY", "UT"] }),
      field("周期天数", "number", { required: true }),
      field("状态", "select", { required: true, options: ["active", "paused", "ended"] }),
      field("已派任务", "number"),
      field("已完成任务", "number"),
      field("评分", "number"),
      field("累计收益", "number"),
      field("开始时间", "date", { required: true }),
      field("更新时间", "date", { required: true }),
    ],
  },
  tasks: {
    key: "tasks",
    name: "任务",
    purpose: "派单、执行、验收和交付结果",
    writeMode: "mutable",
    fields: [
      field("任务ID", "text", { primary: true, required: true }),
      field("幂等键", "text", { required: true }),
      field("合同ID", "text", { required: true }),
      field("派单人ID", "text", { required: true }),
      field("派单人名称", "text", { required: true }),
      field("员工ID", "text", { required: true }),
      field("员工名称", "text", { required: true }),
      field("任务描述", "text", { required: true }),
      field("优先级", "select", { required: true, options: ["low", "normal", "high"] }),
      field("截止时间", "date", { required: true }),
      field("状态", "select", { required: true, options: ["queued", "running", "review", "done", "rejected"] }),
      field("交付结果", "text"),
      field("创建时间", "date", { required: true }),
      field("更新时间", "date", { required: true }),
      field("完成时间", "date"),
    ],
  },
  settlements: {
    key: "settlements",
    name: "结算流水",
    purpose: "不可覆盖的资金/UT 记账流水和幂等结算记录",
    writeMode: "append_only",
    fields: [
      field("结算ID", "text", { primary: true, required: true }),
      field("幂等键", "text", { required: true }),
      field("合同ID", "text", { required: true }),
      field("任务ID", "text"),
      field("计费模型", "select", { required: true, options: ["salary", "per_task", "subscription"] }),
      field("金额", "number", { required: true }),
      field("币种", "select", { required: true, options: ["CNY", "UT"] }),
      field("调用方类型", "select", { required: true, options: ["human", "agent"] }),
      field("状态", "select", { required: true, options: ["pending", "posted", "failed", "refunded"] }),
      field("描述", "text"),
      field("创建时间", "date", { required: true }),
      field("记账时间", "date"),
    ],
  },
  reviews: {
    key: "reviews",
    name: "评价",
    purpose: "任务完成后的雇主评价和员工信誉证据",
    writeMode: "append_only",
    fields: [
      field("评价ID", "text", { primary: true, required: true }),
      field("合同ID", "text", { required: true }),
      field("任务ID", "text"),
      field("员工ID", "text", { required: true }),
      field("评价人ID", "text", { required: true }),
      field("评价人名称", "text", { required: true }),
      field("评分", "number", { required: true }),
      field("内容", "text"),
      field("创建时间", "date", { required: true }),
    ],
  },
  apiKeys: {
    key: "apiKeys",
    name: "API密钥",
    purpose: "Agent API Key 的哈希、权限和撤销状态",
    writeMode: "mutable",
    fields: [
      field("密钥ID", "text", { primary: true, required: true }),
      field("用户ID", "text", { required: true }),
      field("密钥前缀", "text", { required: true }),
      field("密钥哈希", "text", { required: true }),
      field("状态", "select", { required: true, options: ["active", "revoked", "expired"] }),
      field("权限JSON", "json"),
      field("最后使用时间", "date"),
      field("过期时间", "date"),
      field("创建时间", "date", { required: true }),
      field("撤销时间", "date"),
    ],
  },
  webhooks: {
    key: "webhooks",
    name: "Webhook",
    purpose: "外部回调地址、订阅事件和签名密钥引用",
    writeMode: "mutable",
    fields: [
      field("WebhookID", "text", { primary: true, required: true }),
      field("用户ID", "text", { required: true }),
      field("回调URL", "text", { required: true }),
      field("订阅事件JSON", "json", { required: true }),
      field("签名密钥引用", "text"),
      field("状态", "select", { required: true, options: ["active", "paused", "failed"] }),
      field("最后成功时间", "date"),
      field("最后失败时间", "date"),
      field("创建时间", "date", { required: true }),
      field("更新时间", "date", { required: true }),
    ],
  },
  auditLogs: {
    key: "auditLogs",
    name: "审计日志",
    purpose: "关键写操作、权限变化和资金动作的只增审计轨迹",
    writeMode: "append_only",
    fields: [
      field("审计ID", "text", { primary: true, required: true }),
      field("用户ID", "text"),
      field("操作", "text", { required: true }),
      field("资源类型", "text", { required: true }),
      field("资源ID", "text"),
      field("请求ID", "text"),
      field("元数据JSON", "json"),
      field("IP哈希", "text"),
      field("创建时间", "date", { required: true }),
    ],
  },
};

export const PRODUCT_TABLE_KEYS = Object.keys(PRODUCT_TABLES) as ProductTableKey[];

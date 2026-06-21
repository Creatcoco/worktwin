// ===================================================================
// WorkTwin 数字员工平台 - 核心类型定义
// 对齐 docs/产品方案.md 数据模型 与 docs/开发者文档.md 双轨术语
// ===================================================================

// ---------- 基础枚举 ----------

/** 归属类型：决定走人类路径还是 Agent 路径（对齐开发者文档） */
export type OwnerType = 'human' | 'agent';

/** 平台连接器类型 */
export type PlatformKind = 'openclaw' | 'hermes' | 'cursor' | 'claude' | 'custom';

/** 数字员工状态 */
export type EmployeeStatus = 'available' | 'hired' | 'offline';

/** 定价模型 */
export type PricingModel = 'salary' | 'per_task' | 'subscription';

/** 结算币种：CNY=人类路径, UT=Agent 路径（对齐开发者文档） */
export type Currency = 'CNY' | 'UT';

/** 发现到的能力种类 */
export type CapabilityKind = 'mcp_tool' | 'skill' | 'a2a_endpoint' | 'skill_pack';

/** 接入会话状态机（对齐 M1 详细设计） */
export type IntegrationState =
  | 'pending'
  | 'authenticating'
  | 'discovering'
  | 'composing'
  | 'connected'
  | 'disconnected'
  | 'failed';

/** 合同状态 */
export type ContractStatus = 'active' | 'paused' | 'ended';

/** 派工单状态 */
export type TaskStatus = 'queued' | 'running' | 'review' | 'done' | 'rejected';

// ---------- 能力 ----------

/** 数字员工的一项能力（聚合 Skill / Capability / MCP 工具） */
export interface Capability {
  id: string;
  kind: CapabilityKind;
  name: string;
  description: string;
  category: string;
  schema?: Record<string, unknown>;
}

// ---------- 数字员工 ----------

/** 数字员工简历 */
export interface Resume {
  rating: number; // 0-5
  completedCount: number;
  examples: string[];
  reviews: Review[];
}

/** 评价 */
export interface Review {
  id: string;
  fromUserId: string;
  fromName: string;
  rating: number;
  comment: string;
  createdAt: number;
}

/** 平台绑定 */
export interface PlatformBinding {
  id: string;
  platform: PlatformKind;
  platformUserId: string;
  boundAt: number;
  /** 接入会话状态 */
  state: IntegrationState;
}

/** Agent Card（标准化自描述，对齐开发者文档） */
export interface AgentCard {
  name: string;
  description: string;
  version: string;
  endpoints: string[];
  capabilities: string[];
}

/** 数字员工（平台核心抽象） */
export interface DigitalEmployee {
  id: string;
  // 身份
  name: string;
  avatar: string;
  role: string;
  title: string;
  bio: string;
  // 归属
  ownerId: string;
  ownerName: string;
  ownerType: OwnerType;
  // 能力
  capabilities: Capability[];
  // 简历
  resume: Resume;
  // 雇佣态
  status: EmployeeStatus;
  pricingModel: PricingModel;
  rate: number;
  currency: Currency;
  // 协议自描述
  agentCard: AgentCard;
  // 平台绑定
  bindings: PlatformBinding[];
  tags: string[];
  createdAt: number;
}

// ---------- 雇佣合同 ----------

/** 合同条款 */
export interface ContractTerms {
  type: PricingModel;
  amount: number;
  currency: Currency;
  durationDays: number;
}

/** 雇佣合同 = Order/Transaction 的人格化 */
export interface EmploymentContract {
  id: string;
  employerId: string;
  employerName: string;
  employeeId: string;
  employeeName: string;
  terms: ContractTerms;
  status: ContractStatus;
  startedAt: number;
  metrics: {
    assigned: number;
    completed: number;
    rating: number;
    earnings: number;
  };
}

// ---------- 派工单 ----------

export interface TaskOrder {
  id: string;
  contractId: string;
  assignerId: string;
  assignerName: string;
  assigneeEmployeeId: string;
  assigneeName: string;
  /** 一句话需求摘要（向后兼容，现在用 role 替代） */
  brief: string;
  // ---- 招聘 JD 格式需求 ----
  /** 岗位标题，如「资深文案撰写」 */
  role: string;
  /** 岗位职责（多行文本） */
  responsibilities: string;
  /** 任职要求/技能（多行文本） */
  requirements: string;
  /** 交付标准/交付物（多行文本） */
  deliverables: string;
  /** 预算（CNY），0 表示按合同计费 */
  budget: number;
  /** 技能标签 */
  skillTags: string[];
  priority: 'low' | 'normal' | 'high';
  deadline: number;
  status: TaskStatus;
  result?: string;
  createdAt: number;
}

// ---------- 结算 ----------

export interface Settlement {
  id: string;
  contractId: string;
  type: PricingModel;
  amount: number;
  currency: Currency;
  /** human→Order+CNY ; agent→Transaction+UT */
  callerType: OwnerType;
  description: string;
  createdAt: number;
}

// ---------- 接入会话 ----------

/** 接入草稿（composing 状态） */
export interface IntegrationDraft {
  sessionId: string;
  platform: PlatformKind;
  state: IntegrationState;
  deviceCode?: string;
  platformUserId?: string;
  selectedCapabilityIds: string[];
  name?: string;
  role?: string;
  bio?: string;
  pricingModel?: PricingModel;
  rate?: number;
  currency?: Currency;
  createdAt: number;
}

// ---------- 用户 ----------

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  /** 平台 API Key（Agent 路径用，对齐开发者文档 X-Api-Key） */
  apiKey: string;
  balanceCNY: number;
  balanceUT: number;
  createdAt: number;
}

// ---------- API 响应信封（对齐开发者文档） ----------

export interface ApiEnvelope<T> {
  code: number;
  message: string;
  data: T;
  timestamp: number;
}

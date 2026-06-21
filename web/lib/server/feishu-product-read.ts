import "server-only";

import type {
  Capability,
  Currency,
  DigitalEmployee,
  EmploymentContract,
  IntegrationDraft,
  PlatformBinding,
  Review,
  Settlement,
  TaskOrder,
  User,
} from "@/types";
import { findRecordByField, searchTableRecords, type BitableRecord } from "./feishu-bitable";

const text = (value: unknown): string => {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    return value.map((item) => {
      if (typeof item === "string") return item;
      if (item && typeof item === "object" && "text" in item) return String(item.text);
      return "";
    }).join("");
  }
  return value == null ? "" : String(value);
};

const number = (value: unknown): number => {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const seconds = (value: unknown): number => {
  const timestamp = number(value);
  return timestamp > 10_000_000_000 ? Math.floor(timestamp / 1000) : timestamp;
};

const json = <T>(value: unknown, fallback: T): T => {
  if (typeof value !== "string" || value === "") return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

export async function listDigitalEmployees(): Promise<DigitalEmployee[]> {
  const [employeeRecords, capabilityRecords, relationRecords, bindingRecords, reviewRecords] = await Promise.all([
    searchTableRecords("employees"),
    searchTableRecords("capabilities"),
    searchTableRecords("employeeCapabilities"),
    searchTableRecords("platformBindings"),
    searchTableRecords("reviews"),
  ]);

  const capabilities = new Map<string, Capability>();
  for (const record of capabilityRecords) {
    const fields = record.fields;
    capabilities.set(text(fields.能力ID), {
      id: text(fields.能力ID),
      kind: text(fields.类型) as Capability["kind"],
      name: text(fields.名称),
      description: text(fields.描述),
      category: text(fields.分类),
      schema: json<Record<string, unknown> | undefined>(fields.SchemaJSON, undefined),
    });
  }

  const capabilityIdsByEmployee = new Map<string, string[]>();
  for (const record of relationRecords) {
    const fields = record.fields;
    if (fields.是否启用 === false) continue;
    const employeeId = text(fields.员工ID);
    capabilityIdsByEmployee.set(employeeId, [...(capabilityIdsByEmployee.get(employeeId) || []), text(fields.能力ID)]);
  }

  const bindingsByEmployee = new Map<string, PlatformBinding[]>();
  for (const record of bindingRecords) {
    const fields = record.fields;
    const employeeId = text(fields.员工ID);
    const binding: PlatformBinding = {
      id: text(fields.绑定ID),
      platform: text(fields.平台) as PlatformBinding["platform"],
      platformUserId: text(fields.平台用户ID),
      state: text(fields.状态) as PlatformBinding["state"],
      boundAt: seconds(fields.绑定时间),
    };
    bindingsByEmployee.set(employeeId, [...(bindingsByEmployee.get(employeeId) || []), binding]);
  }

  const reviewsByEmployee = new Map<string, Review[]>();
  for (const record of reviewRecords) {
    const fields = record.fields;
    const employeeId = text(fields.员工ID);
    const review: Review = {
      id: text(fields.评价ID),
      fromUserId: text(fields.评价人ID),
      fromName: text(fields.评价人名称),
      rating: number(fields.评分),
      comment: text(fields.内容),
      createdAt: seconds(fields.创建时间),
    };
    reviewsByEmployee.set(employeeId, [...(reviewsByEmployee.get(employeeId) || []), review]);
  }

  return employeeRecords.map((record) => mapEmployee(
    record,
    capabilityIdsByEmployee,
    capabilities,
    bindingsByEmployee,
    reviewsByEmployee
  ));
}

export async function getDigitalEmployee(employeeId: string): Promise<DigitalEmployee | null> {
  const employees = await listDigitalEmployees();
  return employees.find((employee) => employee.id === employeeId) || null;
}

function mapEmployee(
  record: BitableRecord,
  capabilityIdsByEmployee: Map<string, string[]>,
  capabilities: Map<string, Capability>,
  bindingsByEmployee: Map<string, PlatformBinding[]>,
  reviewsByEmployee: Map<string, Review[]>
): DigitalEmployee {
  const fields = record.fields;
  const id = text(fields.员工ID);
  return {
    id,
    name: text(fields.姓名),
    avatar: text(fields.头像) || "🤖",
    role: text(fields.岗位),
    title: text(fields.标题),
    bio: text(fields.简介),
    ownerId: text(fields.所有者ID),
    ownerName: text(fields.所有者名称),
    ownerType: text(fields.所有者类型) === "agent" ? "agent" : "human",
    capabilities: (capabilityIdsByEmployee.get(id) || []).map((capabilityId) => capabilities.get(capabilityId)).filter(Boolean) as Capability[],
    resume: {
      rating: number(fields.评分),
      completedCount: number(fields.完成单数),
      examples: json<string[]>(fields.样例JSON, []),
      reviews: reviewsByEmployee.get(id) || [],
    },
    status: text(fields.状态) as DigitalEmployee["status"],
    pricingModel: text(fields.计费模型) as DigitalEmployee["pricingModel"],
    rate: number(fields.价格),
    currency: text(fields.币种) as Currency,
    agentCard: json(fields.AgentCardJSON, { name: id, description: "", version: "1.0.0", endpoints: [], capabilities: [] }),
    bindings: bindingsByEmployee.get(id) || [],
    tags: json<string[]>(fields.标签JSON, []),
    createdAt: seconds(fields.创建时间),
  };
}

export async function getUserWallet(user: Pick<User, "id" | "name" | "email">): Promise<User> {
  const record = await findRecordByField("wallets", "用户ID", user.id);
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatar: "👤",
    apiKey: "",
    balanceCNY: record ? number(record.fields.CNY余额) : 0,
    balanceUT: record ? number(record.fields.UT余额) : 0,
    createdAt: 0,
  };
}

export async function listUserContracts(userId: string): Promise<EmploymentContract[]> {
  const records = await searchTableRecords("contracts", {
    filter: { conjunction: "and", conditions: [{ field_name: "雇主ID", operator: "is", value: [userId] }] },
  });
  return records.map(mapContract);
}

export async function getContract(contractId: string): Promise<EmploymentContract | null> {
  const record = await findRecordByField("contracts", "合同ID", contractId);
  return record ? mapContract(record) : null;
}

function mapContract(record: BitableRecord): EmploymentContract {
  const fields = record.fields;
  return {
    id: text(fields.合同ID),
    employerId: text(fields.雇主ID),
    employerName: text(fields.雇主名称),
    employeeId: text(fields.员工ID),
    employeeName: text(fields.员工名称),
    terms: {
      type: text(fields.计费模型) as EmploymentContract["terms"]["type"],
      amount: number(fields.金额),
      currency: text(fields.币种) as Currency,
      durationDays: number(fields.周期天数),
    },
    status: text(fields.状态) as EmploymentContract["status"],
    startedAt: seconds(fields.开始时间),
    metrics: {
      assigned: number(fields.已派任务),
      completed: number(fields.已完成任务),
      rating: number(fields.评分),
      earnings: number(fields.累计收益),
    },
  };
}

export async function listUserTasks(userId: string): Promise<TaskOrder[]> {
  const records = await searchTableRecords("tasks", {
    filter: { conjunction: "and", conditions: [{ field_name: "派单人ID", operator: "is", value: [userId] }] },
  });
  return records.map(mapTask);
}

export async function getTask(taskId: string): Promise<TaskOrder | null> {
  const record = await findRecordByField("tasks", "任务ID", taskId);
  return record ? mapTask(record) : null;
}

function mapTask(record: BitableRecord): TaskOrder {
  const fields = record.fields;
  const roleText = text(fields.岗位名称) || text(fields.任务描述);
  const skillTagsField = fields.技能标签;
  const skillTags = Array.isArray(skillTagsField)
    ? skillTagsField.filter((s): s is string => typeof s === "string")
    : [];
  return {
    id: text(fields.任务ID),
    contractId: text(fields.合同ID),
    assignerId: text(fields.派单人ID),
    assignerName: text(fields.派单人名称),
    assigneeEmployeeId: text(fields.员工ID),
    assigneeName: text(fields.员工名称),
    brief: text(fields.任务描述) || roleText,
    role: roleText,
    responsibilities: text(fields.岗位职责),
    requirements: text(fields.任职要求),
    deliverables: text(fields.交付标准),
    budget: number(fields.预算),
    skillTags,
    priority: text(fields.优先级) as TaskOrder["priority"],
    deadline: seconds(fields.截止时间),
    status: text(fields.状态) as TaskOrder["status"],
    result: text(fields.交付结果) || undefined,
    createdAt: seconds(fields.创建时间),
  };
}

export async function listUserSettlements(userId: string): Promise<Settlement[]> {
  const contracts = await listUserContracts(userId);
  if (contracts.length === 0) return [];
  const contractIds = new Set(contracts.map((contract) => contract.id));
  const records = await searchTableRecords("settlements");
  return records.filter((record) => contractIds.has(text(record.fields.合同ID))).map(mapSettlement);
}

function mapSettlement(record: BitableRecord): Settlement {
  const fields = record.fields;
  return {
    id: text(fields.结算ID),
    contractId: text(fields.合同ID),
    type: text(fields.计费模型) as Settlement["type"],
    amount: number(fields.金额),
    currency: text(fields.币种) as Currency,
    callerType: text(fields.调用方类型) === "agent" ? "agent" : "human",
    description: text(fields.描述),
    createdAt: seconds(fields.创建时间),
  };
}

export async function listUserIntegrationDrafts(userId: string): Promise<IntegrationDraft[]> {
  const records = await searchTableRecords("integrationSessions", {
    filter: { conjunction: "and", conditions: [{ field_name: "用户ID", operator: "is", value: [userId] }] },
  });
  return records.map((record) => {
    const fields = record.fields;
    const draft = json<Record<string, unknown>>(fields.草稿JSON, {});
    return {
      sessionId: text(fields.会话ID),
      platform: text(fields.平台) as IntegrationDraft["platform"],
      state: text(fields.状态) as IntegrationDraft["state"],
      platformUserId: text(fields.平台用户ID) || undefined,
      selectedCapabilityIds: json<string[]>(fields.已选能力JSON, []),
      name: text(draft.name) || undefined,
      role: text(draft.role) || undefined,
      bio: text(draft.bio) || undefined,
      pricingModel: text(draft.pricingModel) as IntegrationDraft["pricingModel"],
      rate: number(draft.rate) || undefined,
      currency: text(draft.currency) as IntegrationDraft["currency"],
      createdAt: seconds(fields.创建时间),
    };
  });
}

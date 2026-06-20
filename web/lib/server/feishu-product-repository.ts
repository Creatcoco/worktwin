import "server-only";

import type {
  Capability,
  DigitalEmployee,
  EmploymentContract,
  IntegrationDraft,
  Review,
  Settlement,
  TaskOrder,
  User,
} from "@/types";
import {
  createTableRecord,
  findRecordByField,
  upsertTableRecord,
  type BitableRecord,
} from "./feishu-bitable";

const json = (value: unknown) => JSON.stringify(value ?? null);
const dateMs = (timestamp: number | undefined) => {
  if (!timestamp) return undefined;
  return timestamp > 10_000_000_000 ? timestamp : timestamp * 1000;
};

const riskLevel = (capability: Capability): "low" | "medium" | "high" => {
  const highRiskNames = ["exec", "terminal", "write", "send", "upload", "payment"];
  if (highRiskNames.some((name) => capability.name.toLowerCase().includes(name))) return "high";
  return capability.kind === "skill" ? "low" : "medium";
};

export async function saveWallet(user: User): Promise<BitableRecord> {
  return upsertTableRecord({
    table: "wallets",
    idField: "钱包ID",
    id: `wallet_${user.id}`,
    fields: {
      钱包ID: `wallet_${user.id}`,
      用户ID: user.id,
      CNY余额: user.balanceCNY,
      UT余额: user.balanceUT,
      版本: 1,
      更新时间: Date.now(),
    },
  });
}

export async function saveEmployeeBundle(employee: DigitalEmployee): Promise<BitableRecord> {
  const employeeRecord = await saveEmployeeRecord(employee);
  const now = Date.now();

  for (const capability of employee.capabilities) {
    await saveCapability(capability);
    await upsertTableRecord({
      table: "employeeCapabilities",
      idField: "关联ID",
      id: `${employee.id}:${capability.id}`,
      fields: {
        关联ID: `${employee.id}:${capability.id}`,
        员工ID: employee.id,
        能力ID: capability.id,
        是否启用: true,
        风险等级: riskLevel(capability),
        创建时间: dateMs(employee.createdAt),
        更新时间: now,
      },
    });
  }

  for (const binding of employee.bindings) {
    await upsertTableRecord({
      table: "platformBindings",
      idField: "绑定ID",
      id: binding.id,
      fields: {
        绑定ID: binding.id,
        员工ID: employee.id,
        平台: binding.platform,
        平台用户ID: binding.platformUserId,
        状态: binding.state,
        凭证引用: "",
        绑定时间: dateMs(binding.boundAt),
        更新时间: now,
      },
    });
  }

  for (const review of employee.resume.reviews) {
    await appendReview(review, employee.id);
  }
  return employeeRecord;
}

export async function saveEmployeeRecord(employee: DigitalEmployee): Promise<BitableRecord> {
  const now = Date.now();
  return upsertTableRecord({
    table: "employees",
    idField: "员工ID",
    id: employee.id,
    fields: {
      员工ID: employee.id,
      所有者ID: employee.ownerId,
      所有者名称: employee.ownerName,
      所有者类型: employee.ownerType,
      姓名: employee.name,
      头像: employee.avatar,
      岗位: employee.role,
      标题: employee.title,
      简介: employee.bio,
      状态: employee.status,
      计费模型: employee.pricingModel,
      价格: employee.rate,
      币种: employee.currency,
      标签JSON: json(employee.tags),
      AgentCardJSON: json(employee.agentCard),
      评分: employee.resume.rating,
      完成单数: employee.resume.completedCount,
      样例JSON: json(employee.resume.examples),
      创建时间: dateMs(employee.createdAt),
      更新时间: now,
    },
  });
}

export async function saveCapability(capability: Capability): Promise<BitableRecord> {
  return upsertTableRecord({
    table: "capabilities",
    idField: "能力ID",
    id: capability.id,
    fields: {
      能力ID: capability.id,
      类型: capability.kind,
      名称: capability.name,
      描述: capability.description,
      分类: capability.category,
      SchemaJSON: json(capability.schema),
      创建时间: Date.now(),
      更新时间: Date.now(),
    },
  });
}

export async function saveIntegrationSession(draft: IntegrationDraft, userId: string): Promise<BitableRecord> {
  return upsertTableRecord({
    table: "integrationSessions",
    idField: "会话ID",
    id: draft.sessionId,
    fields: {
      会话ID: draft.sessionId,
      用户ID: userId,
      平台: draft.platform,
      状态: draft.state,
      平台用户ID: draft.platformUserId || "",
      已选能力JSON: json(draft.selectedCapabilityIds),
      草稿JSON: json({
        name: draft.name,
        role: draft.role,
        bio: draft.bio,
        pricingModel: draft.pricingModel,
        rate: draft.rate,
        currency: draft.currency,
      }),
      错误信息: "",
      创建时间: dateMs(draft.createdAt),
      更新时间: Date.now(),
    },
  });
}

export async function saveContract(contract: EmploymentContract): Promise<BitableRecord> {
  return upsertTableRecord({
    table: "contracts",
    idField: "合同ID",
    id: contract.id,
    fields: {
      合同ID: contract.id,
      雇主ID: contract.employerId,
      雇主名称: contract.employerName,
      员工ID: contract.employeeId,
      员工名称: contract.employeeName,
      计费模型: contract.terms.type,
      金额: contract.terms.amount,
      币种: contract.terms.currency,
      周期天数: contract.terms.durationDays,
      状态: contract.status,
      已派任务: contract.metrics.assigned,
      已完成任务: contract.metrics.completed,
      评分: contract.metrics.rating,
      累计收益: contract.metrics.earnings,
      开始时间: dateMs(contract.startedAt),
      更新时间: Date.now(),
    },
  });
}

export async function saveTask(task: TaskOrder): Promise<BitableRecord> {
  return upsertTableRecord({
    table: "tasks",
    idField: "任务ID",
    id: task.id,
    fields: {
      任务ID: task.id,
      幂等键: `task:${task.id}`,
      合同ID: task.contractId,
      派单人ID: task.assignerId,
      派单人名称: task.assignerName,
      员工ID: task.assigneeEmployeeId,
      员工名称: task.assigneeName,
      任务描述: task.brief,
      优先级: task.priority,
      截止时间: dateMs(task.deadline),
      状态: task.status,
      交付结果: task.result || "",
      创建时间: dateMs(task.createdAt),
      更新时间: Date.now(),
      完成时间: task.status === "done" ? Date.now() : undefined,
    },
  });
}

export async function appendSettlement(
  settlement: Settlement,
  taskId?: string
): Promise<BitableRecord> {
  const idempotencyKey = taskId ? `settlement:${settlement.contractId}:${taskId}` : `settlement:${settlement.id}`;
  const existing = await findRecordByField("settlements", "幂等键", idempotencyKey);
  if (existing) return existing;
  return createTableRecord("settlements", {
    结算ID: settlement.id,
    幂等键: idempotencyKey,
    合同ID: settlement.contractId,
    任务ID: taskId || "",
    计费模型: settlement.type,
    金额: settlement.amount,
    币种: settlement.currency,
    调用方类型: settlement.callerType,
    状态: "posted",
    描述: settlement.description,
    创建时间: dateMs(settlement.createdAt),
    记账时间: Date.now(),
  });
}

export async function appendReview(review: Review, employeeId: string): Promise<BitableRecord> {
  const existing = await findRecordByField("reviews", "评价ID", review.id);
  if (existing) return existing;
  return createTableRecord("reviews", {
    评价ID: review.id,
    合同ID: "",
    任务ID: "",
    员工ID: employeeId,
    评价人ID: review.fromUserId,
    评价人名称: review.fromName,
    评分: review.rating,
    内容: review.comment,
    创建时间: dateMs(review.createdAt),
  });
}

export async function appendAuditLog(input: {
  id: string;
  userId?: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  requestId?: string;
  metadata?: Record<string, unknown>;
  ipHash?: string;
}): Promise<BitableRecord> {
  const existing = await findRecordByField("auditLogs", "审计ID", input.id);
  if (existing) return existing;
  return createTableRecord("auditLogs", {
    审计ID: input.id,
    用户ID: input.userId || "",
    操作: input.action,
    资源类型: input.resourceType,
    资源ID: input.resourceId || "",
    请求ID: input.requestId || "",
    元数据JSON: json(input.metadata),
    IP哈希: input.ipHash || "",
    创建时间: Date.now(),
  });
}

export async function saveApiKey(input: {
  id: string;
  userId: string;
  prefix: string;
  hash: string;
  scopes: string[];
}): Promise<BitableRecord> {
  return upsertTableRecord({
    table: "apiKeys",
    idField: "密钥ID",
    id: input.id,
    fields: {
      密钥ID: input.id,
      用户ID: input.userId,
      密钥前缀: input.prefix,
      密钥哈希: input.hash,
      状态: "active",
      权限JSON: json(input.scopes),
      创建时间: Date.now(),
    },
  });
}

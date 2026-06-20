import { createHash, randomBytes, randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/server/auth-security";
import {
  getContract,
  getDigitalEmployee,
  getTask,
  getUserWallet,
  listUserContracts,
} from "@/lib/server/feishu-product-read";
import {
  appendAuditLog,
  appendSettlement,
  saveApiKey,
  saveContract,
  saveEmployeeBundle,
  saveEmployeeRecord,
  saveIntegrationSession,
  saveTask,
  saveWallet,
} from "@/lib/server/feishu-product-repository";
import { checkRateLimit, RATE_LIMIT_WINDOW_SECONDS, resolveRateLimitKey } from "@/lib/server/rate-limit";
import type {
  Capability,
  Currency,
  DigitalEmployee,
  EmploymentContract,
  IntegrationDraft,
  PlatformKind,
  PricingModel,
  Settlement,
  TaskOrder,
} from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ActionBody = { action?: string; payload?: Record<string, unknown> };

export async function POST(request: NextRequest) {
  const session = getSession(request);
  if (!session) return NextResponse.json({ message: "请先登录" }, { status: 401 });

  // 单人频控：1 分钟 1 次（已登录用 userId）
  const { key } = resolveRateLimitKey(request, session);
  const limit = checkRateLimit(`data:action:${key}`);
  if (!limit.allowed) {
    return NextResponse.json(
      { message: `请求过于频繁，请 ${limit.retryAfterSeconds} 秒后再试` },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds || RATE_LIMIT_WINDOW_SECONDS) } }
    );
  }

  let body: ActionBody;
  try {
    body = (await request.json()) as ActionBody;
  } catch {
    return NextResponse.json({ message: "请求格式不正确" }, { status: 400 });
  }

  try {
    const payload = body.payload || {};
    switch (body.action) {
      case "hireEmployee":
        return NextResponse.json({ contract: await hireEmployee(session, text(payload.employeeId)) });
      case "setContractStatus":
        return NextResponse.json({ contract: await setContractStatus(session.userId, text(payload.contractId), text(payload.status)) });
      case "setEmployeeStatus":
        return NextResponse.json({ employee: await setEmployeeStatus(session.userId, text(payload.employeeId), text(payload.status)) });
      case "publishIntegration":
        return NextResponse.json(await publishIntegration(session, payload));
      case "createTask":
        return NextResponse.json({ task: await createTask(session, payload) });
      case "advanceTask":
        return NextResponse.json(await advanceTask(session.userId, text(payload.taskId)));
      case "rotateApiKey":
        return NextResponse.json({ apiKey: await rotateApiKey(session.userId) });
      default:
        return NextResponse.json({ message: "不支持的数据操作" }, { status: 400 });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "业务操作失败";
    const status = message.includes("无权") ? 403 : message.includes("不存在") || message.includes("不可") ? 409 : 400;
    return NextResponse.json({ message }, { status });
  }
}

const text = (value: unknown) => typeof value === "string" ? value.trim() : "";
const number = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};
const nowSeconds = () => Math.floor(Date.now() / 1000);
const id = (prefix: string) => `${prefix}_${randomUUID().replaceAll("-", "")}`;

async function hireEmployee(session: { userId: string; name: string }, employeeId: string) {
  const employee = await getDigitalEmployee(employeeId);
  if (!employee) throw new Error("数字员工不存在");
  if (employee.ownerId === session.userId || employee.status === "offline") throw new Error("当前员工不可雇佣");
  const existing = (await listUserContracts(session.userId)).find((contract) => contract.employeeId === employeeId && contract.status === "active");
  if (existing) return existing;

  const contract: EmploymentContract = {
    id: id("contract"),
    employerId: session.userId,
    employerName: session.name,
    employeeId: employee.id,
    employeeName: employee.name,
    terms: { type: employee.pricingModel, amount: employee.rate, currency: employee.currency, durationDays: 30 },
    status: "active",
    startedAt: nowSeconds(),
    metrics: { assigned: 0, completed: 0, rating: 0, earnings: 0 },
  };
  await saveContract(contract);
  employee.status = "hired";
  await saveEmployeeRecord(employee);
  await audit(session.userId, "contract.create", "contract", contract.id, { employeeId });
  return contract;
}

async function setContractStatus(userId: string, contractId: string, status: string) {
  const contract = await getContract(contractId);
  if (!contract) throw new Error("合同不存在");
  if (contract.employerId !== userId) throw new Error("无权修改该合同");
  if (!(["active", "paused", "ended"] as string[]).includes(status)) throw new Error("合同状态不正确");
  contract.status = status as EmploymentContract["status"];
  await saveContract(contract);
  await audit(userId, "contract.status.update", "contract", contract.id, { status });
  return contract;
}

async function setEmployeeStatus(userId: string, employeeId: string, status: string) {
  const employee = await getDigitalEmployee(employeeId);
  if (!employee) throw new Error("数字员工不存在");
  if (employee.ownerId !== userId) throw new Error("无权修改该员工");
  if (!(["available", "offline"] as string[]).includes(status)) throw new Error("员工状态不正确");
  employee.status = status as DigitalEmployee["status"];
  await saveEmployeeRecord(employee);
  await audit(userId, "employee.status.update", "employee", employee.id, { status });
  return employee;
}

async function publishIntegration(
  session: { userId: string; name: string },
  payload: Record<string, unknown>
) {
  const platform = text(payload.platform) as PlatformKind;
  const name = text(payload.name);
  const role = text(payload.role);
  const rate = number(payload.rate);
  const capabilities = Array.isArray(payload.capabilities) ? payload.capabilities as Capability[] : [];
  if (!name || !role || rate <= 0 || capabilities.length === 0) throw new Error("员工资料或能力不完整");

  const employeeId = id("employee");
  const createdAt = nowSeconds();
  const currency = text(payload.currency) as Currency;
  const employee: DigitalEmployee = {
    id: employeeId,
    name,
    avatar: currency === "UT" ? "🤖" : "👤",
    role,
    title: `${platform} 接入 · ${capabilities.length} 项能力`,
    bio: text(payload.bio) || `由 ${platform} 接入生成的工作分身。`,
    ownerId: session.userId,
    ownerName: session.name,
    ownerType: currency === "UT" ? "agent" : "human",
    capabilities,
    resume: { rating: 0, completedCount: 0, examples: capabilities.slice(0, 3).map((item) => `${item.name} 示例交付`), reviews: [] },
    status: "available",
    pricingModel: text(payload.pricingModel) as PricingModel,
    rate,
    currency,
    agentCard: {
      name: name.toLowerCase().replace(/\s+/g, "-"),
      description: text(payload.bio) || role,
      version: "0.1.0",
      endpoints: [`https://api.worktwin.cn/a2a/${employeeId}`],
      capabilities: capabilities.map((item) => item.name),
    },
    bindings: [{
      id: id("binding"),
      platform,
      platformUserId: `${platform}_${employeeId}`,
      boundAt: createdAt,
      state: "connected",
    }],
    tags: Array.from(new Set(capabilities.map((item) => item.category))).slice(0, 4),
    createdAt,
  };
  const draft: IntegrationDraft = {
    sessionId: id("session"),
    platform,
    state: "connected",
    platformUserId: employee.bindings[0].platformUserId,
    selectedCapabilityIds: capabilities.map((item) => item.id),
    name,
    role,
    bio: employee.bio,
    pricingModel: employee.pricingModel,
    rate,
    currency,
    createdAt,
  };
  await saveEmployeeBundle(employee);
  await saveIntegrationSession(draft, session.userId);
  await audit(session.userId, "employee.publish", "employee", employee.id, { platform });
  return { employee, draft };
}

async function createTask(session: { userId: string; name: string; email: string }, payload: Record<string, unknown>) {
  const contract = await getContract(text(payload.contractId));
  if (!contract) throw new Error("合同不存在");
  if (contract.employerId !== session.userId) throw new Error("无权使用该合同");
  if (contract.status !== "active") throw new Error("合同当前不可派单");
  const wallet = await getUserWallet({ id: session.userId, name: session.name, email: session.email });
  const balance = contract.terms.currency === "CNY" ? wallet.balanceCNY : wallet.balanceUT;
  if (balance < contract.terms.amount) throw new Error("钱包余额不足");

  const createdAt = nowSeconds();
  const task: TaskOrder = {
    id: id("task"),
    contractId: contract.id,
    assignerId: session.userId,
    assignerName: session.name,
    assigneeEmployeeId: contract.employeeId,
    assigneeName: contract.employeeName,
    brief: text(payload.brief),
    priority: text(payload.priority) as TaskOrder["priority"],
    deadline: createdAt + Math.max(1, number(payload.deadlineDays)) * 86400,
    status: "queued",
    createdAt,
  };
  if (!task.brief) throw new Error("任务描述不能为空");
  await saveTask(task);
  contract.metrics.assigned += 1;
  await saveContract(contract);
  await audit(session.userId, "task.create", "task", task.id, { contractId: contract.id });
  return task;
}

async function advanceTask(userId: string, taskId: string) {
  const task = await getTask(taskId);
  if (!task) throw new Error("任务不存在");
  if (task.assignerId !== userId) throw new Error("无权推进该任务");
  if (task.status === "done" || task.status === "rejected") return { task };
  const flow: Record<TaskOrder["status"], TaskOrder["status"]> = {
    queued: "running", running: "review", review: "done", done: "done", rejected: "rejected",
  };
  task.status = flow[task.status];
  if (task.status !== "done") {
    await saveTask(task);
    await audit(userId, "task.status.update", "task", task.id, { status: task.status });
    return { task };
  }

  const contract = await getContract(task.contractId);
  if (!contract) throw new Error("合同不存在");
  const wallet = await getUserWallet({ id: userId, name: contract.employerName, email: "" });
  const balance = contract.terms.currency === "CNY" ? wallet.balanceCNY : wallet.balanceUT;
  if (balance < contract.terms.amount) throw new Error("结算失败：钱包余额不足");
  task.result = "已交付：任务完成，等待雇主复核与评分。";
  const settlement: Settlement = {
    id: id("settlement"),
    contractId: contract.id,
    type: contract.terms.type,
    amount: contract.terms.amount,
    currency: contract.terms.currency,
    callerType: contract.terms.currency === "UT" ? "agent" : "human",
    description: `${task.brief.slice(0, 24)} · 自动结算`,
    createdAt: nowSeconds(),
  };
  await saveTask(task);
  await appendSettlement(settlement, task.id);
  if (settlement.currency === "CNY") wallet.balanceCNY -= settlement.amount;
  else wallet.balanceUT -= settlement.amount;
  await saveWallet(wallet);
  contract.metrics.completed += 1;
  contract.metrics.earnings += settlement.amount;
  await saveContract(contract);
  await audit(userId, "settlement.post", "settlement", settlement.id, { taskId: task.id, amount: settlement.amount, currency: settlement.currency });
  return { task, settlement, wallet, contract };
}

async function rotateApiKey(userId: string) {
  const secret = `sk_worktwin_${randomBytes(24).toString("hex")}`;
  const keyId = id("key");
  await saveApiKey({
    id: keyId,
    userId,
    prefix: secret.slice(0, 20),
    hash: createHash("sha256").update(secret).digest("hex"),
    scopes: ["capabilities:read", "tasks:write", "agent_card:read"],
  });
  await audit(userId, "api_key.rotate", "api_key", keyId);
  return secret;
}

async function audit(userId: string, action: string, resourceType: string, resourceId: string, metadata?: Record<string, unknown>) {
  await appendAuditLog({ id: id("audit"), userId, action, resourceType, resourceId, metadata });
}

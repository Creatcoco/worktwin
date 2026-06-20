import "server-only";

import { getFeishuAuthConfig } from "./feishu-auth-config";

const FEISHU_API = "https://open.feishu.cn/open-apis";

export const USER_FIELDS = {
  userId: "用户ID",
  email: "邮箱",
  name: "姓名",
  passwordHash: "密码哈希",
  passwordSalt: "密码盐",
  status: "状态",
  role: "角色",
  createdAt: "创建时间",
  updatedAt: "更新时间",
  lastLoginAt: "最后登录时间",
  lastLogoutAt: "最近退出时间",
} as const;

export interface FeishuUser {
  recordId: string;
  userId: string;
  email: string;
  name: string;
  passwordHash: string;
  passwordSalt: string;
  status: "active" | "disabled";
  role: "user" | "admin";
  createdAt: number;
  updatedAt: number;
  lastLoginAt?: number;
  lastLogoutAt?: number;
}

type FeishuRecord = {
  record_id: string;
  fields: Record<string, unknown>;
};

type FeishuResponse<T> = {
  code: number;
  msg?: string;
  data?: T;
};

type TokenCache = {
  token: string;
  expiresAt: number;
};

const globalTokenCache = globalThis as typeof globalThis & {
  __worktwinFeishuToken?: TokenCache;
};

async function getTenantAccessToken(): Promise<string> {
  const config = getFeishuAuthConfig();
  if (config.tenantAccessToken) return config.tenantAccessToken;

  const cached = globalTokenCache.__worktwinFeishuToken;
  if (cached && cached.expiresAt > Date.now() + 60_000) return cached.token;

  const response = await fetch(`${FEISHU_API}/auth/v3/tenant_access_token/internal`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ app_id: config.appId, app_secret: config.appSecret }),
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  });
  const payload = (await response.json()) as FeishuResponse<never> & {
    tenant_access_token?: string;
    expire?: number;
  };
  if (!response.ok || payload.code !== 0 || !payload.tenant_access_token) {
    throw new Error(`飞书租户认证失败：${payload.msg || response.status}`);
  }

  globalTokenCache.__worktwinFeishuToken = {
    token: payload.tenant_access_token,
    expiresAt: Date.now() + (payload.expire || 7200) * 1000,
  };
  return payload.tenant_access_token;
}

async function feishuRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await getTenantAccessToken();
  const response = await fetch(`${FEISHU_API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json; charset=utf-8",
      ...init?.headers,
    },
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  });
  const payload = (await response.json()) as FeishuResponse<T>;
  if (!response.ok || payload.code !== 0 || payload.data === undefined) {
    throw new Error(`飞书多维表格请求失败：${payload.msg || response.status}`);
  }
  return payload.data;
}

function tablePath(suffix = ""): string {
  const config = getFeishuAuthConfig();
  return `/bitable/v1/apps/${encodeURIComponent(config.appToken)}/tables/${encodeURIComponent(config.tableId)}${suffix}`;
}

function textValue(value: unknown): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === "string") return item;
        if (item && typeof item === "object" && "text" in item) return String(item.text);
        return "";
      })
      .join("");
  }
  return value == null ? "" : String(value);
}

function numberValue(value: unknown): number {
  if (typeof value === "number") return value;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function mapRecord(record: FeishuRecord): FeishuUser {
  const fields = record.fields;
  return {
    recordId: record.record_id,
    userId: textValue(fields[USER_FIELDS.userId]),
    email: textValue(fields[USER_FIELDS.email]).toLowerCase(),
    name: textValue(fields[USER_FIELDS.name]),
    passwordHash: textValue(fields[USER_FIELDS.passwordHash]),
    passwordSalt: textValue(fields[USER_FIELDS.passwordSalt]),
    status: textValue(fields[USER_FIELDS.status]) === "disabled" ? "disabled" : "active",
    role: textValue(fields[USER_FIELDS.role]) === "admin" ? "admin" : "user",
    createdAt: numberValue(fields[USER_FIELDS.createdAt]),
    updatedAt: numberValue(fields[USER_FIELDS.updatedAt]),
    lastLoginAt: numberValue(fields[USER_FIELDS.lastLoginAt]) || undefined,
    lastLogoutAt: numberValue(fields[USER_FIELDS.lastLogoutAt]) || undefined,
  };
}

export async function findUserByEmail(email: string): Promise<FeishuUser | null> {
  const data = await feishuRequest<{ items?: FeishuRecord[] }>(
    `${tablePath("/records/search")}?page_size=2`,
    {
      method: "POST",
      body: JSON.stringify({
        filter: {
          conjunction: "and",
          conditions: [
            { field_name: USER_FIELDS.email, operator: "is", value: [email.toLowerCase()] },
          ],
        },
      }),
    }
  );
  const record = data.items?.[0];
  return record ? mapRecord(record) : null;
}

export async function createUser(input: {
  userId: string;
  email: string;
  name: string;
  passwordHash: string;
  passwordSalt: string;
}): Promise<FeishuUser> {
  const now = Date.now();
  const data = await feishuRequest<{ record: FeishuRecord }>(tablePath("/records"), {
    method: "POST",
    body: JSON.stringify({
      fields: {
        [USER_FIELDS.userId]: input.userId,
        [USER_FIELDS.email]: input.email.toLowerCase(),
        [USER_FIELDS.name]: input.name,
        [USER_FIELDS.passwordHash]: input.passwordHash,
        [USER_FIELDS.passwordSalt]: input.passwordSalt,
        [USER_FIELDS.status]: "active",
        [USER_FIELDS.role]: "user",
        [USER_FIELDS.createdAt]: now,
        [USER_FIELDS.updatedAt]: now,
      },
    }),
  });
  return mapRecord(data.record);
}

export async function updateLastLogin(user: FeishuUser): Promise<void> {
  const now = Date.now();
  await feishuRequest<{ record: FeishuRecord }>(
    tablePath(`/records/${encodeURIComponent(user.recordId)}`),
    {
      method: "PUT",
      body: JSON.stringify({
        fields: {
          [USER_FIELDS.lastLoginAt]: now,
          [USER_FIELDS.updatedAt]: now,
        },
      }),
    }
  );
}

export async function updateLastLogout(recordId: string): Promise<void> {
  const now = Date.now();
  await feishuRequest<{ record: FeishuRecord }>(
    tablePath(`/records/${encodeURIComponent(recordId)}`),
    {
      method: "PUT",
      body: JSON.stringify({
        fields: {
          [USER_FIELDS.lastLogoutAt]: now,
          [USER_FIELDS.updatedAt]: now,
        },
      }),
    }
  );
}

export async function checkFeishuUserTable(): Promise<{ ok: true }> {
  const data = await feishuRequest<{ items?: Array<{ field_name?: string }> }>(
    `${tablePath("/fields")}?page_size=100`
  );
  const available = new Set((data.items || []).map((field) => field.field_name));
  const missing = Object.values(USER_FIELDS).filter((field) => !available.has(field));
  if (missing.length) {
    throw new Error(`飞书用户表缺少字段：${missing.join("、")}`);
  }
  return { ok: true };
}

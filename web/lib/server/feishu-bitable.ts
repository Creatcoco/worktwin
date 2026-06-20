import "server-only";

import { getFeishuAuthConfig, getFeishuTableId } from "./feishu-auth-config";
import type { ProductTableKey } from "./feishu-product-schema";

const FEISHU_API = "https://open.feishu.cn/open-apis";

export interface BitableRecord {
  record_id: string;
  fields: Record<string, unknown>;
}

export interface BitableField {
  field_id?: string;
  field_name?: string;
  type?: number;
}

type FeishuResponse<T> = {
  code: number;
  msg?: string;
  data?: T;
};

type TokenCache = { token: string; expiresAt: number };
const globalState = globalThis as typeof globalThis & {
  __worktwinFeishuToken?: TokenCache;
  __worktwinBitableQueues?: Map<string, Promise<void>>;
};

const writeQueues = globalState.__worktwinBitableQueues ?? new Map<string, Promise<void>>();
globalState.__worktwinBitableQueues = writeQueues;

async function getTenantAccessToken(): Promise<string> {
  const config = getFeishuAuthConfig();
  if (config.tenantAccessToken) return config.tenantAccessToken;
  const cached = globalState.__worktwinFeishuToken;
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
  globalState.__worktwinFeishuToken = {
    token: payload.tenant_access_token,
    expiresAt: Date.now() + (payload.expire || 7200) * 1000,
  };
  return payload.tenant_access_token;
}

export async function feishuBitableRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await getTenantAccessToken();
  const response = await fetch(`${FEISHU_API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json; charset=utf-8",
      ...init?.headers,
    },
    cache: "no-store",
    signal: AbortSignal.timeout(15_000),
  });
  const payload = (await response.json()) as FeishuResponse<T>;
  if (!response.ok || payload.code !== 0 || payload.data === undefined) {
    throw new Error(`飞书多维表格请求失败：${payload.msg || response.status}`);
  }
  return payload.data;
}

export function tableApiPath(table: ProductTableKey, suffix = ""): string {
  const config = getFeishuAuthConfig();
  const tableId = getFeishuTableId(table);
  return `/bitable/v1/apps/${encodeURIComponent(config.appToken)}/tables/${encodeURIComponent(tableId)}${suffix}`;
}

export async function listTableFields(table: ProductTableKey): Promise<BitableField[]> {
  const data = await feishuBitableRequest<{ items?: BitableField[] }>(
    `${tableApiPath(table, "/fields")}?page_size=100`
  );
  return data.items || [];
}

export async function searchTableRecords(
  table: ProductTableKey,
  body: Record<string, unknown> = {}
): Promise<BitableRecord[]> {
  const records: BitableRecord[] = [];
  let pageToken = "";
  do {
    const query = new URLSearchParams({ page_size: "500" });
    if (pageToken) query.set("page_token", pageToken);
    const data = await feishuBitableRequest<{
      items?: BitableRecord[];
      has_more?: boolean;
      page_token?: string;
      next_page_token?: string;
    }>(`${tableApiPath(table, "/records/search")}?${query}`, {
      method: "POST",
      body: JSON.stringify(body),
    });
    records.push(...(data.items || []));
    pageToken = data.has_more ? (data.page_token || data.next_page_token || "") : "";
  } while (pageToken);
  return records;
}

export async function findRecordByField(
  table: ProductTableKey,
  fieldName: string,
  value: string
): Promise<BitableRecord | null> {
  const records = await searchTableRecords(table, {
    filter: {
      conjunction: "and",
      conditions: [{ field_name: fieldName, operator: "is", value: [value] }],
    },
  });
  return records[0] || null;
}

async function serialWrite<T>(table: ProductTableKey, operation: () => Promise<T>): Promise<T> {
  const previous = writeQueues.get(table) || Promise.resolve();
  let release: () => void = () => {};
  const current = new Promise<void>((resolve) => {
    release = resolve;
  });
  writeQueues.set(table, previous.then(() => current));
  await previous;
  try {
    return await operation();
  } finally {
    release();
  }
}

export async function createTableRecord(
  table: ProductTableKey,
  fields: Record<string, unknown>
): Promise<BitableRecord> {
  return serialWrite(table, async () => {
    const data = await feishuBitableRequest<{ record: BitableRecord }>(tableApiPath(table, "/records"), {
      method: "POST",
      body: JSON.stringify({ fields }),
    });
    return data.record;
  });
}

export async function updateTableRecord(
  table: ProductTableKey,
  recordId: string,
  fields: Record<string, unknown>
): Promise<BitableRecord> {
  return serialWrite(table, async () => {
    const data = await feishuBitableRequest<{ record: BitableRecord }>(
      tableApiPath(table, `/records/${encodeURIComponent(recordId)}`),
      { method: "PUT", body: JSON.stringify({ fields }) }
    );
    return data.record;
  });
}

export async function batchCreateTableRecords(
  table: ProductTableKey,
  records: Array<{ fields: Record<string, unknown> }>
): Promise<BitableRecord[]> {
  if (records.length === 0) return [];
  if (records.length > 500) throw new Error("飞书批量写入单次不能超过 500 条");
  return serialWrite(table, async () => {
    const data = await feishuBitableRequest<{ records?: BitableRecord[] }>(
      tableApiPath(table, "/records/batch_create"),
      { method: "POST", body: JSON.stringify({ records }) }
    );
    return data.records || [];
  });
}

export async function upsertTableRecord(input: {
  table: ProductTableKey;
  idField: string;
  id: string;
  fields: Record<string, unknown>;
}): Promise<BitableRecord> {
  const existing = await findRecordByField(input.table, input.idField, input.id);
  return existing
    ? updateTableRecord(input.table, existing.record_id, input.fields)
    : createTableRecord(input.table, input.fields);
}

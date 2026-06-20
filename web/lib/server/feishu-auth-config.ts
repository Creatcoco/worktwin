import "server-only";

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { ProductTableKey } from "./feishu-product-schema";

export interface FeishuAuthConfig {
  appId?: string;
  appSecret?: string;
  tenantAccessToken?: string;
  appToken: string;
  tableId: string;
  tables: Partial<Record<ProductTableKey, string>>;
  sessionSecret: string;
}

type ConfigFile = {
  app_id?: string;
  app_secret?: string;
  tenant_access_token?: string;
  app_token?: string;
  table_id?: string;
  tables?: Partial<Record<ProductTableKey, string>>;
  session_secret?: string;
};

function readJson(path: string): ConfigFile {
  if (!existsSync(path)) return {};
  try {
    return JSON.parse(readFileSync(path, "utf8")) as ConfigFile;
  } catch {
    throw new Error(`飞书认证配置无法解析：${path}`);
  }
}

const CONFIG_PATH = join(
  /* turbopackIgnore: true */ process.cwd(),
  "config",
  "feishu-auth.json"
);

export function getFeishuAuthConfig(): FeishuAuthConfig {
  const authFile = readJson(CONFIG_PATH);
  let environmentTables: Partial<Record<ProductTableKey, string>> = {};
  if (process.env.FEISHU_TABLES_JSON) {
    try {
      environmentTables = JSON.parse(process.env.FEISHU_TABLES_JSON) as Partial<Record<ProductTableKey, string>>;
    } catch {
      throw new Error("FEISHU_TABLES_JSON 无法解析");
    }
  }
  const usersTable = authFile.tables?.users || authFile.table_id || process.env.FEISHU_AUTH_TABLE_ID || "";

  const config: FeishuAuthConfig = {
    appId: authFile.app_id || process.env.FEISHU_APP_ID,
    appSecret: authFile.app_secret || process.env.FEISHU_APP_SECRET,
    tenantAccessToken: authFile.tenant_access_token || process.env.FEISHU_TENANT_ACCESS_TOKEN,
    appToken: authFile.app_token || process.env.FEISHU_AUTH_APP_TOKEN || "",
    tableId: usersTable,
    tables: { ...environmentTables, ...authFile.tables, users: usersTable },
    sessionSecret: authFile.session_secret || process.env.AUTH_SESSION_SECRET || "",
  };

  if (!config.appToken || !config.tableId) {
    throw new Error("缺少飞书用户表 app_token 或 table_id");
  }
  if (!config.tenantAccessToken && (!config.appId || !config.appSecret)) {
    throw new Error("缺少 tenant_access_token，或 app_id + app_secret");
  }
  if (config.sessionSecret.length < 32 || config.sessionSecret.includes("replace_")) {
    throw new Error("session_secret 必须替换为至少 32 个字符的随机密钥");
  }

  return config;
}

export function getFeishuTableId(table: ProductTableKey): string {
  const id = getFeishuAuthConfig().tables[table];
  if (!id) throw new Error(`缺少飞书数据表配置：tables.${table}`);
  return id;
}

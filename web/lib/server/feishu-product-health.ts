import "server-only";

import { getFeishuAuthConfig } from "./feishu-auth-config";
import { listTableFields } from "./feishu-bitable";
import {
  PRODUCT_TABLE_KEYS,
  PRODUCT_TABLES,
  type ProductTableKey,
} from "./feishu-product-schema";

export interface ProductTableHealth {
  key: ProductTableKey;
  name: string;
  status: "ready" | "missing_table" | "missing_fields" | "error";
  tableId?: string;
  missingFields?: string[];
  message?: string;
}

export async function checkProductDataTables(): Promise<ProductTableHealth[]> {
  const config = getFeishuAuthConfig();
  const results: ProductTableHealth[] = [];

  for (const key of PRODUCT_TABLE_KEYS) {
    const definition = PRODUCT_TABLES[key];
    const tableId = config.tables[key];
    if (!tableId) {
      results.push({ key, name: definition.name, status: "missing_table" });
      continue;
    }
    try {
      const fields = await listTableFields(key);
      const available = new Set(fields.map((item) => item.field_name));
      const missingFields = definition.fields
        .map((item) => item.name)
        .filter((name) => !available.has(name));
      results.push({
        key,
        name: definition.name,
        tableId,
        status: missingFields.length ? "missing_fields" : "ready",
        missingFields: missingFields.length ? missingFields : undefined,
      });
    } catch (error) {
      results.push({
        key,
        name: definition.name,
        tableId,
        status: "error",
        message: error instanceof Error ? error.message : "表检查失败",
      });
    }
  }
  return results;
}

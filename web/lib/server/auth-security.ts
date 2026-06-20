import "server-only";

import {
  createHmac,
  randomBytes,
  scrypt,
  timingSafeEqual,
} from "node:crypto";
import type { NextRequest, NextResponse } from "next/server";
import { getFeishuAuthConfig } from "./feishu-auth-config";

export const SESSION_COOKIE = "worktwin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;
const PASSWORD_KEY_LENGTH = 64;

export interface SessionClaims {
  userId: string;
  email: string;
  name: string;
  role: "user" | "admin";
  exp: number;
}

function scryptPassword(password: string, salt: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, PASSWORD_KEY_LENGTH, { N: 16384, r: 8, p: 1 }, (error, key) => {
      if (error) reject(error);
      else resolve(key as Buffer);
    });
  });
}

export async function hashPassword(password: string): Promise<{ hash: string; salt: string }> {
  const salt = randomBytes(16).toString("hex");
  const key = await scryptPassword(password, salt);
  return { hash: key.toString("base64"), salt };
}

export async function verifyPassword(password: string, salt: string, expectedHash: string): Promise<boolean> {
  try {
    const actual = await scryptPassword(password, salt);
    const expected = Buffer.from(expectedHash, "base64");
    return expected.length === actual.length && timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

function signature(payload: string): string {
  return createHmac("sha256", getFeishuAuthConfig().sessionSecret)
    .update(payload)
    .digest("base64url");
}

export function createSessionToken(user: Omit<SessionClaims, "exp">): string {
  const claims: SessionClaims = {
    ...user,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  };
  const payload = Buffer.from(JSON.stringify(claims)).toString("base64url");
  return `${payload}.${signature(payload)}`;
}

export function verifySessionToken(token: string | undefined): SessionClaims | null {
  if (!token) return null;
  const [payload, suppliedSignature] = token.split(".");
  if (!payload || !suppliedSignature) return null;

  const expectedSignature = signature(payload);
  const supplied = Buffer.from(suppliedSignature);
  const expected = Buffer.from(expectedSignature);
  if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) return null;

  try {
    const claims = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as SessionClaims;
    if (!claims.userId || !claims.email || claims.exp <= Math.floor(Date.now() / 1000)) return null;
    return claims;
  } catch {
    return null;
  }
}

export function getSession(request: NextRequest): SessionClaims | null {
  return verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);
}

export function setSession(response: NextResponse, claims: Omit<SessionClaims, "exp">): void {
  response.cookies.set(SESSION_COOKIE, createSessionToken(claims), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export function clearSession(response: NextResponse): void {
  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export function normalizeEmail(value: unknown): string {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
}

export function isValidPassword(password: unknown): password is string {
  return typeof password === "string" && password.length >= 8 && password.length <= 128;
}

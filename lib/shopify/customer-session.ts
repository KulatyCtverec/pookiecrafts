import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import type { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { refreshCustomerToken } from "./customer-auth";

const SESSION_COOKIE_NAME = "pookiecrafts-customer-session";
const OAUTH_STATE_COOKIE_NAME = "pookiecrafts-customer-oauth-state";
/** PKCE code_verifier (public client only; short-lived) */
const PKCE_VERIFIER_COOKIE_NAME = "pookiecrafts-customer-pkce";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 14;
const REFRESH_LEEWAY_SECONDS = 60;

export interface CustomerSession {
  accessToken: string;
  refreshToken: string;
  idToken: string;
  expiresAt: number;
}

function resolveSessionSecret(): string {
  return process.env.SHOPIFY_CUSTOMER_SESSION_SECRET?.trim() || "";
}

function createKey(secret: string): Buffer {
  return createHash("sha256").update(secret, "utf8").digest();
}

function encrypt(data: string): string {
  const secret = resolveSessionSecret();
  if (!secret) {
    throw new Error(
      "Missing SHOPIFY_CUSTOMER_SESSION_SECRET (long random string for encrypting the session cookie)."
    );
  }

  const iv = randomBytes(12);
  const key = createKey(secret);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(data, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("base64url")}.${tag.toString("base64url")}.${encrypted.toString(
    "base64url"
  )}`;
}

function decrypt(payload: string): string {
  const secret = resolveSessionSecret();
  if (!secret) {
    throw new Error(
      "Missing SHOPIFY_CUSTOMER_SESSION_SECRET (long random string for encrypting the session cookie)."
    );
  }

  const [ivPart, tagPart, encryptedPart] = payload.split(".");
  if (!ivPart || !tagPart || !encryptedPart) {
    throw new Error("Invalid encrypted session format.");
  }

  const key = createKey(secret);
  const decipher = createDecipheriv(
    "aes-256-gcm",
    key,
    Buffer.from(ivPart, "base64url")
  );
  decipher.setAuthTag(Buffer.from(tagPart, "base64url"));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedPart, "base64url")),
    decipher.final(),
  ]);
  return decrypted.toString("utf8");
}

export function getOAuthStateCookieName() {
  return OAUTH_STATE_COOKIE_NAME;
}

export function clearOAuthStateCookie(response: NextResponse) {
  response.cookies.set(OAUTH_STATE_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export function setOAuthStateCookie(response: NextResponse, value: string) {
  response.cookies.set(OAUTH_STATE_COOKIE_NAME, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 10,
  });
}

export function getPkceVerifierCookieName() {
  return PKCE_VERIFIER_COOKIE_NAME;
}

export function setPkceVerifierCookie(response: NextResponse, value: string) {
  response.cookies.set(PKCE_VERIFIER_COOKIE_NAME, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 10,
  });
}

export function clearPkceVerifierCookie(response: NextResponse) {
  response.cookies.set(PKCE_VERIFIER_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export function commitCustomerSession(
  response: NextResponse,
  tokenPayload: {
    access_token: string;
    refresh_token: string;
    id_token: string;
    expires_in: number;
  }
) {
  const expiresAt = Math.floor(Date.now() / 1000) + tokenPayload.expires_in;
  const session: CustomerSession = {
    accessToken: tokenPayload.access_token,
    refreshToken: tokenPayload.refresh_token,
    idToken: tokenPayload.id_token,
    expiresAt,
  };
  const encrypted = encrypt(JSON.stringify(session));
  response.cookies.set(SESSION_COOKIE_NAME, encrypted, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export function clearCustomerSession(response: NextResponse) {
  response.cookies.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

function parseCustomerSession(raw: string | undefined): CustomerSession | null {
  if (!raw) return null;
  try {
    const decrypted = decrypt(raw);
    const parsed = JSON.parse(decrypted) as Partial<CustomerSession>;
    if (
      typeof parsed.accessToken !== "string" ||
      typeof parsed.refreshToken !== "string" ||
      typeof parsed.idToken !== "string" ||
      typeof parsed.expiresAt !== "number"
    ) {
      return null;
    }
    return {
      accessToken: parsed.accessToken,
      refreshToken: parsed.refreshToken,
      idToken: parsed.idToken,
      expiresAt: parsed.expiresAt,
    };
  } catch {
    return null;
  }
}

export async function getCustomerSessionFromCookies(): Promise<CustomerSession | null> {
  const store = await cookies();
  return parseCustomerSession(store.get(SESSION_COOKIE_NAME)?.value);
}

export async function getFreshCustomerSessionForRoute(
  response: NextResponse
): Promise<CustomerSession | null> {
  const store = await cookies();
  const current = parseCustomerSession(store.get(SESSION_COOKIE_NAME)?.value);
  if (!current) return null;

  const now = Math.floor(Date.now() / 1000);
  const hasTimeLeft = current.expiresAt - now > REFRESH_LEEWAY_SECONDS;
  if (hasTimeLeft) {
    return current;
  }

  try {
    const refreshed = await refreshCustomerToken(current.refreshToken);
    commitCustomerSession(response, refreshed);
    return {
      accessToken: refreshed.access_token,
      refreshToken: refreshed.refresh_token,
      idToken: refreshed.id_token,
      expiresAt: now + refreshed.expires_in,
    };
  } catch {
    clearCustomerSession(response);
    return null;
  }
}

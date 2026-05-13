import { createHash, randomBytes } from "node:crypto";

const DISCOVERY_TTL_MS = 10 * 60 * 1000;
const DEFAULT_SCOPE = "openid email customer-account-api:full";

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

interface OpenIdConfig {
  authorization_endpoint: string;
  token_endpoint: string;
  end_session_endpoint: string;
  issuer: string;
  jwks_uri: string;
}

interface CustomerApiDiscovery {
  graphql_api: string;
  mcp_api?: string;
}

export interface CustomerTokenResponse {
  access_token: string;
  expires_in: number;
  id_token: string;
  refresh_token: string;
  token_type?: string;
  scope?: string;
}

export interface AuthStatePayload {
  nonce: string;
  returnTo: string;
  locale?: string;
  createdAt: number;
}

let openIdCache: CacheEntry<OpenIdConfig> | null = null;
let customerApiCache: CacheEntry<CustomerApiDiscovery> | null = null;

function getStoreDomain(): string {
  const raw = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN?.trim();
  if (!raw) {
    throw new Error("Missing NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN env variable.");
  }
  return raw.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

function getCustomerAuthDomain(): string | null {
  const raw = process.env.SHOPIFY_CUSTOMER_AUTH_DOMAIN?.trim();
  if (!raw) return null;
  return raw.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

function getRequiredAuthEnv() {
  const clientId = process.env.SHOPIFY_CLIENT_ID?.trim();
  const redirectUri = process.env.SHOPIFY_AUTH_REDIRECT_URI?.trim();
  const logoutRedirectUri =
    process.env.SHOPIFY_AUTH_LOGOUT_REDIRECT_URI?.trim();

  if (!clientId || !redirectUri || !logoutRedirectUri) {
    throw new Error(
      "Missing required env vars. Required: SHOPIFY_CLIENT_ID, SHOPIFY_AUTH_REDIRECT_URI, SHOPIFY_AUTH_LOGOUT_REDIRECT_URI."
    );
  }

  return { clientId, redirectUri, logoutRedirectUri };
}

/** Origin for token requests (must match a JavaScript origin in Shopify). */
function getAuthOriginHeader(): string | null {
  const explicit = process.env.SHOPIFY_AUTH_ORIGIN?.trim();
  if (explicit) return explicit.replace(/\/$/, "");
  const redirect = process.env.SHOPIFY_AUTH_REDIRECT_URI?.trim();
  if (redirect) {
    try {
      return new URL(redirect).origin;
    } catch {
      return null;
    }
  }
  const site = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (site) {
    try {
      return new URL(site).origin;
    } catch {
      return null;
    }
  }
  return null;
}

function shouldReuseCache<T>(entry: CacheEntry<T> | null): entry is CacheEntry<T> {
  return !!entry && entry.expiresAt > Date.now();
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    method: "GET",
    cache: "no-store",
    headers: {
      Accept: "application/json",
    },
  });
  if (!response.ok) {
    throw new Error(`Failed discovery request (${response.status}) for ${url}`);
  }
  return (await response.json()) as T;
}

/**
 * Domains that may host `/.well-known/openid-configuration` and `/.well-known/customer-account-api`.
 * Prefer `SHOPIFY_CUSTOMER_AUTH_DOMAIN` first (e.g. account.pookiecrafts.cz): the storefront apex
 * often does not serve OIDC discovery (404).
 */
function getDiscoveryDomainCandidates(): string[] {
  const authHost = getCustomerAuthDomain();
  const storeHost = getStoreDomain();
  const seen = new Set<string>();
  const out: string[] = [];
  if (authHost) {
    out.push(authHost);
    seen.add(authHost);
  }
  if (!seen.has(storeHost)) {
    out.push(storeHost);
    seen.add(storeHost);
  }
  return out;
}

async function discoverWithFallback<T>(path: string): Promise<T> {
  const candidates = getDiscoveryDomainCandidates();
  let lastError: Error | null = null;

  for (const domain of candidates) {
    const url = `https://${domain}${path}`;
    try {
      return await fetchJson<T>(url);
    } catch (error) {
      lastError =
        error instanceof Error ? error : new Error(`Discovery failed for ${url}`);
    }
  }

  const hint =
    " Set SHOPIFY_CUSTOMER_AUTH_DOMAIN to your Customer Accounts host (e.g. account.pookiecrafts.cz from Shopify Admin → Customer Account API endpoints).";
  if (lastError) {
    throw new Error(`${lastError.message}${hint}`);
  }
  throw new Error(`Failed discovery request for ${path} (no candidate domains).${hint}`);
}

export async function getOpenIdConfiguration(): Promise<OpenIdConfig> {
  if (shouldReuseCache(openIdCache)) {
    return openIdCache.value;
  }

  const data = await discoverWithFallback<OpenIdConfig>(
    "/.well-known/openid-configuration"
  );

  openIdCache = {
    value: data,
    expiresAt: Date.now() + DISCOVERY_TTL_MS,
  };

  return data;
}

export async function getCustomerApiDiscovery(): Promise<CustomerApiDiscovery> {
  if (shouldReuseCache(customerApiCache)) {
    return customerApiCache.value;
  }

  const data = await discoverWithFallback<CustomerApiDiscovery>(
    "/.well-known/customer-account-api"
  );

  customerApiCache = {
    value: data,
    expiresAt: Date.now() + DISCOVERY_TTL_MS,
  };

  return data;
}

export function createRandomToken(size = 32): string {
  return randomBytes(size).toString("base64url");
}

/** PKCE (required for public web clients). RFC 7636 + Shopify Customer Account API. */
export function generateCodeVerifier(): string {
  return randomBytes(32).toString("base64url");
}

export function generateCodeChallengeFromVerifier(verifier: string): string {
  const hash = createHash("sha256").update(verifier, "utf8").digest();
  return Buffer.from(hash).toString("base64url");
}

export function encodeState(payload: AuthStatePayload): string {
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}

export function decodeState(value: string): AuthStatePayload | null {
  try {
    const json = Buffer.from(value, "base64url").toString("utf8");
    const parsed = JSON.parse(json) as Partial<AuthStatePayload>;
    if (
      typeof parsed.nonce !== "string" ||
      typeof parsed.returnTo !== "string" ||
      typeof parsed.createdAt !== "number"
    ) {
      return null;
    }
    return {
      nonce: parsed.nonce,
      returnTo: parsed.returnTo,
      locale: typeof parsed.locale === "string" ? parsed.locale : undefined,
      createdAt: parsed.createdAt,
    };
  } catch {
    return null;
  }
}

export async function createAuthorizationUrl(options: {
  codeChallenge: string;
  state?: string;
  nonce?: string;
  locale?: string;
  prompt?: "none";
  loginHint?: string;
  scope?: string;
}): Promise<string> {
  const { clientId, redirectUri } = getRequiredAuthEnv();
  const openIdConfig = await getOpenIdConfiguration();

  const authorizationUrl = new URL(openIdConfig.authorization_endpoint);
  authorizationUrl.searchParams.set("scope", options.scope ?? DEFAULT_SCOPE);
  authorizationUrl.searchParams.set("client_id", clientId);
  authorizationUrl.searchParams.set("response_type", "code");
  authorizationUrl.searchParams.set("redirect_uri", redirectUri);

  authorizationUrl.searchParams.set("code_challenge", options.codeChallenge);
  authorizationUrl.searchParams.set("code_challenge_method", "S256");

  if (options.state) {
    authorizationUrl.searchParams.set("state", options.state);
  }
  if (options.nonce) {
    authorizationUrl.searchParams.set("nonce", options.nonce);
  }
  if (options.locale) {
    authorizationUrl.searchParams.set("locale", options.locale);
  }
  if (options.prompt) {
    authorizationUrl.searchParams.set("prompt", options.prompt);
  }
  if (options.loginHint) {
    authorizationUrl.searchParams.set("login_hint", options.loginHint);
  }

  return authorizationUrl.toString();
}

export async function exchangeCodeForCustomerToken(
  code: string,
  codeVerifier: string
): Promise<CustomerTokenResponse> {
  const { clientId, redirectUri } = getRequiredAuthEnv();
  const openIdConfig = await getOpenIdConfiguration();

  const body = new URLSearchParams();
  body.set("grant_type", "authorization_code");
  body.set("client_id", clientId);
  body.set("redirect_uri", redirectUri);
  body.set("code", code);
  body.set("code_verifier", codeVerifier);

  const headers: Record<string, string> = {
    "content-type": "application/x-www-form-urlencoded",
  };

  const origin = getAuthOriginHeader();
  if (origin) {
    headers["origin"] = origin;
  }
  headers["user-agent"] = "pookiecrafts-customer-auth/1.0";

  const response = await fetch(openIdConfig.token_endpoint, {
    method: "POST",
    headers,
    body,
    cache: "no-store",
  });

  const payload = (await response.json()) as CustomerTokenResponse & {
    error?: string;
    error_description?: string;
  };

  if (!response.ok || !payload.access_token) {
    const detail = payload.error_description ?? payload.error ?? "token_exchange_failed";
    throw new Error(`Customer token exchange failed: ${detail}`);
  }

  return payload;
}

export async function refreshCustomerToken(
  refreshToken: string
): Promise<CustomerTokenResponse> {
  const { clientId } = getRequiredAuthEnv();
  const openIdConfig = await getOpenIdConfiguration();

  const body = new URLSearchParams();
  body.set("grant_type", "refresh_token");
  body.set("client_id", clientId);
  body.set("refresh_token", refreshToken);

  const headers: Record<string, string> = {
    "content-type": "application/x-www-form-urlencoded",
  };

  const origin = getAuthOriginHeader();
  if (origin) {
    headers["origin"] = origin;
  }
  headers["user-agent"] = "pookiecrafts-customer-auth/1.0";

  const response = await fetch(openIdConfig.token_endpoint, {
    method: "POST",
    headers,
    body,
    cache: "no-store",
  });

  const payload = (await response.json()) as CustomerTokenResponse & {
    error?: string;
    error_description?: string;
  };

  if (!response.ok || !payload.access_token) {
    const detail = payload.error_description ?? payload.error ?? "token_refresh_failed";
    throw new Error(`Customer token refresh failed: ${detail}`);
  }

  return payload;
}

export async function createLogoutUrl(idTokenHint: string): Promise<string> {
  const { logoutRedirectUri } = getRequiredAuthEnv();
  const openIdConfig = await getOpenIdConfiguration();

  const logoutUrl = new URL(openIdConfig.end_session_endpoint);
  logoutUrl.searchParams.set("id_token_hint", idTokenHint);
  logoutUrl.searchParams.set("post_logout_redirect_uri", logoutRedirectUri);
  return logoutUrl.toString();
}

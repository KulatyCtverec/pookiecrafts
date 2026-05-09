import { NextRequest, NextResponse } from "next/server";
import { decodeState, exchangeCodeForCustomerToken } from "@/lib/shopify/customer-auth";
import {
  clearOAuthStateCookie,
  clearPkceVerifierCookie,
  commitCustomerSession,
  getOAuthStateCookieName,
  getPkceVerifierCookieName,
} from "@/lib/shopify/customer-session";

export const runtime = "nodejs";

const STATE_TTL_MS = 10 * 60 * 1000;

function getSafeRedirectTarget(returnTo: string): string {
  if (!returnTo.startsWith("/") || returnTo.startsWith("//")) {
    return "/";
  }
  return returnTo;
}

export async function GET(request: NextRequest) {
  const callbackUrl = new URL(request.url);
  const code = callbackUrl.searchParams.get("code");
  const state = callbackUrl.searchParams.get("state");
  const error = callbackUrl.searchParams.get("error");

  if (error) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (!code || !state) {
    return NextResponse.json({ ok: false, error: "missing_code_or_state" }, { status: 400 });
  }

  const stateCookie = request.cookies.get(getOAuthStateCookieName())?.value;
  if (!stateCookie || stateCookie !== state) {
    return NextResponse.json({ ok: false, error: "invalid_state" }, { status: 400 });
  }

  const decoded = decodeState(state);
  if (!decoded || Date.now() - decoded.createdAt > STATE_TTL_MS) {
    return NextResponse.json({ ok: false, error: "expired_state" }, { status: 400 });
  }

  const pkceVerifier = request.cookies.get(getPkceVerifierCookieName())?.value;
  if (!pkceVerifier) {
    return NextResponse.json({ ok: false, error: "missing_pkce_verifier" }, { status: 400 });
  }

  try {
    const tokenPayload = await exchangeCodeForCustomerToken(code, pkceVerifier);
    const redirectTarget = getSafeRedirectTarget(decoded.returnTo);
    const response = NextResponse.redirect(new URL(redirectTarget, request.url));
    commitCustomerSession(response, tokenPayload);
    clearOAuthStateCookie(response);
    clearPkceVerifierCookie(response);
    return response;
  } catch (exchangeError) {
    const detail =
      exchangeError instanceof Error ? exchangeError.message : "token_exchange_failed";
    const response = NextResponse.json({ ok: false, error: detail }, { status: 401 });
    clearOAuthStateCookie(response);
    clearPkceVerifierCookie(response);
    return response;
  }
}

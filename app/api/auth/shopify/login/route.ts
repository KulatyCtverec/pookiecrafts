import { NextRequest, NextResponse } from "next/server";
import {
  createAuthorizationUrl,
  createRandomToken,
  encodeState,
  generateCodeChallengeFromVerifier,
  generateCodeVerifier,
} from "@/lib/shopify/customer-auth";
import {
  setOAuthStateCookie,
  setPkceVerifierCookie,
} from "@/lib/shopify/customer-session";

export const runtime = "nodejs";

function normalizeReturnTo(value: string | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/";
  }
  return value;
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const locale = url.searchParams.get("locale") ?? undefined;
    const returnTo = normalizeReturnTo(url.searchParams.get("returnTo"));
    const nonce = createRandomToken();
    const state = encodeState({
      nonce,
      returnTo,
      locale,
      createdAt: Date.now(),
    });

    const codeVerifier = generateCodeVerifier();
    const codeChallenge = generateCodeChallengeFromVerifier(codeVerifier);

    const authorizationUrl = await createAuthorizationUrl({
      state,
      nonce,
      locale,
      codeChallenge,
    });

    const response = NextResponse.redirect(authorizationUrl);
    setOAuthStateCookie(response, state);
    setPkceVerifierCookie(response, codeVerifier);
    return response;
  } catch (error) {
    const detail = error instanceof Error ? error.message : "auth_init_failed";
    return NextResponse.json({ ok: false, error: detail }, { status: 500 });
  }
}

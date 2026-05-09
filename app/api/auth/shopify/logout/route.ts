import { NextRequest, NextResponse } from "next/server";
import { createLogoutUrl } from "@/lib/shopify/customer-auth";
import {
  clearCustomerSession,
  clearOAuthStateCookie,
  getCustomerSessionFromCookies,
} from "@/lib/shopify/customer-session";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const fallback = process.env.SHOPIFY_AUTH_LOGOUT_REDIRECT_URI || "/";
  const response = NextResponse.redirect(new URL(fallback, request.url));

  try {
    const session = await getCustomerSessionFromCookies();
    clearCustomerSession(response);
    clearOAuthStateCookie(response);

    if (session?.idToken) {
      const logoutUrl = await createLogoutUrl(session.idToken);
      return NextResponse.redirect(logoutUrl, {
        headers: response.headers,
      });
    }
    return response;
  } catch {
    clearCustomerSession(response);
    clearOAuthStateCookie(response);
    return response;
  }
}

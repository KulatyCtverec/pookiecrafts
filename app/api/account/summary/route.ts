import { NextRequest, NextResponse } from "next/server";
import { getCustomerSummaryAndOrders } from "@/lib/shopify/customer-api";
import { getFreshCustomerSessionForRoute } from "@/lib/shopify/customer-session";

export const runtime = "nodejs";

function copySetCookieHeaders(from: NextResponse, to: NextResponse) {
  const setCookie = from.headers.get("set-cookie");
  if (setCookie) {
    to.headers.set("set-cookie", setCookie);
  }
}

export async function GET(request: NextRequest) {
  const cookieCarrier = NextResponse.json({ ok: true });
  const session = await getFreshCustomerSessionForRoute(cookieCarrier);
  if (!session) {
    const unauthorized = NextResponse.json(
      { ok: false, error: "unauthorized" },
      { status: 401 }
    );
    copySetCookieHeaders(cookieCarrier, unauthorized);
    return unauthorized;
  }

  const url = new URL(request.url);
  const after = url.searchParams.get("after");
  const language = url.searchParams.get("language") ?? undefined;

  try {
    const result = await getCustomerSummaryAndOrders(session.accessToken, {
      first: 10,
      after,
      language,
    });
    const response = NextResponse.json({ ok: true, ...result });
    copySetCookieHeaders(cookieCarrier, response);
    return response;
  } catch (error) {
    const detail = error instanceof Error ? error.message : "failed_to_load_account";
    const response = NextResponse.json({ ok: false, error: detail }, { status: 500 });
    copySetCookieHeaders(cookieCarrier, response);
    return response;
  }
}

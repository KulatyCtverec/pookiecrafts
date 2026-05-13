import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { setCustomerEmailMarketingSubscribed } from "@/lib/shopify/customer-api";
import { getFreshCustomerSessionForRoute } from "@/lib/shopify/customer-session";

export const runtime = "nodejs";

const marketingSchema = z.object({
  subscribed: z.boolean(),
  language: z.string().trim().max(10).optional(),
});

function copySetCookieHeaders(from: NextResponse, to: NextResponse) {
  const setCookie = from.headers.get("set-cookie");
  if (setCookie) {
    to.headers.set("set-cookie", setCookie);
  }
}

export async function POST(request: NextRequest) {
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

  const payload = await request.json().catch(() => null);
  const parsed = marketingSchema.safeParse(payload);
  if (!parsed.success) {
    const badRequest = NextResponse.json(
      { ok: false, error: "invalid_payload" },
      { status: 400 }
    );
    copySetCookieHeaders(cookieCarrier, badRequest);
    return badRequest;
  }

  try {
    const marketingState = await setCustomerEmailMarketingSubscribed(
      session.accessToken,
      parsed.data.subscribed,
      parsed.data.language
    );
    const response = NextResponse.json({ ok: true, marketingState });
    copySetCookieHeaders(cookieCarrier, response);
    return response;
  } catch (error) {
    const detail = error instanceof Error ? error.message : "marketing_update_failed";
    const response = NextResponse.json({ ok: false, error: detail }, { status: 500 });
    copySetCookieHeaders(cookieCarrier, response);
    return response;
  }
}

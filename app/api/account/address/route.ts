import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ACCOUNT_ADDRESS_TERRITORY_CODES } from "@/lib/shopify/account-territory-codes";
import type { AccountAddressTerritoryCode } from "@/lib/shopify/account-territory-codes";
import { upsertCustomerDefaultAddress } from "@/lib/shopify/customer-api";
import { getFreshCustomerSessionForRoute } from "@/lib/shopify/customer-session";

export const runtime = "nodejs";

const territorySet = new Set<string>(ACCOUNT_ADDRESS_TERRITORY_CODES);

const territorySchema = z
  .string()
  .length(2)
  .refine((c): c is AccountAddressTerritoryCode => territorySet.has(c), "invalid_territory");

const addressSchema = z.object({
  language: z.string().trim().max(10).optional(),
  addressId: z.string().trim().max(200).optional().nullable(),
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  company: z.string().trim().max(200).optional().nullable(),
  buyingForCompany: z.boolean().optional(),
  address1: z.string().trim().min(1).max(200),
  address2: z.string().trim().max(100).optional().nullable(),
  city: z.string().trim().min(1).max(100),
  zip: z.string().trim().min(1).max(20),
  territoryCode: territorySchema,
  zoneCode: z.string().trim().max(32).optional().nullable(),
  phoneNumber: z
    .string()
    .trim()
    .min(8)
    .max(25)
    .regex(/^\+\d{6,15}$/, "phone_e164"),
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
  const parsed = addressSchema.safeParse(payload);
  if (!parsed.success) {
    const badRequest = NextResponse.json(
      { ok: false, error: "invalid_payload" },
      { status: 400 }
    );
    copySetCookieHeaders(cookieCarrier, badRequest);
    return badRequest;
  }

  const company =
    parsed.data.buyingForCompany && parsed.data.company?.trim()
      ? parsed.data.company.trim()
      : null;

  try {
    const address = await upsertCustomerDefaultAddress(
      session.accessToken,
      {
        addressId: parsed.data.addressId || null,
        address: {
          firstName: parsed.data.firstName,
          lastName: parsed.data.lastName,
          company,
          address1: parsed.data.address1,
          address2: parsed.data.address2?.trim() || null,
          city: parsed.data.city,
          zip: parsed.data.zip,
          territoryCode: parsed.data.territoryCode,
          zoneCode: parsed.data.zoneCode?.trim() || null,
          phoneNumber: parsed.data.phoneNumber.trim(),
        },
      },
      parsed.data.language
    );
    const response = NextResponse.json({ ok: true, address });
    copySetCookieHeaders(cookieCarrier, response);
    return response;
  } catch (error) {
    const detail = error instanceof Error ? error.message : "address_update_failed";
    const response = NextResponse.json({ ok: false, error: detail }, { status: 500 });
    copySetCookieHeaders(cookieCarrier, response);
    return response;
  }
}

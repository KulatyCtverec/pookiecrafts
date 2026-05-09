import { getTranslations } from "next-intl/server";
import { AccountPageClient } from "./AccountPageClient";
import { getCustomerSessionFromCookies } from "@/lib/shopify/customer-session";
import { getCustomerSummaryAndOrders } from "@/lib/shopify/customer-api";

function toLanguageCode(locale: string): string {
  const normalized = locale.trim().toLowerCase().split("-")[0];
  const map: Record<string, string> = {
    en: "EN",
    cs: "CS",
    de: "DE",
    fr: "FR",
    es: "ES",
  };
  return map[normalized] ?? "EN";
}

export default async function AccountPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("account");
  const languageCode = toLanguageCode(locale);
  const session = await getCustomerSessionFromCookies();

  let initialData: {
    customer: {
      id: string;
      firstName: string | null;
      lastName: string | null;
      email: string;
      phoneNumber: string | null;
    };
    ordersPage: {
      orders: {
        id: string;
        number: number;
        processedAt: string;
        financialStatus: string | null;
        fulfillmentStatus: string | null;
        totalPrice: { amount: string; currencyCode: string };
      }[];
      hasNextPage: boolean;
      endCursor: string | null;
    };
  } | null = null;
  let loadError = false;

  if (session) {
    try {
      initialData = await getCustomerSummaryAndOrders(session.accessToken, {
        first: 10,
        language: languageCode,
      });
    } catch {
      loadError = true;
    }
  }

  return (
    <AccountPageClient
      locale={locale}
      initialData={initialData}
      initialLoadError={loadError}
      labels={{
        title: t("title"),
        subtitle: t("subtitle"),
        signIn: t("signIn"),
        signOut: t("signOut"),
        loading: t("loading"),
        loadError: t("loadError"),
        profileHeading: t("profileHeading"),
        ordersHeading: t("ordersHeading"),
        firstName: t("firstName"),
        lastName: t("lastName"),
        email: t("email"),
        phone: t("phone"),
        saveProfile: t("saveProfile"),
        saving: t("saving"),
        saved: t("saved"),
        noOrders: t("noOrders"),
        orderNumber: t("orderNumber"),
        orderDate: t("orderDate"),
        orderTotal: t("orderTotal"),
        nextPage: t("nextPage"),
      }}
    />
  );
}

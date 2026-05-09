"use client";

import { useCallback, useMemo, useState } from "react";

interface CustomerSummary {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  phoneNumber: string | null;
}

interface CustomerOrder {
  id: string;
  number: number;
  processedAt: string;
  financialStatus: string | null;
  fulfillmentStatus: string | null;
  totalPrice: {
    amount: string;
    currencyCode: string;
  };
}

interface AccountPayload {
  customer: CustomerSummary;
  ordersPage: {
    orders: CustomerOrder[];
    hasNextPage: boolean;
    endCursor: string | null;
  };
}

interface Labels {
  title: string;
  subtitle: string;
  signIn: string;
  signOut: string;
  loading: string;
  loadError: string;
  profileHeading: string;
  ordersHeading: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  saveProfile: string;
  saving: string;
  saved: string;
  noOrders: string;
  orderNumber: string;
  orderDate: string;
  orderTotal: string;
  nextPage: string;
}

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

function formatMoney(amount: string, currencyCode: string) {
  const numeric = Number(amount);
  if (!Number.isFinite(numeric)) return `${amount} ${currencyCode}`;
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: currencyCode,
  }).format(numeric);
}

export function AccountPageClient({
  locale,
  initialData,
  initialLoadError,
  labels,
}: {
  locale: string;
  initialData: AccountPayload | null;
  initialLoadError: boolean;
  labels: Labels;
}) {
  const [loadingMore, setLoadingMore] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(
    initialLoadError ? labels.loadError : null
  );
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [data, setData] = useState<AccountPayload | null>(initialData);
  const [firstName, setFirstName] = useState(initialData?.customer.firstName ?? "");
  const [lastName, setLastName] = useState(initialData?.customer.lastName ?? "");

  const loginUrl = useMemo(
    () =>
      `/api/auth/shopify/login?locale=${encodeURIComponent(locale)}&returnTo=${encodeURIComponent(
        `/${locale}/account`
      )}`,
    [locale]
  );
  const logoutUrl = useMemo(
    () =>
      `/api/auth/shopify/logout?locale=${encodeURIComponent(locale)}&returnTo=${encodeURIComponent(
        `/${locale}/account`
      )}`,
    [locale]
  );
  const languageCode = useMemo(() => toLanguageCode(locale), [locale]);

  const loadMore = useCallback(
    async (after?: string) => {
      if (!after) return;
      setLoadingMore(true);
      setError(null);
      const response = await fetch(
        `/api/account/summary?language=${languageCode}&after=${encodeURIComponent(after)}`,
        {
          method: "GET",
          cache: "no-store",
        }
      );
      const payload = await response.json().catch(() => null);

      if (response.status === 401) {
        setData(null);
        setLoadingMore(false);
        return;
      }

      if (!response.ok || !payload?.ok) {
        setError(labels.loadError);
        setLoadingMore(false);
        return;
      }

      const nextData: AccountPayload = {
        customer: payload.customer,
        ordersPage: payload.ordersPage,
      };
      setData((prev) =>
        prev
          ? {
              customer: prev.customer,
              ordersPage: {
                orders: [...prev.ordersPage.orders, ...nextData.ordersPage.orders],
                hasNextPage: nextData.ordersPage.hasNextPage,
                endCursor: nextData.ordersPage.endCursor,
              },
            }
          : nextData
      );
      setLoadingMore(false);
    },
    [labels.loadError, languageCode]
  );

  const handleSave = useCallback(async () => {
    if (!data) return;
    setSaving(true);
    setSaveMessage(null);
    setError(null);

    const response = await fetch("/api/account/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName,
        lastName,
        language: languageCode,
      }),
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok || !payload?.ok) {
      setError(payload?.error || labels.loadError);
      setSaving(false);
      return;
    }
    setData((prev) =>
      prev
        ? {
            ...prev,
            customer: {
              ...prev.customer,
              firstName: payload.customer.firstName,
              lastName: payload.customer.lastName,
            },
          }
        : prev
    );
    setSaveMessage(labels.saved);
    setSaving(false);
  }, [data, firstName, lastName, labels.loadError, labels.saved, languageCode]);

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">{labels.title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{labels.subtitle}</p>
        </div>
        {data ? (
          <a
            href={logoutUrl}
            className="rounded-md border border-border px-4 py-2 text-sm hover:bg-muted"
          >
            {labels.signOut}
          </a>
        ) : (
          <a
            href={loginUrl}
            className="rounded-md bg-foreground px-4 py-2 text-sm text-background hover:opacity-90"
          >
            {labels.signIn}
          </a>
        )}
      </div>

      {!data ? (
        <div className="rounded-lg border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">{labels.loadError}</p>
          <a
            href={loginUrl}
            className="mt-4 inline-block rounded-md bg-foreground px-4 py-2 text-sm text-background"
          >
            {labels.signIn}
          </a>
        </div>
      ) : null}

      {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}

      {data ? (
        <div className="grid gap-6 lg:grid-cols-[1fr,1.2fr]">
          <div className="rounded-lg border border-border bg-card p-5">
            <h2 className="mb-4 text-lg font-medium">{labels.profileHeading}</h2>
            <div className="mb-4 text-sm text-muted-foreground">
              <div>
                {labels.email}: <span className="text-foreground">{data.customer.email}</span>
              </div>
              <div>
                {labels.phone}:{" "}
                <span className="text-foreground">{data.customer.phoneNumber || "-"}</span>
              </div>
            </div>
            <div className="space-y-3">
              <label className="block text-sm">
                <span className="mb-1 block text-muted-foreground">{labels.firstName}</span>
                <input
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block text-muted-foreground">{labels.lastName}</span>
                <input
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2"
                />
              </label>
            </div>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="mt-4 rounded-md bg-foreground px-4 py-2 text-sm text-background disabled:opacity-50"
            >
              {saving ? labels.saving : labels.saveProfile}
            </button>
            {saveMessage ? <p className="mt-2 text-sm text-emerald-600">{saveMessage}</p> : null}
          </div>

          <div className="rounded-lg border border-border bg-card p-5">
            <h2 className="mb-4 text-lg font-medium">{labels.ordersHeading}</h2>
            {data.ordersPage.orders.length === 0 ? (
              <p className="text-sm text-muted-foreground">{labels.noOrders}</p>
            ) : (
              <ul className="space-y-3">
                {data.ordersPage.orders.map((order) => (
                  <li key={order.id} className="rounded-md border border-border p-3 text-sm">
                    <div className="font-medium">
                      {labels.orderNumber}: #{order.number}
                    </div>
                    <div className="mt-1 text-muted-foreground">
                      {labels.orderDate}: {new Date(order.processedAt).toLocaleDateString()}
                    </div>
                    <div className="mt-1 text-muted-foreground">
                      {labels.orderTotal}:{" "}
                      {formatMoney(order.totalPrice.amount, order.totalPrice.currencyCode)}
                    </div>
                  </li>
                ))}
              </ul>
            )}
            {data.ordersPage.hasNextPage && data.ordersPage.endCursor ? (
              <button
                type="button"
                onClick={() => void loadMore(data.ordersPage.endCursor ?? undefined)}
                disabled={loadingMore}
                className="mt-4 rounded-md border border-border px-4 py-2 text-sm hover:bg-muted disabled:opacity-50"
              >
                {loadingMore ? labels.loading : labels.nextPage}
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { Link } from "@/i18n/navigation";

import { ACCOUNT_ADDRESS_TERRITORY_CODES } from "@/lib/shopify/account-territory-codes";
import type { EmailMarketingState } from "@/lib/shopify/customer-api";

const VALID_TERRITORIES = new Set<string>(ACCOUNT_ADDRESS_TERRITORY_CODES);

interface CustomerAddressSummary {
  id: string;
  firstName: string | null;
  lastName: string | null;
  company: string | null;
  address1: string | null;
  address2: string | null;
  city: string | null;
  zip: string | null;
  territoryCode: string | null;
  zoneCode: string | null;
  phoneNumber: string | null;
}

interface CustomerSummary {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  emailMarketingState: EmailMarketingState;
  phoneNumber: string | null;
  defaultAddress: CustomerAddressSummary | null;
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
  addressHeading: string;
  street: string;
  streetNumber: string;
  city: string;
  zip: string;
  country: string;
  zoneOptional: string;
  company: string;
  buyingForCompany: string;
  saveAddress: string;
  addressSaved: string;
  newsletterHeading: string;
  newsletterDescription: string;
  newsletterOptIn: string;
  saveNewsletter: string;
  newsletterSaved: string;
  phoneHint: string;
  accountDeletionHeading: string;
  accountDeletionDescription: string;
  accountDeletionContact: string;
  requiredNote: string;
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

function marketingIsOptedIn(state: EmailMarketingState) {
  return state === "SUBSCRIBED" || state === "PENDING";
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
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [savingNewsletter, setSavingNewsletter] = useState(false);
  const [error, setError] = useState<string | null>(
    initialLoadError ? labels.loadError : null
  );
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [addressMessage, setAddressMessage] = useState<string | null>(null);
  const [newsletterMessage, setNewsletterMessage] = useState<string | null>(null);
  const [data, setData] = useState<AccountPayload | null>(initialData);
  const [firstName, setFirstName] = useState(initialData?.customer.firstName ?? "");
  const [lastName, setLastName] = useState(initialData?.customer.lastName ?? "");

  const [addrFirst, setAddrFirst] = useState("");
  const [addrLast, setAddrLast] = useState("");
  const [buyingForCompany, setBuyingForCompany] = useState(false);
  const [company, setCompany] = useState("");
  const [street, setStreet] = useState("");
  const [streetNumber, setStreetNumber] = useState("");
  const [city, setCity] = useState("");
  const [zip, setZip] = useState("");
  const [territory, setTerritory] = useState("CZ");
  const [zone, setZone] = useState("");
  const [deliveryPhone, setDeliveryPhone] = useState("");
  const [newsletterOptIn, setNewsletterOptIn] = useState(false);

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

  const regionNames = useMemo(
    () => new Intl.DisplayNames([locale], { type: "region" }),
    [locale]
  );

  useEffect(() => {
    if (!data) return;
    const c = data.customer;
    const a = c.defaultAddress;
    setAddrFirst((a?.firstName ?? c.firstName ?? "").trim() || "");
    setAddrLast((a?.lastName ?? c.lastName ?? "").trim() || "");
    const co = a?.company?.trim() ?? "";
    setCompany(co);
    setBuyingForCompany(Boolean(co));
    setStreet(a?.address1 ?? "");
    setStreetNumber(a?.address2 ?? "");
    setCity(a?.city ?? "");
    setZip(a?.zip ?? "");
    setTerritory(
      a?.territoryCode && VALID_TERRITORIES.has(a.territoryCode) ? a.territoryCode : "CZ"
    );
    setZone(a?.zoneCode ?? "");
    setDeliveryPhone(a?.phoneNumber ?? c.phoneNumber ?? "");
  }, [data?.customer.defaultAddress?.id, data?.customer.id]);

  useEffect(() => {
    if (!data) return;
    setNewsletterOptIn(marketingIsOptedIn(data.customer.emailMarketingState));
  }, [data?.customer.emailMarketingState, data?.customer.id]);

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

  const handleSaveProfile = useCallback(async () => {
    if (!data) return;
    setSavingProfile(true);
    setProfileMessage(null);
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
      setSavingProfile(false);
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
    setProfileMessage(labels.saved);
    setSavingProfile(false);
  }, [data, firstName, lastName, labels.loadError, labels.saved, languageCode]);

  const handleSaveAddress = useCallback(async () => {
    if (!data) return;
    setSavingAddress(true);
    setAddressMessage(null);
    setError(null);

    const phone = deliveryPhone.trim();
    if (!phone.startsWith("+")) {
      setError(labels.phoneHint);
      setSavingAddress(false);
      return;
    }

    const response = await fetch("/api/account/address", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        addressId: data.customer.defaultAddress?.id ?? null,
        firstName: addrFirst.trim(),
        lastName: addrLast.trim(),
        company: company.trim() || null,
        buyingForCompany,
        address1: street.trim(),
        address2: streetNumber.trim() || null,
        city: city.trim(),
        zip: zip.trim(),
        territoryCode: territory,
        zoneCode: zone.trim() || null,
        phoneNumber: phone,
        language: languageCode,
      }),
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok || !payload?.ok) {
      setError(payload?.error || labels.loadError);
      setSavingAddress(false);
      return;
    }
    setData((prev) =>
      prev
        ? {
            ...prev,
            customer: {
              ...prev.customer,
              phoneNumber: payload.address.phoneNumber ?? prev.customer.phoneNumber,
              defaultAddress: payload.address,
            },
          }
        : prev
    );
    setAddressMessage(labels.addressSaved);
    setSavingAddress(false);
  }, [
    addrFirst,
    addrLast,
    buyingForCompany,
    city,
    company,
    data,
    deliveryPhone,
    labels.addressSaved,
    labels.loadError,
    labels.phoneHint,
    languageCode,
    street,
    streetNumber,
    territory,
    zip,
    zone,
  ]);

  const handleSaveNewsletter = useCallback(async () => {
    if (!data) return;
    setSavingNewsletter(true);
    setNewsletterMessage(null);
    setError(null);

    const response = await fetch("/api/account/marketing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subscribed: newsletterOptIn,
        language: languageCode,
      }),
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok || !payload?.ok) {
      setError(payload?.error || labels.loadError);
      setSavingNewsletter(false);
      return;
    }
    setData((prev) =>
      prev
        ? {
            ...prev,
            customer: {
              ...prev.customer,
              emailMarketingState: payload.marketingState,
            },
          }
        : prev
    );
    setNewsletterMessage(labels.newsletterSaved);
    setSavingNewsletter(false);
  }, [data, labels.loadError, labels.newsletterSaved, languageCode, newsletterOptIn]);

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
          <div className="space-y-6">
            <div className="rounded-lg border border-border bg-card p-5">
              <h2 className="mb-4 text-lg font-medium">{labels.profileHeading}</h2>
              <p className="mb-1 text-xs text-muted-foreground">{labels.requiredNote}</p>
              <div className="mb-4 text-sm text-muted-foreground">
                <div>
                  {labels.email}: <span className="text-foreground">{data.customer.email}</span>
                </div>
                <div>
                  {labels.phone}:{" "}
                  <span className="text-foreground">{data.customer.phoneNumber || "—"}</span>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-sm">
                  <span className="mb-1 block text-muted-foreground">{labels.firstName} *</span>
                  <input
                    value={firstName}
                    onChange={(event) => setFirstName(event.target.value)}
                    className="w-full rounded-md border border-border bg-background px-3 py-2"
                  />
                </label>
                <label className="block text-sm">
                  <span className="mb-1 block text-muted-foreground">{labels.lastName} *</span>
                  <input
                    value={lastName}
                    onChange={(event) => setLastName(event.target.value)}
                    className="w-full rounded-md border border-border bg-background px-3 py-2"
                  />
                </label>
              </div>
              <button
                type="button"
                onClick={() => void handleSaveProfile()}
                disabled={savingProfile}
                className="mt-4 rounded-md bg-foreground px-4 py-2 text-sm text-background disabled:opacity-50"
              >
                {savingProfile ? labels.saving : labels.saveProfile}
              </button>
              {profileMessage ? (
                <p className="mt-2 text-sm text-emerald-600">{profileMessage}</p>
              ) : null}
            </div>

            <div className="rounded-lg border border-border bg-card p-5">
              <h2 className="mb-4 text-lg font-medium">{labels.addressHeading}</h2>
              <p className="mb-3 text-xs text-muted-foreground">{labels.requiredNote}</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-sm sm:col-span-2">
                  <span className="mb-1 block text-muted-foreground">{labels.firstName} *</span>
                  <input
                    value={addrFirst}
                    onChange={(event) => setAddrFirst(event.target.value)}
                    className="w-full rounded-md border border-border bg-background px-3 py-2"
                  />
                </label>
                <label className="block text-sm sm:col-span-2">
                  <span className="mb-1 block text-muted-foreground">{labels.lastName} *</span>
                  <input
                    value={addrLast}
                    onChange={(event) => setAddrLast(event.target.value)}
                    className="w-full rounded-md border border-border bg-background px-3 py-2"
                  />
                </label>
                <label className="flex cursor-pointer items-center gap-2 text-sm sm:col-span-2">
                  <input
                    type="checkbox"
                    checked={buyingForCompany}
                    onChange={(event) => setBuyingForCompany(event.target.checked)}
                    className="rounded border-border"
                  />
                  {labels.buyingForCompany}
                </label>
                {buyingForCompany ? (
                  <label className="block text-sm sm:col-span-2">
                    <span className="mb-1 block text-muted-foreground">{labels.company}</span>
                    <input
                      value={company}
                      onChange={(event) => setCompany(event.target.value)}
                      className="w-full rounded-md border border-border bg-background px-3 py-2"
                    />
                  </label>
                ) : null}
                <label className="block text-sm">
                  <span className="mb-1 block text-muted-foreground">{labels.street} *</span>
                  <input
                    value={street}
                    onChange={(event) => setStreet(event.target.value)}
                    className="w-full rounded-md border border-border bg-background px-3 py-2"
                  />
                </label>
                <label className="block text-sm">
                  <span className="mb-1 block text-muted-foreground">{labels.streetNumber} *</span>
                  <input
                    value={streetNumber}
                    onChange={(event) => setStreetNumber(event.target.value)}
                    className="w-full rounded-md border border-border bg-background px-3 py-2"
                  />
                </label>
                <label className="block text-sm">
                  <span className="mb-1 block text-muted-foreground">{labels.city} *</span>
                  <input
                    value={city}
                    onChange={(event) => setCity(event.target.value)}
                    className="w-full rounded-md border border-border bg-background px-3 py-2"
                  />
                </label>
                <label className="block text-sm">
                  <span className="mb-1 block text-muted-foreground">{labels.zip} *</span>
                  <input
                    value={zip}
                    onChange={(event) => setZip(event.target.value)}
                    className="w-full rounded-md border border-border bg-background px-3 py-2"
                  />
                </label>
                <label className="block text-sm sm:col-span-2">
                  <span className="mb-1 block text-muted-foreground">{labels.country} *</span>
                  <select
                    value={territory}
                    onChange={(event) => setTerritory(event.target.value)}
                    className="w-full rounded-md border border-border bg-background px-3 py-2"
                  >
                    {ACCOUNT_ADDRESS_TERRITORY_CODES.map((code) => (
                      <option key={code} value={code}>
                        {regionNames.of(code) ?? code}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block text-sm sm:col-span-2">
                  <span className="mb-1 block text-muted-foreground">{labels.zoneOptional}</span>
                  <input
                    value={zone}
                    onChange={(event) => setZone(event.target.value)}
                    className="w-full rounded-md border border-border bg-background px-3 py-2"
                  />
                </label>
                <label className="block text-sm sm:col-span-2">
                  <span className="mb-1 block text-muted-foreground">{labels.phone} *</span>
                  <input
                    value={deliveryPhone}
                    onChange={(event) => setDeliveryPhone(event.target.value)}
                    className="w-full rounded-md border border-border bg-background px-3 py-2"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="+420601234567"
                  />
                </label>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{labels.phoneHint}</p>
              <button
                type="button"
                onClick={() => void handleSaveAddress()}
                disabled={savingAddress}
                className="mt-4 rounded-md bg-foreground px-4 py-2 text-sm text-background disabled:opacity-50"
              >
                {savingAddress ? labels.saving : labels.saveAddress}
              </button>
              {addressMessage ? (
                <p className="mt-2 text-sm text-emerald-600">{addressMessage}</p>
              ) : null}
            </div>

            <div className="rounded-lg border border-border bg-card p-5">
              <h2 className="mb-2 text-lg font-medium">{labels.newsletterHeading}</h2>
              <p className="mb-4 text-sm text-muted-foreground">
                {labels.newsletterDescription.replace("{email}", data.customer.email)}
              </p>
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={newsletterOptIn}
                  onChange={(event) => setNewsletterOptIn(event.target.checked)}
                  className="rounded border-border"
                />
                {labels.newsletterOptIn}
              </label>
              <button
                type="button"
                onClick={() => void handleSaveNewsletter()}
                disabled={savingNewsletter}
                className="mt-4 rounded-md bg-foreground px-4 py-2 text-sm text-background disabled:opacity-50"
              >
                {savingNewsletter ? labels.saving : labels.saveNewsletter}
              </button>
              {newsletterMessage ? (
                <p className="mt-2 text-sm text-emerald-600">{newsletterMessage}</p>
              ) : null}
            </div>

            <div className="rounded-lg border border-border bg-card p-5">
              <h2 className="mb-2 text-lg font-medium">{labels.accountDeletionHeading}</h2>
              <p className="text-sm text-muted-foreground">{labels.accountDeletionDescription}</p>
              <Link
                href="/contact"
                className="mt-3 inline-block text-sm font-medium text-foreground underline underline-offset-4 hover:opacity-80"
              >
                {labels.accountDeletionContact}
              </Link>
            </div>
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

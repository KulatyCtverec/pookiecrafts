import { createStorefrontClient } from "@shopify/hydrogen-react";
import {
  COLLECTIONS_QUERY,
  COLLECTION_BY_HANDLE_QUERY,
  LOCALIZATION_QUERY,
  PRODUCT_BY_HANDLE_QUERY,
  PRODUCTS_BY_TYPE_QUERY,
} from "./queries";
import type {
  ShopifyCollection,
  ShopifyCollectionWithProducts,
  ShopifyProduct,
} from "./types";

// ——— Jediné místo konfigurace Storefront API ——
// Public token: Headless channel / custom app Storefront token (X-Shopify-Storefront-Access-Token).
// Private token (volitelně): pro server; hlavička Shopify-Storefront-Private-Token (doporučeno Hydrogen).
// Viz: https://shopify.dev/docs/api/usage/authentication#access-tokens-for-the-storefront-api

const STORE_DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
const PUBLIC_TOKEN = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_API_TOKEN;
const API_VERSION =
  process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_API_VERSION ?? "2024-10";

function hasValidConfig(): boolean {
  const domain = STORE_DOMAIN?.trim();
  const hasPublic = !!PUBLIC_TOKEN?.trim();
  const hasPrivate =
    typeof process !== "undefined" &&
    !!process.env.SHOPIFY_STOREFRONT_PRIVATE_API_TOKEN?.trim();
  return !!(domain && (hasPublic || hasPrivate));
}

/** Hydrogen React Storefront klient (pro budoucí použití hooků / komponent). Inicializuje se až při platné konfiguraci, aby build na Vercelu nepadal. */
let _storefrontClient: ReturnType<typeof createStorefrontClient> | null = null;
function getStorefrontClientInstance(): ReturnType<typeof createStorefrontClient> {
  if (_storefrontClient) return _storefrontClient;
  if (!hasValidConfig()) {
    return {} as ReturnType<typeof createStorefrontClient>;
  }
  _storefrontClient = createStorefrontClient({
    storeDomain: STORE_DOMAIN ?? "",
    storefrontApiVersion: API_VERSION,
    publicStorefrontToken: PUBLIC_TOKEN ?? "",
    privateStorefrontToken:
      typeof process !== "undefined"
        ? process.env.SHOPIFY_STOREFRONT_PRIVATE_API_TOKEN
        : undefined,
  });
  return _storefrontClient;
}
export const storefrontClient = new Proxy({} as ReturnType<typeof createStorefrontClient>, {
  get(_, prop) {
    return getStorefrontClientInstance()[prop as keyof ReturnType<typeof createStorefrontClient>];
  },
});

/** Vrací URL, token a typ hlavičky pro Storefront API. Na serveru preferujeme private token. */
function getStorefrontConfig(): {
  url: string;
  /** Název hlavičky: X-Shopify-Storefront-Access-Token (public) nebo Shopify-Storefront-Private-Token (private). */
  headerName: string;
  token: string;
  configured: boolean;
} {
  const domain = STORE_DOMAIN?.trim();
  // Na serveru (Node) má smysl použít private token, pokud je nastaven
  const privateToken =
    typeof process !== "undefined" &&
    process.env.SHOPIFY_STOREFRONT_PRIVATE_API_TOKEN?.trim();
  const token = privateToken || PUBLIC_TOKEN?.trim();

  if (!domain || !token) {
    if (process.env.NODE_ENV === "development") {
      console.error(
        "Missing Shopify config. Set NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN and NEXT_PUBLIC_SHOPIFY_STOREFRONT_API_TOKEN (or SHOPIFY_STOREFRONT_PRIVATE_API_TOKEN on server) in .env.local."
      );
    } else if (typeof process !== "undefined") {
      // Produkce (Vercel): jednou zaloguj, ať je v deploy logu vidět, proč se data nenačítají
      console.warn(
        "[Shopify] Config missing in production. Add env vars in Vercel: NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN, NEXT_PUBLIC_SHOPIFY_STOREFRONT_API_TOKEN (or SHOPIFY_STOREFRONT_PRIVATE_API_TOKEN), then redeploy."
      );
    }
    return { url: "", headerName: "", token: "", configured: false };
  }
  let endpoint = domain;
  if (!endpoint.startsWith("http")) {
    endpoint = `https://${endpoint}`;
  }
  endpoint = endpoint.replace(/\/$/, "");
  const url = `${endpoint}/api/${API_VERSION}/graphql.json`;
  const headerName = privateToken
    ? "Shopify-Storefront-Private-Token"
    : "X-Shopify-Storefront-Access-Token";
  return { url, headerName, token, configured: true };
}

export interface ShopifyFetchOptions {
  cache?: RequestCache | "no-store";
  revalidate?: number;
}

/**
 * Jediný helper pro volání Shopify Storefront API (GraphQL).
 * POST na .../api/{version}/graphql.json.
 * Na serveru: pokud je nastaven SHOPIFY_STOREFRONT_PRIVATE_API_TOKEN, použije hlavičku
 * Shopify-Storefront-Private-Token; jinak X-Shopify-Storefront-Access-Token (public).
 */
export async function shopifyFetch<T>({
  query,
  variables,
  cache = "no-store",
  revalidate,
}: {
  query: string;
  variables?: Record<string, unknown>;
} & ShopifyFetchOptions): Promise<T> {
  const { url, headerName, token, configured } = getStorefrontConfig();

  if (!configured || !url) {
    throw new Error(
      "Shopify not configured. Set NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN and NEXT_PUBLIC_SHOPIFY_STOREFRONT_API_TOKEN (or SHOPIFY_STOREFRONT_PRIVATE_API_TOKEN on server) in .env.local"
    );
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    [headerName]: token,
  };

  const fetchOptions: RequestInit = {
    method: "POST",
    headers,
    body: JSON.stringify({ query, variables }),
  };

  if (cache === "no-store") {
    fetchOptions.cache = "no-store";
  } else if (revalidate !== undefined) {
    fetchOptions.next = { revalidate };
  } else if (cache) {
    fetchOptions.cache = cache;
  }

  // Next.js fetch cache key = URL only. Same URL with different language in body returns same cache.
  // Append language to URL so each locale gets its own cache entry.
  const lang = variables?.language as string | undefined;
  const fetchUrl = lang ? `${url}?lang=${encodeURIComponent(lang)}` : url;

  const res = await fetch(fetchUrl, fetchOptions);
  const json = await res.json();

  if (!res.ok) {
    const hint =
      res.status === 401
        ? " Check: token from Headless/custom app Storefront API (not Admin API); if using private token, set SHOPIFY_STOREFRONT_PRIVATE_API_TOKEN and use header Shopify-Storefront-Private-Token."
        : "";
    throw new Error(
      `Shopify API error: ${res.status} ${JSON.stringify(json)}.${hint}`
    );
  }

  if (json.errors?.length) {
    throw new Error(
      `Shopify GraphQL errors: ${JSON.stringify(json.errors)}`
    );
  }

  return json.data as T;
}

/** Map app locale (lowercase) to Shopify LanguageCode (uppercase). Defaults to EN. */
function toShopifyLanguage(locale?: string): string {
  if (!locale || typeof locale !== "string") return "EN";
  const code = locale.trim().toUpperCase().slice(0, 2);
  return code || "EN";
}

export interface ShopifyLanguage {
  isoCode: string;
  endonymName: string;
}

/** Get available languages from Shopify. Returns [] on error. */
export async function getAvailableLanguages(
  country?: string
): Promise<ShopifyLanguage[]> {
  if (!isConfigured()) return [];
  try {
    const data = await shopifyFetch<{
      localization: { availableLanguages: ShopifyLanguage[] };
    }>({
      query: LOCALIZATION_QUERY,
      variables: country ? { country: country.toUpperCase() } : {},
      revalidate: 3600,
    });
    return data.localization?.availableLanguages ?? [];
  } catch {
    return [];
  }
}

// ——— Katalog (kolekce, produkty) ———
// ISR/SSG: při buildu bez env vracíme prázdné hodnoty, aby build nepadal.

function isConfigured(): boolean {
  return hasValidConfig();
}

export async function getCollections(
  locale?: string
): Promise<ShopifyCollection[]> {
  if (!isConfigured()) return [];
  const language = toShopifyLanguage(locale);
  const data = await shopifyFetch<{
    collections: { nodes: ShopifyCollection[] };
  }>({
    query: COLLECTIONS_QUERY,
    variables: { language },
    revalidate: 300,
  });
  return data.collections.nodes;
}

export async function getCollectionByHandle(
  handle: string,
  locale?: string
): Promise<ShopifyCollectionWithProducts | null> {
  if (!isConfigured()) return null;
  const language = toShopifyLanguage(locale);
  const data = await shopifyFetch<{
    collection: ShopifyCollectionWithProducts | null;
  }>({
    query: COLLECTION_BY_HANDLE_QUERY,
    variables: { handle, language },
    revalidate: 300,
  });
  return data.collection;
}

export async function getProductByHandle(
  handle: string,
  locale?: string
): Promise<ShopifyProduct | null> {
  if (!isConfigured()) return null;
  const language = toShopifyLanguage(locale);
  const data = await shopifyFetch<{
    product: ShopifyProduct | null;
  }>({
    query: PRODUCT_BY_HANDLE_QUERY,
    variables: { handle, language },
    revalidate: 300,
  });
  return data.product;
}

export type ShopifyProductForColor = Pick<
  ShopifyProduct,
  "id" | "handle" | "title" | "options"
>;

export async function getProductsByType(
  productType: string,
  locale?: string
): Promise<ShopifyProductForColor[]> {
  if (!isConfigured() || !productType.trim()) return [];
  const query = `product_type:"${productType.replace(/"/g, '\\"')}"`;
  const language = toShopifyLanguage(locale);
  const data = await shopifyFetch<{
    products: { nodes: ShopifyProductForColor[] };
  }>({
    query: PRODUCTS_BY_TYPE_QUERY,
    variables: { query, language },
    revalidate: 300,
  });
  return data.products?.nodes ?? [];
}

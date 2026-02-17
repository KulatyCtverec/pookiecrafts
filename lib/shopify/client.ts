import { createStorefrontClient } from "@shopify/hydrogen-react";
import {
  COLLECTIONS_QUERY,
  COLLECTION_BY_HANDLE_QUERY,
  PRODUCT_BY_HANDLE_QUERY,
} from "./queries";
import type {
  ShopifyCollection,
  ShopifyCollectionWithProducts,
  ShopifyProduct,
} from "./types";

// ——— Jediné místo konfigurace Storefront API ———
// Public token: Headless channel / custom app Storefront token (X-Shopify-Storefront-Access-Token).
// Private token (volitelně): pro server; hlavička Shopify-Storefront-Private-Token (doporučeno Hydrogen).
// Viz: https://shopify.dev/docs/api/usage/authentication#access-tokens-for-the-storefront-api

const STORE_DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
const PUBLIC_TOKEN = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_API_TOKEN;
const API_VERSION =
  process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_API_VERSION ?? "2024-10";

/** Hydrogen React Storefront klient (pro budoucí použití hooků / komponent). */
export const storefrontClient = createStorefrontClient({
  storeDomain: STORE_DOMAIN ?? "",
  storefrontApiVersion: API_VERSION,
  publicStorefrontToken: PUBLIC_TOKEN ?? "",
  // Na serveru Hydrogen doporučuje private token – odstraní varování a používá se pro serverové requesty
  privateStorefrontToken:
    typeof process !== "undefined"
      ? process.env.SHOPIFY_STOREFRONT_PRIVATE_API_TOKEN
      : undefined,
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

  const res = await fetch(url, fetchOptions);
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

// ——— Katalog (kolekce, produkty) ———
// ISR/SSG: při buildu bez env vracíme prázdné hodnoty, aby build nepadal.

function isConfigured(): boolean {
  const hasPublic = !!(STORE_DOMAIN && PUBLIC_TOKEN);
  const hasPrivate =
    typeof process !== "undefined" &&
    !!process.env.SHOPIFY_STOREFRONT_PRIVATE_API_TOKEN?.trim();
  return !!(STORE_DOMAIN && (hasPublic || hasPrivate));
}

export async function getCollections(): Promise<ShopifyCollection[]> {
  if (!isConfigured()) return [];
  const data = await shopifyFetch<{
    collections: { nodes: ShopifyCollection[] };
  }>({
    query: COLLECTIONS_QUERY,
    revalidate: 300,
  });
  return data.collections.nodes;
}

export async function getCollectionByHandle(
  handle: string
): Promise<ShopifyCollectionWithProducts | null> {
  if (!isConfigured()) return null;
  const data = await shopifyFetch<{
    collection: ShopifyCollectionWithProducts | null;
  }>({
    query: COLLECTION_BY_HANDLE_QUERY,
    variables: { handle },
    revalidate: 300,
  });
  return data.collection;
}

export async function getProductByHandle(
  handle: string
): Promise<ShopifyProduct | null> {
  if (!isConfigured()) return null;
  const data = await shopifyFetch<{
    product: ShopifyProduct | null;
  }>({
    query: PRODUCT_BY_HANDLE_QUERY,
    variables: { handle },
    revalidate: 300,
  });
  return data.product;
}

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

const STOREFRONT_API_VERSION = "2024-07";

function getShopifyConfig(): { url: string; token: string; configured: boolean } {
  const domain = process.env.SHOPIFY_STORE_DOMAIN;
  const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;

  if (!domain || !token) {
    if (process.env.NODE_ENV === "development") {
      console.error(
        "Missing SHOPIFY_STORE_DOMAIN or SHOPIFY_STOREFRONT_ACCESS_TOKEN. Add them to .env.local. Catalog will be empty."
      );
    }
    return { url: "", token: "", configured: false };
  }

  let endpoint = domain;
  if (endpoint && !endpoint.startsWith("http")) {
    endpoint = `https://${endpoint}`;
  }
  endpoint = endpoint.replace(/\/$/, "");
  const url = `${endpoint}/api/${STOREFRONT_API_VERSION}/graphql.json`;

  return { url, token, configured: true };
}

export interface ShopifyFetchOptions {
  cache?: RequestCache | "no-store";
  revalidate?: number;
}

export async function shopifyFetch<T>({
  query,
  variables,
  cache = "no-store",
  revalidate,
}: {
  query: string;
  variables?: Record<string, unknown>;
} & ShopifyFetchOptions): Promise<T> {
  const { url, token, configured } = getShopifyConfig();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-Shopify-Storefront-Access-Token": token,
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

  if (!configured || !url) {
    throw new Error(
      "Shopify not configured. Set SHOPIFY_STORE_DOMAIN and SHOPIFY_STOREFRONT_ACCESS_TOKEN in .env.local"
    );
  }

  const res = await fetch(url, fetchOptions);
  const json = await res.json();

  if (!res.ok) {
    throw new Error(`Shopify API error: ${res.status} ${JSON.stringify(json)}`);
  }

  if (json.errors) {
    throw new Error(`Shopify GraphQL errors: ${JSON.stringify(json.errors)}`);
  }

  return json.data as T;
}

// Catalog queries (ISR/SSG) - return empty when Shopify not configured (e.g. build without env)
function isConfigured(): boolean {
  return !!(process.env.SHOPIFY_STORE_DOMAIN && process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN);
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

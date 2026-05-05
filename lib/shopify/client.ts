import { createStorefrontClient } from "@shopify/hydrogen-react";
import {
  COLLECTIONS_QUERY,
  COLLECTION_BY_HANDLE_QUERY,
  ABOUT_PHOTO_METAOBJECT_QUERY,
  HOMEPAGE_CAROUSEL_METAOBJECTS_QUERY,
  LOCALIZATION_QUERY,
  MEDIA_FILE_BY_ID_QUERY,
  PRODUCT_BY_HANDLE_QUERY,
  PRODUCTS_BY_TYPE_QUERY,
  PRODUCTS_BY_TYPE_SUMMARY_QUERY,
  COLLECTIONS_PAGINATED_QUERY,
  PRODUCTS_PAGINATED_QUERY,
} from "./queries";
import type {
  HomepageCarouselImage,
  ShopifyCollection,
  ShopifyCollectionWithProducts,
  ShopifyProduct,
  ShopifyProductSummary,
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

/** Map app locale to Shopify LanguageCode. Defaults to EN. */
function toShopifyLanguage(locale?: string): string {
  if (!locale || typeof locale !== "string") return "EN";
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

const WISHLIST_HANDLE_MAX = 50;

function shopifyProductToSummary(p: ShopifyProduct): ShopifyProductSummary {
  return {
    id: p.id,
    handle: p.handle,
    title: p.title,
    availableForSale: p.availableForSale ?? true,
    featuredImage: p.featuredImage,
    priceRange: p.priceRange,
  };
}

/**
 * Load multiple products by handle for wishlist.
 * Uses one Storefront query per handle — the `handle:a OR handle:b` search often returns an
 * incomplete set on success, which caused missing items and accidental localStorage pruning.
 */
export async function getProductsByHandles(
  handles: string[],
  locale?: string
): Promise<ShopifyProductSummary[]> {
  if (!isConfigured() || handles.length === 0) return [];
  const unique = [
    ...new Set(
      handles.map((h) => h.trim()).filter((h) => h.length > 0)
    ),
  ].slice(0, WISHLIST_HANDLE_MAX);
  if (unique.length === 0) return [];

  const rows = await Promise.all(
    unique.map((handle) => getProductByHandle(handle, locale))
  );

  return rows
    .filter((p): p is ShopifyProduct => p !== null)
    .map(shopifyProductToSummary);
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

export async function getProductsByTypeSummary(
  productType: string,
  locale?: string
): Promise<ShopifyProductSummary[]> {
  if (!isConfigured() || !productType.trim()) return [];
  const query = `product_type:"${productType.replace(/"/g, '\\"')}"`;
  const language = toShopifyLanguage(locale);
  const data = await shopifyFetch<{
    products: { nodes: ShopifyProductSummary[] };
  }>({
    query: PRODUCTS_BY_TYPE_SUMMARY_QUERY,
    variables: { query, language },
    revalidate: 300,
  });
  return data.products?.nodes ?? [];
}

type CarouselMetaobjectReference =
  | {
      image?: { url: string; altText: string | null } | null;
      url?: undefined;
    }
  | {
      url?: string | null;
      alt?: string | null;
      image?: undefined;
    };

interface CarouselMetaobjectNode {
  id: string;
  handle: string;
  photo: { reference: CarouselMetaobjectReference | null } | null;
  keyField: { value: string | null } | null;
}

export interface AboutPhotoImage {
  url: string;
  alt: string;
}

interface AboutPhotoMetaobjectNode {
  id: string;
  handle: string;
  keyField: { value: string | null } | null;
  fields?: {
    key: string;
    value?: string | null;
    reference: CarouselMetaobjectReference | null;
  }[];
}

type MediaFileNode =
  | {
      __typename: "MediaImage";
      image?: { url: string; altText: string | null } | null;
      url?: undefined;
      alt?: undefined;
    }
  | {
      __typename: "GenericFile";
      url?: string | null;
      alt?: string | null;
      image?: undefined;
    }
  | null;

function parseHomepageCarouselNode(
  node: CarouselMetaobjectNode
): HomepageCarouselImage | null {
  const ref = node.photo?.reference;
  let url: string | null = null;
  let alt: string | null = null;
  if (ref && "image" in ref && ref.image?.url) {
    url = ref.image.url;
    alt = ref.image.altText ?? null;
  } else if (ref && "url" in ref && ref.url) {
    url = String(ref.url);
    alt = (ref.alt as string | null) ?? null;
  }
  if (!url?.trim()) return null;
  const keyText = node.keyField?.value?.trim();
  return {
    id: node.id,
    url: url.trim(),
    alt: (alt && alt.trim()) || keyText || node.handle || "Carousel",
  };
}

/**
 * Obrázky pro hero carousel z metaobjectů typu `homepage_products`.
 * Při chybě scope `unauthenticated_read_metaobjects` nebo prázdném výsledku vrátí [].
 */
export async function getHomepageCarouselImages(
  locale?: string
): Promise<HomepageCarouselImage[]> {
  if (!isConfigured()) return [];
  const language = toShopifyLanguage(locale);
  try {
    const data = await shopifyFetch<{
      metaobjects: { nodes: CarouselMetaobjectNode[] };
    }>({
      query: HOMEPAGE_CAROUSEL_METAOBJECTS_QUERY,
      variables: { language },
      revalidate: 300,
    });
    const nodes = data.metaobjects?.nodes ?? [];
    return nodes
      .map(parseHomepageCarouselNode)
      .filter((x): x is HomepageCarouselImage => x !== null);
  } catch (e) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[Shopify] getHomepageCarouselImages:", e);
    }
    return [];
  }
}

/**
 * Hlavní fotka pro About page z metaobjectu `about_photo` s `key = "main"`.
 * Při chybě nebo chybějícím scope vrací null.
 */
export async function getAboutPhotoImage(
  locale?: string
): Promise<AboutPhotoImage | null> {
  if (!isConfigured()) return null;
  const resolveFileById = async (id: string): Promise<AboutPhotoImage | null> => {
    const data = await shopifyFetch<{ node: MediaFileNode }>({
      query: MEDIA_FILE_BY_ID_QUERY,
      variables: { id },
      revalidate: 300,
    });
    const node = data.node;
    if (!node) return null;
    if (node.__typename === "MediaImage" && node.image?.url) {
      return {
        url: node.image.url,
        alt: node.image.altText?.trim() || "About",
      };
    }
    if (node.__typename === "GenericFile" && node.url) {
      return {
        url: node.url,
        alt: node.alt?.trim() || "About",
      };
    }
    return null;
  };

  try {
    const data = await shopifyFetch<{
      metaobjects: { nodes: AboutPhotoMetaobjectNode[] };
    }>({
      query: ABOUT_PHOTO_METAOBJECT_QUERY,
      revalidate: 300,
    });
    const nodes = data.metaobjects?.nodes ?? [];
    const nodeByMainKey = nodes.find(
      (item) => item.keyField?.value?.trim().toLowerCase() === "main"
    );
    const nodeWithImage = nodes.find((item) =>
      (item.fields ?? []).some(
        (field) =>
          field.key !== "key" &&
          (field.reference ||
            (field.value?.startsWith("gid://shopify/MediaImage/") ?? false) ||
            (field.value?.startsWith("gid://shopify/GenericFile/") ?? false))
      )
    );
    const node = nodeByMainKey ?? nodeWithImage;
    if (!node) return null;

    const mediaField = (node.fields ?? []).find(
      (field) =>
        field.key !== "key" &&
        (field.reference ||
          (field.value?.startsWith("gid://shopify/MediaImage/") ?? false) ||
          (field.value?.startsWith("gid://shopify/GenericFile/") ?? false))
    );
    if (!mediaField) return null;

    const parsed = parseHomepageCarouselNode({
      ...node,
      photo: { reference: mediaField.reference ?? null },
    } as CarouselMetaobjectNode);
    if (parsed) {
      return { url: parsed.url, alt: parsed.alt };
    }

    const fileId = mediaField.value?.trim() || null;
    if (fileId?.startsWith("gid://")) {
      return await resolveFileById(fileId);
    }
    return null;
  } catch (e) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[Shopify] getAboutPhotoImage:", e);
    }
    return null;
  }
}

type ShopifyHandleNode = { handle: string; updatedAt?: string; title?: string };

async function paginateHandles(
  query: string,
  locale?: string,
  limit?: number
): Promise<ShopifyHandleNode[]> {
  if (!isConfigured()) return [];
  const language = toShopifyLanguage(locale);
  const nodes: ShopifyHandleNode[] = [];
  let cursor: string | null = null;
  let hasNext = true;
  let guard = 0;

  while (hasNext && guard < 20) {
    guard += 1;
    const data: {
      collections?: { nodes: ShopifyHandleNode[]; pageInfo: { hasNextPage: boolean; endCursor: string | null } };
      products?: { nodes: ShopifyHandleNode[]; pageInfo: { hasNextPage: boolean; endCursor: string | null } };
    } = await shopifyFetch({
      query,
      variables: { cursor, language },
      revalidate: 3600,
    });

    const payload:
      | { nodes: ShopifyHandleNode[]; pageInfo: { hasNextPage: boolean; endCursor: string | null } }
      | undefined =
      data.collections ?? data.products;
    if (!payload) break;
    nodes.push(...payload.nodes);
    if (limit && nodes.length >= limit) break;
    hasNext = payload.pageInfo.hasNextPage;
    cursor = payload.pageInfo.endCursor;
  }

  return limit ? nodes.slice(0, limit) : nodes;
}

export async function getCollectionHandles(locale?: string, limit?: number): Promise<ShopifyHandleNode[]> {
  return paginateHandles(COLLECTIONS_PAGINATED_QUERY, locale, limit);
}

/** Všechny kolekce pro navigaci (názvy dle @inContext language). */
export async function getNavCollections(
  locale?: string
): Promise<{ handle: string; title: string }[]> {
  const nodes = await paginateHandles(COLLECTIONS_PAGINATED_QUERY, locale);
  return nodes.map((n) => ({
    handle: n.handle,
    title: (n.title && n.title.trim()) || n.handle,
  }));
}

export async function getProductHandles(locale?: string, limit?: number): Promise<ShopifyHandleNode[]> {
  return paginateHandles(PRODUCTS_PAGINATED_QUERY, locale, limit);
}

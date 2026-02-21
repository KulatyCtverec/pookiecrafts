/**
 * Client-side Shopify Storefront API for cart operations.
 * Only use in the browser (CartProvider). Uses public token.
 */

import type { ShopifyCart } from "./types";

function toShopifyLanguage(locale?: string): string {
  if (!locale || typeof locale !== "string") return "EN";
  const code = locale.trim().toUpperCase().slice(0, 2);
  return code || "EN";
}
import {
  CART_CREATE_MUTATION,
  CART_GET_QUERY,
  CART_LINES_ADD_MUTATION,
  CART_LINES_UPDATE_MUTATION,
  CART_LINES_REMOVE_MUTATION,
} from "./queries";

function getClientConfig(): {
  url: string;
  token: string;
  configured: boolean;
} {
  if (typeof window === "undefined") {
    return { url: "", token: "", configured: false };
  }
  const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN?.trim();
  const token = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_API_TOKEN?.trim();
  const version =
    process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_API_VERSION?.trim() ?? "2024-10";
  if (!domain || !token) {
    return { url: "", token: "", configured: false };
  }
  let endpoint = domain.startsWith("http") ? domain : `https://${domain}`;
  endpoint = endpoint.replace(/\/$/, "");
  const url = `${endpoint}/api/${version}/graphql.json`;
  return { url, token, configured: true };
}

async function shopifyFetchClient<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const { url, token, configured } = getClientConfig();
  if (!configured || !url) {
    throw new Error(
      "Shopify not configured. Set NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN and NEXT_PUBLIC_SHOPIFY_STOREFRONT_API_TOKEN."
    );
  }
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": token,
    },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(`Shopify API error: ${res.status} ${JSON.stringify(json)}`);
  }
  if (json.errors?.length) {
    throw new Error(`Shopify GraphQL errors: ${JSON.stringify(json.errors)}`);
  }
  return json.data as T;
}

function assertNoUserErrors(
  userErrors: { field: string[]; message: string }[],
  context: string
): void {
  if (userErrors.length > 0) {
    const msg = userErrors[0]?.message ?? "Unknown error";
    throw new Error(`${context}: ${msg}`);
  }
}

export async function createCart(locale?: string): Promise<ShopifyCart> {
  const language = toShopifyLanguage(locale);
  const data = await shopifyFetchClient<{
    cartCreate: {
      cart: ShopifyCart | null;
      userErrors: { field: string[]; message: string }[];
    };
  }>(CART_CREATE_MUTATION, { language });
  assertNoUserErrors(data.cartCreate.userErrors, "Create cart");
  if (!data.cartCreate.cart) {
    throw new Error("Create cart: no cart returned");
  }
  return data.cartCreate.cart;
}

export async function getCart(
  cartId: string,
  locale?: string
): Promise<ShopifyCart | null> {
  const language = toShopifyLanguage(locale);
  const data = await shopifyFetchClient<{ cart: ShopifyCart | null }>(
    CART_GET_QUERY,
    { cartId, language }
  );
  return data.cart;
}

export async function addToCart(
  cartId: string,
  variantId: string,
  quantity: number = 1,
  locale?: string
): Promise<ShopifyCart> {
  const language = toShopifyLanguage(locale);
  const data = await shopifyFetchClient<{
    cartLinesAdd: {
      cart: ShopifyCart | null;
      userErrors: { field: string[]; message: string }[];
    };
  }>(CART_LINES_ADD_MUTATION, {
    cartId,
    lines: [{ merchandiseId: variantId, quantity }],
    language,
  });
  assertNoUserErrors(data.cartLinesAdd.userErrors, "Add to cart");
  if (!data.cartLinesAdd.cart) {
    throw new Error("Add to cart: no cart returned");
  }
  return data.cartLinesAdd.cart;
}

export async function updateCartLine(
  cartId: string,
  lineId: string,
  quantity: number,
  locale?: string
): Promise<ShopifyCart> {
  const language = toShopifyLanguage(locale);
  const data = await shopifyFetchClient<{
    cartLinesUpdate: {
      cart: ShopifyCart | null;
      userErrors: { field: string[]; message: string }[];
    };
  }>(CART_LINES_UPDATE_MUTATION, {
    cartId,
    lines: [{ id: lineId, quantity }],
    language,
  });
  assertNoUserErrors(data.cartLinesUpdate.userErrors, "Update cart line");
  if (!data.cartLinesUpdate.cart) {
    throw new Error("Update cart line: no cart returned");
  }
  return data.cartLinesUpdate.cart;
}

export async function removeCartLine(
  cartId: string,
  lineId: string,
  locale?: string
): Promise<ShopifyCart> {
  const language = toShopifyLanguage(locale);
  const data = await shopifyFetchClient<{
    cartLinesRemove: {
      cart: ShopifyCart | null;
      userErrors: { field: string[]; message: string }[];
    };
  }>(CART_LINES_REMOVE_MUTATION, {
    cartId,
    lineIds: [lineId],
    language,
  });
  assertNoUserErrors(data.cartLinesRemove.userErrors, "Remove from cart");
  if (!data.cartLinesRemove.cart) {
    throw new Error("Remove from cart: no cart returned");
  }
  return data.cartLinesRemove.cart;
}

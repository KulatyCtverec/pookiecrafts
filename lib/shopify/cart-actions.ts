"use server";

import { shopifyFetch } from "./client";
import type { ShopifyCart } from "./types";
import {
  CART_CREATE_MUTATION,
  CART_GET_QUERY,
  CART_LINES_ADD_MUTATION,
  CART_LINES_UPDATE_MUTATION,
  CART_LINES_REMOVE_MUTATION,
} from "./queries";

export async function createCart(): Promise<ShopifyCart | null> {
  const data = await shopifyFetch<{
    cartCreate: {
      cart: ShopifyCart | null;
      userErrors: { field: string[]; message: string }[];
    };
  }>({
    query: CART_CREATE_MUTATION,
    cache: "no-store",
  });
  if (data.cartCreate.userErrors.length > 0) return null;
  return data.cartCreate.cart;
}

export async function getCart(cartId: string): Promise<ShopifyCart | null> {
  const data = await shopifyFetch<{ cart: ShopifyCart | null }>({
    query: CART_GET_QUERY,
    variables: { cartId },
    cache: "no-store",
  });
  return data.cart;
}

export async function addToCart(
  cartId: string,
  variantId: string,
  quantity: number = 1
): Promise<ShopifyCart | null> {
  const data = await shopifyFetch<{
    cartLinesAdd: {
      cart: ShopifyCart | null;
      userErrors: { field: string[]; message: string }[];
    };
  }>({
    query: CART_LINES_ADD_MUTATION,
    variables: {
      cartId,
      lines: [{ merchandiseId: variantId, quantity }],
    },
    cache: "no-store",
  });
  if (data.cartLinesAdd.userErrors.length > 0) return null;
  return data.cartLinesAdd.cart;
}

export async function updateCartLine(
  cartId: string,
  lineId: string,
  quantity: number
): Promise<ShopifyCart | null> {
  const data = await shopifyFetch<{
    cartLinesUpdate: {
      cart: ShopifyCart | null;
      userErrors: { field: string[]; message: string }[];
    };
  }>({
    query: CART_LINES_UPDATE_MUTATION,
    variables: {
      cartId,
      lines: [{ id: lineId, quantity }],
    },
    cache: "no-store",
  });
  if (data.cartLinesUpdate.userErrors.length > 0) return null;
  return data.cartLinesUpdate.cart;
}

export async function removeCartLine(
  cartId: string,
  lineId: string
): Promise<ShopifyCart | null> {
  const data = await shopifyFetch<{
    cartLinesRemove: {
      cart: ShopifyCart | null;
      userErrors: { field: string[]; message: string }[];
    };
  }>({
    query: CART_LINES_REMOVE_MUTATION,
    variables: { cartId, lineIds: [lineId] },
    cache: "no-store",
  });
  if (data.cartLinesRemove.userErrors.length > 0) return null;
  return data.cartLinesRemove.cart;
}

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

/** Storefront API vrací userErrors s field (pole) a message. Při chybě hodíme Error s textem pro UX. */
function assertNoUserErrors(
  userErrors: { field: string[]; message: string }[],
  context: string
): void {
  if (userErrors.length > 0) {
    const msg = userErrors[0]?.message ?? "Unknown error";
    throw new Error(`${context}: ${msg}`);
  }
}

export async function createCart(): Promise<ShopifyCart> {
  const data = await shopifyFetch<{
    cartCreate: {
      cart: ShopifyCart | null;
      userErrors: { field: string[]; message: string }[];
    };
  }>({
    query: CART_CREATE_MUTATION,
    cache: "no-store",
  });
  assertNoUserErrors(data.cartCreate.userErrors, "Create cart");
  if (!data.cartCreate.cart) {
    throw new Error("Create cart: no cart returned");
  }
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
): Promise<ShopifyCart> {
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
  assertNoUserErrors(data.cartLinesAdd.userErrors, "Add to cart");
  if (!data.cartLinesAdd.cart) {
    throw new Error("Add to cart: no cart returned");
  }
  return data.cartLinesAdd.cart;
}

export async function updateCartLine(
  cartId: string,
  lineId: string,
  quantity: number
): Promise<ShopifyCart> {
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
  assertNoUserErrors(data.cartLinesUpdate.userErrors, "Update cart line");
  if (!data.cartLinesUpdate.cart) {
    throw new Error("Update cart: no cart returned");
  }
  return data.cartLinesUpdate.cart;
}

export async function removeCartLine(
  cartId: string,
  lineId: string
): Promise<ShopifyCart> {
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
  assertNoUserErrors(data.cartLinesRemove.userErrors, "Remove from cart");
  if (!data.cartLinesRemove.cart) {
    throw new Error("Remove from cart: no cart returned");
  }
  return data.cartLinesRemove.cart;
}

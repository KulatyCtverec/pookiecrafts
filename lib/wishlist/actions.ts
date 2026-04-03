"use server";

import { getProductsByHandles } from "@/lib/shopify/client";

const MAX_HANDLES = 50;

function isPlausibleShopifyHandle(h: string): boolean {
  if (h.length < 1 || h.length > 255) return false;
  // Avoid path injection / garbage; Shopify handles are typically [a-z0-9_-].
  if (/[\s/\\<>'"]/.test(h)) return false;
  return true;
}

export type WishlistProductDto = {
  id: string;
  handle: string;
  title: string;
  image: string | null;
  price: string;
  currencyCode: string;
};

export async function fetchWishlistProducts(
  handles: unknown,
  locale: string
): Promise<WishlistProductDto[]> {
  if (!Array.isArray(handles) || handles.length === 0) return [];

  const clean = [
    ...new Set(
      handles
        .map((h) => String(h).trim())
        .filter((h) => isPlausibleShopifyHandle(h))
    ),
  ].slice(0, MAX_HANDLES);

  if (clean.length === 0) return [];

  const products = await getProductsByHandles(clean, locale);
  const byHandle = new Map(products.map((p) => [p.handle, p]));

  const ordered: WishlistProductDto[] = [];
  for (const handle of clean) {
    const p = byHandle.get(handle);
    if (!p) continue;
    ordered.push({
      id: p.id,
      handle: p.handle,
      title: p.title,
      image: p.featuredImage?.url ?? null,
      price: p.priceRange.minVariantPrice.amount,
      currencyCode: p.priceRange.minVariantPrice.currencyCode,
    });
  }
  return ordered;
}

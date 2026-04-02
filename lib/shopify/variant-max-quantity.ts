/**
 * Max. ks podle Storefront `quantityAvailable`.
 * - `currentlyNotInStock` (předobjednávka): strop 99.
 * - `quantityAvailable === 0`: vrací 0 (žádný prodej), ne 99.
 * - `quantityAvailable` null/undefined: 99 (sklad v API neznámý).
 */
export const DEFAULT_QUANTITY_CAP = 99;

export interface VariantQuantityCapInput {
  availableForSale?: boolean;
  currentlyNotInStock?: boolean;
  quantityAvailable?: number | null;
}

export function getVariantMaxQuantity(
  variant: VariantQuantityCapInput | null | undefined
): number {
  if (!variant?.availableForSale) return 1;
  if (variant.currentlyNotInStock) return DEFAULT_QUANTITY_CAP;
  const qa = variant.quantityAvailable;
  if (typeof qa === "number") {
    if (qa <= 0) return 0;
    return qa;
  }
  return DEFAULT_QUANTITY_CAP;
}

/** First in-stock variant id, or null when none are available. */
export function pickCardVariantId(
  variants: { id: string; availableForSale: boolean }[] | undefined
): string | null {
  if (!variants?.length) return null;
  return variants.find((v) => v.availableForSale)?.id ?? null;
}

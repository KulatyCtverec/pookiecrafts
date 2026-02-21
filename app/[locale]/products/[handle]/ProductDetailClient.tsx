"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/design-system/Button";
import { QuantitySelector } from "@/components/design-system/QuantitySelector";
import { ImageWithFallback } from "@/components/design-system/ImageWithFallback";
import { useCart, type OptimisticCartLineSnapshot } from "@/components/cart/CartProvider";
import { Truck } from "lucide-react";
import { BackButton } from "@/components/design-system/BackButton";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import type { ShopifyProduct, ShopifyProductForColor } from "@/lib/shopify";

interface ProductDetailClientProps {
  product: ShopifyProduct;
  relatedProductsByType?: ShopifyProductForColor[];
  locale?: string;
}

function formatPrice(amount: string, currencyCode: string, locale: string): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currencyCode,
  }).format(parseFloat(amount));
}

const COLOR_OPTION_NAMES = ["color", "colour", "barva", "farba"];

function getColorOptionName(product: { options?: { name: string }[] }): string | undefined {
  const names = product.options?.map((o) => o.name) ?? [];
  return names.find((n) => COLOR_OPTION_NAMES.includes(n?.toLowerCase() ?? "")) ?? undefined;
}

function getSwatchHex(
  product: { options?: { name: string; optionValues?: { name: string; swatch?: { color?: string } | null }[] }[] },
  colorOptionName: string,
  colorValue: string
): string {
  const option = product.options?.find(
    (o) => o.name.toLowerCase() === colorOptionName.toLowerCase()
  );
  const optionValue = option?.optionValues?.find(
    (ov) => ov.name.trim().toLowerCase() === colorValue.trim().toLowerCase()
  );
  const hex = optionValue?.swatch?.color;
  return hex && /^#[0-9A-Fa-f]{6}$/.test(hex) ? hex : "#a1a1aa";
}

function getProductColorInfo(p: ShopifyProductForColor): { handle: string; hex: string; colorName: string } | null {
  const colorOpt = getColorOptionName(p);
  if (!colorOpt) return null;
  const opt = p.options?.find((o) => o.name === colorOpt);
  const firstVal = opt?.optionValues?.[0];
  if (!firstVal?.name) return null;
  const hex =
    firstVal.swatch?.color && /^#[0-9A-Fa-f]{6}$/.test(firstVal.swatch.color)
      ? firstVal.swatch.color
      : "#a1a1aa";
  return { handle: p.handle, hex, colorName: firstVal.name };
}

export function ProductDetailClient({ product, relatedProductsByType = [], locale = "en" }: ProductDetailClientProps) {
  const t = useTranslations("product");
  const tCommon = useTranslations("common");
  const { addItem, cartError, isPendingAdd } = useCart();

  const [selectedVariantId, setSelectedVariantId] = useState(
    product.variants.nodes[0]?.id ?? ""
  );
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  const selectedVariant = product.variants.nodes.find(
    (v) => v.id === selectedVariantId
  ) ?? product.variants.nodes[0];
  const images = product.images.nodes.length > 0
    ? product.images.nodes
    : product.featuredImage
      ? [product.featuredImage]
      : [];
  const fallbackImage = images[0] ?? { url: "", altText: null, width: 0, height: 0 };

  const variantOptions = product.variants.nodes.flatMap((v) =>
    v.selectedOptions
      .filter((o) => o.name && o.value)
      .map((o) => ({ name: o.name, value: o.value }))
  );
  const uniqueOptionNames = [...new Set(variantOptions.map((o) => o.name))];
  const optionNamesFromProduct =
    product.options?.map((o) => o.name) ?? uniqueOptionNames;
  const colorOptionName =
    getColorOptionName(product) ??
    product.variants.nodes[0]?.selectedOptions.find((o) =>
      COLOR_OPTION_NAMES.includes(o.name?.toLowerCase() ?? "")
    )?.name ??
    (optionNamesFromProduct.length === 1 &&
    !["size", "velikost", "title"].includes(optionNamesFromProduct[0]?.toLowerCase() ?? "")
      ? optionNamesFromProduct[0]
      : undefined);
  const colorVariants = colorOptionName
    ? product.variants.nodes.map((v) => {
        const colorVal = v.selectedOptions.find(
          (o) => o.name === colorOptionName
        )?.value;
        return colorVal ? { colorValue: colorVal, variantId: v.id } : null;
      }).filter(Boolean) as { colorValue: string; variantId: string }[]
    : [];
  const uniqueColors = colorVariants.reduce(
    (acc, c) => {
      if (!acc.some((x) => x.colorValue === c.colorValue)) acc.push(c);
      return acc;
    },
    [] as { colorValue: string; variantId: string }[]
  );

  const relatedWithColors = relatedProductsByType
    .map(getProductColorInfo)
    .filter((x): x is { handle: string; hex: string; colorName: string } => x !== null);
  const useRelatedProducts =
    relatedWithColors.length >= 2 &&
    relatedWithColors.some((r) => r.handle === product.handle);

  const variantImagesForThumbnails =
    !useRelatedProducts && uniqueColors.length > 0
      ? uniqueColors
          .map(({ variantId }) => product.variants.nodes.find((v) => v.id === variantId))
          .filter((v): v is NonNullable<typeof v> => !!v?.image)
          .map((v) => ({ variantId: v.id, image: v.image! }))
      : [];

  const hasVariantImages = variantImagesForThumbnails.length > 0;

  const mainDisplayImage = hasVariantImages
    ? (selectedVariant?.image ?? product.featuredImage ?? fallbackImage)
    : (images[selectedImage] ?? product.featuredImage ?? fallbackImage);

  const handleAddToCart = async () => {
    if (!selectedVariant?.id) return;
    const snapshot: OptimisticCartLineSnapshot = {
      variantId: selectedVariant.id,
      quantity,
      productTitle: product.title,
      variantTitle:
        selectedVariant.selectedOptions
          ?.map((o) => o.value)
          .filter(Boolean)
          .join(" / ") || selectedVariant.title,
      price: selectedVariant.price?.amount ?? "0",
      currencyCode: selectedVariant.price?.currencyCode ?? "USD",
      image: selectedVariant?.image?.url ?? product.featuredImage?.url ?? product.images?.nodes?.[0]?.url ?? null,
      handle: product.handle,
    };
    await addItem(selectedVariant.id, quantity, snapshot);
  };

  const price = selectedVariant?.price ?? product.priceRange.minVariantPrice;
  const currency = price.currencyCode;

  const addToCartLabel = !selectedVariant?.availableForSale
    ? t("outOfStock")
    : isPendingAdd
      ? t("adding")
      : t("addToCart");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <BackButton />

      <div className="grid md:grid-cols-2 gap-12 mb-16">
        <div className="space-y-4">
          <div className="rounded-3xl overflow-hidden bg-muted aspect-square">
            <ImageWithFallback
              src={mainDisplayImage?.url || ""}
              alt={mainDisplayImage?.altText || product.title}
              className="w-full h-full object-cover"
            />
          </div>
          {variantImagesForThumbnails.length > 0 ? (
            <div className="flex gap-3 flex-wrap">
              {variantImagesForThumbnails.map(({ variantId, image }) => (
                <button
                  key={variantId}
                  type="button"
                  onClick={() => setSelectedVariantId(variantId)}
                  className={cn(
                    "rounded-2xl overflow-hidden aspect-square w-20 h-20 border-2 transition-all shrink-0",
                    selectedVariantId === variantId
                      ? "border-primary ring-2 ring-primary/30"
                      : "border-transparent hover:border-accent"
                  )}
                >
                  <ImageWithFallback
                    src={image.url}
                    alt={image.altText || product.title}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          ) : images.length > 1 ? (
            <div className="grid grid-cols-3 gap-4">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImage(idx)}
                  className={cn(
                    "rounded-2xl overflow-hidden aspect-square border-2 transition-all",
                    selectedImage === idx
                      ? "border-primary"
                      : "border-transparent hover:border-accent"
                  )}
                >
                  <ImageWithFallback
                    src={img.url}
                    alt={`${product.title} ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl md:text-4xl mb-3">{product.title}</h1>
            <p className="text-3xl font-semibold text-accent">
              {formatPrice(price.amount, currency, locale)}
            </p>
          </div>

          {((useRelatedProducts && relatedWithColors.length > 0) ||
            (!useRelatedProducts && uniqueColors.length > 0)) && (
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-sm text-muted-foreground">{t("color")}</span>
              <div className="flex gap-2">
                {useRelatedProducts
                  ? relatedWithColors.map(({ handle, hex, colorName }) => {
                      const isSelected = handle === product.handle;
                      return (
                        <Link
                          key={handle}
                          href={`/products/${handle}`}
                          title={colorName}
                          className={cn(
                            "w-8 h-8 rounded-full border-2 transition-all shrink-0 block",
                            isSelected
                              ? "border-primary ring-2 ring-primary/30"
                              : "border-border hover:border-accent"
                          )}
                          style={{ backgroundColor: hex }}
                        />
                      );
                    })
                  : uniqueColors.map(({ colorValue, variantId }) => {
                      const isSelected = selectedVariantId === variantId;
                      const hex =
                        colorOptionName != null
                          ? getSwatchHex(product, colorOptionName, colorValue)
                          : "#a1a1aa";
                      const selectColor = () => {
                        const otherOptions = selectedVariant.selectedOptions.filter(
                          (o) => o.name !== colorOptionName
                        );
                        const variant =
                          product.variants.nodes.find((v) => {
                            const vColor = v.selectedOptions.find(
                              (o) => o.name === colorOptionName
                            )?.value;
                            if (vColor !== colorValue) return false;
                            return otherOptions.every((opt) =>
                              v.selectedOptions.some(
                                (vo) =>
                                  vo.name === opt.name && vo.value === opt.value
                              )
                            );
                          }) ??
                          product.variants.nodes.find(
                            (v) =>
                              v.selectedOptions.find(
                                (o) => o.name === colorOptionName
                              )?.value === colorValue
                          );
                        if (variant) setSelectedVariantId(variant.id);
                      };
                      return (
                        <button
                          key={variantId}
                          type="button"
                          onClick={selectColor}
                          title={colorValue}
                          className={cn(
                            "w-8 h-8 rounded-full border-2 transition-all shrink-0",
                            isSelected
                              ? "border-primary ring-2 ring-primary/30"
                              : "border-border hover:border-accent"
                          )}
                          style={{ backgroundColor: hex }}
                        />
                      );
                    })}
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block mb-3 text-sm">{t("quantity")}</label>
              <QuantitySelector value={quantity} onChange={setQuantity} />
            </div>

            <div className="flex flex-col gap-3">
              {cartError && (
                <p className="text-sm text-destructive">{cartError}</p>
              )}
              <div className="flex gap-3">
                <Button
                  size="lg"
                  className="flex-1"
                  onClick={handleAddToCart}
                  disabled={!selectedVariant?.availableForSale || isPendingAdd}
                >
                  {addToCartLabel}
                </Button>
              </div>
            </div>
          </div>

          {product.description && (
            <div className="pt-6 border-t border-border space-y-4">
              <h3 className="font-semibold mb-2">{t("description")}</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {product.description}
              </p>
            </div>
          )}

          <div className="bg-muted rounded-2xl p-6 flex gap-4">
            <Truck className="w-6 h-6 text-accent shrink-0 mt-1" />
            <div>
              <h4 className="font-semibold mb-1">{t("freeShipping")}</h4>
              <p className="text-sm text-muted-foreground">
                {t("freeShippingText")}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 shadow-lg z-20">
        <Button
          size="lg"
          className="w-full"
          onClick={handleAddToCart}
          disabled={!selectedVariant?.availableForSale || isPendingAdd}
        >
          {!selectedVariant?.availableForSale
            ? t("outOfStock")
            : isPendingAdd
              ? t("adding")
              : `${t("addToCart")} - ${formatPrice(price.amount, currency, locale)}`}
        </Button>
      </div>
    </div>
  );
}

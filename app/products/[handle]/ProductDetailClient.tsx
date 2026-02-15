"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/design-system/Button";
import { QuantitySelector } from "@/components/design-system/QuantitySelector";
import { VariantSelector } from "@/components/design-system/VariantSelector";
import { ImageWithFallback } from "@/components/design-system/ImageWithFallback";
import { useCart } from "@/components/cart/CartProvider";
import { Truck, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ShopifyProduct } from "@/lib/shopify";

interface ProductDetailClientProps {
  product: ShopifyProduct;
}

function formatPrice(amount: string, currencyCode: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
  }).format(parseFloat(amount));
}

export function ProductDetailClient({ product }: ProductDetailClientProps) {
  const router = useRouter();
  const { addItem } = useCart();

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
  const galleryImages = images.length > 0 ? images : [{ url: "", altText: null, width: 0, height: 0 }];

  const variantOptions = product.variants.nodes.flatMap((v) =>
    v.selectedOptions
      .filter((o) => o.name && o.value)
      .map((o) => ({ name: o.name, value: o.value }))
  );
  const uniqueOptionNames = [...new Set(variantOptions.map((o) => o.name))];
  const optionsForSelector =
    uniqueOptionNames.length > 0
      ? product.variants.nodes.map((v) =>
          v.selectedOptions
            .map((o) => o.value)
            .filter(Boolean)
            .join(" / ")
        ).filter((s) => s)
      : product.variants.nodes.map((v) => v.title);

  const handleAddToCart = async () => {
    if (!selectedVariant?.id) return;
    await addItem(selectedVariant.id, quantity);
  };

  const price = selectedVariant?.price ?? product.priceRange.minVariantPrice;
  const currency = price.currencyCode;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <button
        type="button"
        onClick={() => router.back()}
        className="flex items-center gap-2 text-muted-foreground hover:text-accent transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <div className="grid md:grid-cols-2 gap-12 mb-16">
        <div className="space-y-4">
          <div className="rounded-3xl overflow-hidden bg-muted aspect-square">
            <ImageWithFallback
              src={galleryImages[selectedImage]?.url || ""}
              alt={product.title}
              className="w-full h-full object-cover"
            />
          </div>
          {galleryImages.length > 1 && (
            <div className="grid grid-cols-3 gap-4">
              {galleryImages.map((img, idx) => (
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
          )}
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl md:text-4xl mb-3">{product.title}</h1>
            <p className="text-3xl font-semibold text-accent">
              {formatPrice(price.amount, currency)}
            </p>
          </div>

          {optionsForSelector.length > 1 && (
            <VariantSelector
              label="Select variant"
              options={optionsForSelector}
              selected={
                selectedVariant
                  ? selectedVariant.selectedOptions
                      .map((o) => o.value)
                      .join(" / ") || selectedVariant.title
                  : optionsForSelector[0] ?? ""
              }
              onChange={(val) => {
                const v = product.variants.nodes.find((variant) => {
                  const str =
                    variant.selectedOptions
                      .map((o) => o.value)
                      .join(" / ") || variant.title;
                  return str === val;
                });
                if (v) setSelectedVariantId(v.id);
              }}
            />
          )}

          <div className="space-y-4">
            <div>
              <label className="block mb-3 text-sm">Quantity</label>
              <QuantitySelector value={quantity} onChange={setQuantity} />
            </div>

            <div className="flex gap-3">
              <Button
                size="lg"
                className="flex-1"
                onClick={handleAddToCart}
                disabled={!selectedVariant?.availableForSale}
              >
                {selectedVariant?.availableForSale
                  ? "Add to Cart"
                  : "Out of Stock"}
              </Button>
            </div>
          </div>

          {product.description && (
            <div className="pt-6 border-t border-border space-y-4">
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {product.description}
              </p>
            </div>
          )}

          <div className="bg-muted rounded-2xl p-6 flex gap-4">
            <Truck className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-semibold mb-1">Free Shipping</h4>
              <p className="text-sm text-muted-foreground">
                On orders over $50. Usually ships within 1-2 business days.
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
          disabled={!selectedVariant?.availableForSale}
        >
          {selectedVariant?.availableForSale
            ? `Add to Cart - ${formatPrice(price.amount, currency)}`
            : "Out of Stock"}
        </Button>
      </div>
    </div>
  );
}

"use client";

import { Link } from "@/i18n/navigation";
import { Heart } from "lucide-react";
import { useTranslations } from "next-intl";
import { useFavorites } from "@/components/favorites/FavoritesProvider";
import { cn } from "@/lib/utils";
import { ImageWithFallback } from "./ImageWithFallback";

export interface ProductCardProduct {
  id: string;
  handle: string;
  title: string;
  image: string | null;
  price: string;
  currencyCode: string;
}

interface ProductCardProps {
  product: ProductCardProduct;
  locale?: string;
  /** When false, card is display-only (no favorite control). */
  showFavorite?: boolean;
}

const PLACEHOLDER_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect fill='%23f3f4f6' width='400' height='400'/%3E%3Ctext fill='%239ca3af' font-family='sans-serif' font-size='24' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3ENo image%3C/text%3E%3C/svg%3E";

export function ProductCard({
  product,
  locale = "en",
  showFavorite = true,
}: ProductCardProps) {
  const t = useTranslations("wishlist");
  const { isFavorite, toggle } = useFavorites();
  const normalizedLocale =
    typeof locale === "string" && locale.trim().length > 0 ? locale : "en";
  const formatCurrency = (targetLocale: string) =>
    new Intl.NumberFormat(targetLocale, {
      style: "currency",
      currency: product.currencyCode,
    }).format(parseFloat(product.price));
  let priceFormatted = "";
  try {
    priceFormatted = formatCurrency(normalizedLocale);
  } catch {
    priceFormatted = formatCurrency("en");
  }

  const favorite = isFavorite(product.handle);

  const productHref = `/products/${product.handle}`;

  return (
    <div className="group bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
      <div className="aspect-square overflow-hidden bg-muted relative">
        <Link
          href={productHref}
          className="block w-full h-full"
          aria-label={product.title}
        >
          <ImageWithFallback
            src={product.image || PLACEHOLDER_IMAGE}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </Link>
        {showFavorite && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggle(product.handle);
            }}
            className={cn(
              "absolute top-2 right-2 z-10 p-2 rounded-full bg-background/90 shadow-sm border border-border/60 hover:bg-background transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            )}
            aria-pressed={favorite}
            aria-label={favorite ? t("removeFromFavorites") : t("addToFavorites")}
          >
            <Heart
              className={cn(
                "w-5 h-5 transition-colors",
                favorite ? "fill-pink-500 text-pink-500" : "text-muted-foreground"
              )}
              strokeWidth={2}
            />
          </button>
        )}
      </div>
      <Link href={productHref} className="block p-4">
        <h3 className="text-base font-semibold mb-1 line-clamp-2 min-h-10 group-hover:text-accent transition-colors">
          {product.title}
        </h3>
        <p className="text-lg font-medium text-accent/90">{priceFormatted}</p>
      </Link>
    </div>
  );
}

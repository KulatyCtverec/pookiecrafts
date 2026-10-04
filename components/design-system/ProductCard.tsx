"use client";

import { useRef, useState } from "react";
import { Link } from "@/i18n/navigation";
import { Check, Heart, Loader2, ShoppingCart } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCart } from "@/components/cart/CartProvider";
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
  /** First available variant for quick-add; null when product cannot be added. */
  variantId?: string | null;
}

interface ProductCardProps {
  product: ProductCardProduct;
  locale?: string;
  /** When false, card is display-only (no favorite control). */
  showFavorite?: boolean;
}

const PLACEHOLDER_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect fill='%23f3f4f6' width='400' height='400'/%3E%3Ctext fill='%239ca3af' font-family='sans-serif' font-size='24' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3ENo image%3C/text%3E%3C/svg%3E";

const FAVORITE_ARIA_LABELS: Record<
  string,
  { add: string; remove: string }
> = {
  en: { add: "Add to favorites", remove: "Remove from favorites" },
  de: { add: "Zu Favoriten hinzufügen", remove: "Aus Favoriten entfernen" },
  fr: { add: "Ajouter aux favoris", remove: "Retirer des favoris" },
  es: { add: "Agregar a favoritos", remove: "Quitar de favoritos" },
  cs: { add: "Přidat do oblíbených", remove: "Odebrat z oblíbených" },
};

const SUCCESS_FEEDBACK_MS = 1200;

export function ProductCard({
  product,
  locale = "en",
  showFavorite = true,
}: ProductCardProps) {
  const tCommon = useTranslations("common");
  const tProduct = useTranslations("product");
  const { addItem } = useCart();
  const { isFavorite, toggle } = useFavorites();
  const [buttonState, setButtonState] = useState<"idle" | "loading" | "success">(
    "idle"
  );
  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const normalizedLocale =
    typeof locale === "string" && locale.trim().length > 0 ? locale : "en";
  const favoriteLabels =
    FAVORITE_ARIA_LABELS[normalizedLocale] ?? FAVORITE_ARIA_LABELS.en;
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
  const variantId = product.variantId ?? null;
  const canAdd = Boolean(variantId);
  const isBusy = buttonState !== "idle";

  const productHref = `/products/${product.handle}`;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!variantId || isBusy) return;
    if (successTimerRef.current) {
      clearTimeout(successTimerRef.current);
      successTimerRef.current = null;
    }
    setButtonState("loading");
    try {
      const ok = await addItem(
        variantId,
        1,
        {
          variantId,
          quantity: 1,
          productTitle: product.title,
          variantTitle: "",
          price: product.price,
          currencyCode: product.currencyCode,
          image: product.image,
          handle: product.handle,
        },
        { openCart: false }
      );
      if (!ok) {
        setButtonState("idle");
        return;
      }
      setButtonState("success");
      successTimerRef.current = setTimeout(() => {
        setButtonState("idle");
        successTimerRef.current = null;
      }, SUCCESS_FEEDBACK_MS);
    } catch {
      setButtonState("idle");
    }
  };

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
            aria-label={favorite ? favoriteLabels.remove : favoriteLabels.add}
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
      <div className="p-4">
        <Link href={productHref} className="block">
          <h3 className="text-base font-semibold mb-1 line-clamp-2 min-h-10 group-hover:text-accent transition-colors">
            {product.title}
          </h3>
        </Link>
        <div className="flex items-center justify-between gap-3">
          <Link href={productHref} className="min-w-0">
            <p className="text-lg font-medium text-accent/90">{priceFormatted}</p>
          </Link>
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!canAdd || isBusy}
            className={cn(
              "shrink-0 w-10 h-10 rounded-full bg-muted hover:bg-accent transition-colors flex items-center justify-center",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              "disabled:opacity-40 disabled:pointer-events-none"
            )}
            aria-label={canAdd ? tCommon("addToCart") : tProduct("outOfStock")}
          >
            <span className="relative block h-5 w-5">
              <Loader2
                className={cn(
                  "absolute inset-0 h-5 w-5 transition-all duration-200",
                  buttonState === "loading"
                    ? "scale-100 opacity-100 animate-spin"
                    : "scale-75 opacity-0"
                )}
                aria-hidden
              />
              <Check
                className={cn(
                  "absolute inset-0 h-5 w-5 transition-all duration-300",
                  buttonState === "success"
                    ? "scale-100 opacity-100"
                    : "scale-50 opacity-0"
                )}
                strokeWidth={2.5}
                aria-hidden
              />
              <ShoppingCart
                className={cn(
                  "absolute inset-0 h-5 w-5 transition-all duration-300",
                  buttonState === "idle"
                    ? "scale-100 opacity-100"
                    : "scale-50 opacity-0"
                )}
                strokeWidth={2}
                aria-hidden
              />
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

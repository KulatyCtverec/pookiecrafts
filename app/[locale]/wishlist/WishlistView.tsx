"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ProductCard } from "@/components/design-system/ProductCard";
import { BackButton } from "@/components/design-system/BackButton";
import { useFavorites } from "@/components/favorites/FavoritesProvider";
import { fetchWishlistProducts, type WishlistProductDto } from "@/lib/wishlist/actions";

export function WishlistView() {
  const t = useTranslations("wishlist");
  const locale = useLocale();
  const { isHydrated, handles, removeHandles } = useFavorites();
  const [products, setProducts] = useState<WishlistProductDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const handlesKey = useMemo(() => handles.join("\0"), [handles]);

  useEffect(() => {
    if (handles.length === 0) {
      setProducts([]);
      setLoadError(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setLoadError(false);

    fetchWishlistProducts(handles, locale)
      .then((rows) => {
        if (cancelled) return;
        const found = new Set(rows.map((r) => r.handle));
        const missing = handles.filter((h) => !found.has(h));
        if (missing.length > 0) {
          removeHandles(missing);
        }
        setProducts(rows);
      })
      .catch(() => {
        if (!cancelled) {
          setLoadError(true);
          setProducts([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [handlesKey, locale, removeHandles]);

  if (!isHydrated) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <BackButton />
        <p className="text-center text-muted-foreground py-12">{t("loading")}</p>
      </div>
    );
  }

  if (handles.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <BackButton />
        <div className="text-center py-16 max-w-md mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{t("title")}</h1>
          <p className="text-muted-foreground text-lg mb-8">{t("empty")}</p>
          <Link
            href="/collections"
            className="inline-flex items-center justify-center rounded-full px-6 py-3 bg-accent text-accent-foreground font-medium hover:opacity-90 transition-opacity"
          >
            {t("browseShop")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <BackButton />
      <div className="mb-12 text-center md:text-left">
        <h1 className="text-4xl md:text-5xl font-bold mb-2">{t("title")}</h1>
        {!loading && (
          <p className="text-muted-foreground text-lg">
            {t("productCountLine", { count: products.length })}
          </p>
        )}
      </div>

      {loadError && (
        <p className="text-center text-destructive mb-8" role="alert">
          {t("loadError")}
        </p>
      )}

      {loading && !loadError && (
        <p className="text-center text-muted-foreground py-12">{t("loading")}</p>
      )}

      {!loading && !loadError && products.length === 0 && handles.length > 0 && (
        <p className="text-center text-muted-foreground py-12">{t("empty")}</p>
      )}

      {!loading && products.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              locale={locale}
            />
          ))}
        </div>
      )}
    </div>
  );
}

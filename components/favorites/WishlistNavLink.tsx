"use client";

import { Heart } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useFavorites } from "@/components/favorites/FavoritesProvider";

export function WishlistNavLink() {
  const t = useTranslations("nav");
  const { isHydrated, count } = useFavorites();

  return (
    <Link
      href="/wishlist"
      className="relative p-2 hover:bg-muted rounded-full transition-colors"
      aria-label={t("openWishlist")}
    >
      <Heart className="w-6 h-6" strokeWidth={2} />
      {isHydrated && count > 0 && (
        <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-accent text-accent-foreground rounded-full flex items-center justify-center text-xs font-semibold tabular-nums">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </Link>
  );
}

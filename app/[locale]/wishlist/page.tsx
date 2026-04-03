import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { WishlistView } from "./WishlistView";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "wishlist" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default function WishlistPage() {
  return <WishlistView />;
}

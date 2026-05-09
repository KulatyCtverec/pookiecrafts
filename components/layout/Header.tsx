import { getNavCollections } from "@/lib/shopify/client";
import { HeaderClient } from "@/components/layout/HeaderClient";

export async function Header({ locale }: { locale: string }) {
  const collectionLinks = await getNavCollections(locale);
  return <HeaderClient collectionLinks={collectionLinks} locale={locale} />;
}

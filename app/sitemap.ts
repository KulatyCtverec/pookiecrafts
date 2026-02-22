import type { MetadataRoute } from "next";
import { locales, defaultLocale } from "@/lib/i18n/config";
import { getCollectionHandles, getProductHandles } from "@/lib/shopify";
import { buildUrl } from "@/lib/seo";

export const revalidate = 3600;

type Locale = (typeof locales)[number];

function buildLanguageAlternates(pathname: string): Record<string, string> {
  return locales.reduce<Record<string, string>>((acc, locale) => {
    acc[locale] = buildUrl(`/${locale}${pathname}`);
    return acc;
  }, {});
}

function buildLocalizedEntries(
  pathname: string,
  lastModified?: string
): MetadataRoute.Sitemap {
  const alternates = buildLanguageAlternates(pathname);
  return locales.map((locale) => ({
    url: buildUrl(`/${locale}${pathname}`),
    lastModified,
    alternates: { languages: alternates },
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPaths = ["/", "/about", "/faq", "/contact", "/returns"];
  const staticEntries = staticPaths.flatMap((path) =>
    buildLocalizedEntries(path === "/" ? "" : path)
  );

  const collectionHandles = await getCollectionHandles(defaultLocale);
  const collectionEntries = collectionHandles.flatMap((collection) =>
    buildLocalizedEntries(`/collections/${collection.handle}`, collection.updatedAt)
  );

  const productHandles = await getProductHandles(defaultLocale);
  const productEntries = productHandles.flatMap((product) =>
    buildLocalizedEntries(`/products/${product.handle}`, product.updatedAt)
  );

  return [...staticEntries, ...collectionEntries, ...productEntries];
}


import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { ImageWithFallback } from "@/components/design-system/ImageWithFallback";
import { getCollections } from "@/lib/shopify";
import { getTranslations } from "next-intl/server";
import { locales } from "@/lib/i18n/config";
import { buildUrl } from "@/lib/seo";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "collections" });
  const url = buildUrl(`/${locale}/collections`);
  const alternates = locales.reduce<Record<string, string>>((acc, lang) => {
    acc[lang] = buildUrl(`/${lang}/collections`);
    return acc;
  }, {});

  return {
    title: t("title"),
    description: t("subtitle"),
    alternates: {
      canonical: url,
      languages: alternates,
    },
    openGraph: {
      title: t("title"),
      description: t("subtitle"),
      url,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("subtitle"),
    },
  };
}

export default async function CollectionsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("collections");
  const collections = await getCollections(locale);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl mb-4">{t("title")}</h1>
        <p className="text-muted-foreground text-lg">{t("subtitle")}</p>
      </div>

      {collections.length === 0 ? (
        <p className="text-center text-muted-foreground">{t("noCollections")}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map((collection) => (
            <Link
              key={collection.id}
              href={`/collections/${collection.handle}`}
              className="group block bg-card rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <div className="aspect-4/5 overflow-hidden bg-muted relative">
                <ImageWithFallback
                  src={collection.image?.url ?? ""}
                  alt={collection.image?.altText ?? collection.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {!collection.image && (
                  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground p-4">
                    {collection.title}
                  </div>
                )}
              </div>
              <div className="p-5 text-center">
                <span className="text-lg font-semibold group-hover:text-accent transition-colors">
                  {collection.title}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}


import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCollectionByHandle, getCollectionHandles } from "@/lib/shopify";
import { ProductCard } from "@/components/design-system/ProductCard";
import { BackButton } from "@/components/design-system/BackButton";
import { getTranslations } from "next-intl/server";
import { locales, defaultLocale } from "@/lib/i18n/config";
import { buildUrl } from "@/lib/seo";

interface CollectionPageProps {
  params: Promise<{ handle: string; locale: string }>;
}

export const revalidate = 300;

const STATIC_PREGENERATE_LIMIT = Number(
  process.env.STATIC_PREGENERATE_LIMIT ?? "40"
);

function buildLanguageAlternates(handle: string): Record<string, string> {
  return locales.reduce<Record<string, string>>((acc, locale) => {
    acc[locale] = buildUrl(`/${locale}/collections/${handle}`);
    return acc;
  }, {});
}

export async function generateStaticParams() {
  const handles = await getCollectionHandles(defaultLocale, STATIC_PREGENERATE_LIMIT);
  return locales.flatMap((locale) =>
    handles.map((collection) => ({ locale, handle: collection.handle }))
  );
}

export async function generateMetadata({
  params,
}: CollectionPageProps): Promise<Metadata> {
  const { handle, locale } = await params;
  const collection = await getCollectionByHandle(handle, locale);
  if (!collection) {
    return {
      title: "Collection not found",
      robots: { index: false, follow: false },
    };
  }

  const title = collection.seo?.title || collection.title;
  const description = collection.seo?.description || collection.description || "";
  const url = buildUrl(`/${locale}/collections/${handle}`);
  const images = collection.image
    ? [
        {
          url: collection.image.url,
          alt: collection.image.altText ?? collection.title,
          width: collection.image.width,
          height: collection.image.height,
        },
      ]
    : undefined;

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: buildLanguageAlternates(handle),
    },
    openGraph: {
      title,
      description,
      url,
      type: "website",
      images,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: images?.map((img) => img.url),
    },
  };
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { handle, locale } = await params;
  const t = await getTranslations("collections");
  const collection = await getCollectionByHandle(handle, locale);

  if (!collection) {
    notFound();
  }

  const products = collection.products.nodes.map((p) => ({
    id: p.id,
    handle: p.handle,
    title: p.title,
    image: p.featuredImage?.url ?? null,
    price: p.priceRange.minVariantPrice.amount,
    currencyCode: p.priceRange.minVariantPrice.currencyCode,
  }));

  const collectionUrl = buildUrl(`/${locale}/collections/${collection.handle}`);
  const jsonLdCollection = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: collection.title,
    itemListElement: products.slice(0, 20).map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: product.title,
      url: buildUrl(`/${locale}/products/${product.handle}`),
    })),
  };

  const jsonLdBreadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: buildUrl(`/${locale}`),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: collection.title,
        item: collectionUrl,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLdCollection).replace(/</g, "\\u003c"),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLdBreadcrumbs).replace(/</g, "\\u003c"),
        }}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <BackButton />
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl mb-4">{collection.title}</h1>
          <p className="text-muted-foreground text-lg">
            {t("exploreCollection", {
              name: collection.title.toLowerCase(),
            })}
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              locale={locale}
            />
          ))}
        </div>
        <div className="text-center text-muted-foreground">
          {t("showing")} {products.length}{" "}
          {t("productCount", { count: products.length })}
        </div>
      </div>
    </>
  );
}

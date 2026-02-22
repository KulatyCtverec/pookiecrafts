import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductByHandle, getProductsByType, getProductHandles } from "@/lib/shopify";
import { ProductDetailClient } from "./ProductDetailClient";
import { locales, defaultLocale } from "@/lib/i18n/config";
import { buildUrl } from "@/lib/seo";

interface ProductPageProps {
  params: Promise<{ handle: string; locale: string }>;
}

export const revalidate = 300;

const STATIC_PREGENERATE_LIMIT = Number(
  process.env.STATIC_PREGENERATE_LIMIT ?? "40"
);

function buildLanguageAlternates(handle: string): Record<string, string> {
  return locales.reduce<Record<string, string>>((acc, locale) => {
    acc[locale] = buildUrl(`/${locale}/products/${handle}`);
    return acc;
  }, {});
}

export async function generateStaticParams() {
  const handles = await getProductHandles(defaultLocale, STATIC_PREGENERATE_LIMIT);
  return locales.flatMap((locale) =>
    handles.map((product) => ({ locale, handle: product.handle }))
  );
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { handle, locale } = await params;
  const product = await getProductByHandle(handle, locale);
  if (!product) {
    return {
      title: "Product not found",
      robots: { index: false, follow: false },
    };
  }

  const title = product.seo?.title || product.title;
  const description = product.seo?.description || product.description;
  const url = buildUrl(`/${locale}/products/${handle}`);
  const images = product.featuredImage
    ? [
        {
          url: product.featuredImage.url,
          alt: product.featuredImage.altText ?? product.title,
          width: product.featuredImage.width,
          height: product.featuredImage.height,
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

export default async function ProductPage({ params }: ProductPageProps) {
  const { handle, locale } = await params;
  const product = await getProductByHandle(handle, locale);

  if (!product) {
    notFound();
  }

  const relatedByType =
    product.productType && product.productType.trim()
      ? await getProductsByType(product.productType, locale)
      : [];

  const productUrl = buildUrl(`/${locale}/products/${product.handle}`);
  const availability = product.variants.nodes.some((v) => v.availableForSale)
    ? "https://schema.org/InStock"
    : "https://schema.org/OutOfStock";
  const price = product.priceRange.minVariantPrice.amount;
  const currency = product.priceRange.minVariantPrice.currencyCode;
  const imageUrls = [
    product.featuredImage?.url,
    ...product.images.nodes.map((img) => img.url),
  ].filter(Boolean) as string[];

  const jsonLdProduct = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description,
    image: imageUrls,
    brand: product.vendor ? { "@type": "Brand", name: product.vendor } : undefined,
    offers: {
      "@type": "Offer",
      url: productUrl,
      priceCurrency: currency,
      price,
      availability,
    },
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
        name: product.title,
        item: productUrl,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLdProduct).replace(/</g, "\\u003c"),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLdBreadcrumbs).replace(/</g, "\\u003c"),
        }}
      />
      <ProductDetailClient
        product={product}
        relatedProductsByType={relatedByType}
        locale={locale}
      />
    </>
  );
}

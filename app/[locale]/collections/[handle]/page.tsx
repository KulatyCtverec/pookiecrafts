import { notFound } from "next/navigation";
import { getCollectionByHandle } from "@/lib/shopify";
import { ProductCard } from "@/components/design-system/ProductCard";
import { BackButton } from "@/components/design-system/BackButton";
import { getTranslations } from "next-intl/server";

interface CollectionPageProps {
  params: Promise<{ handle: string; locale: string }>;
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

  return (
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
  );
}

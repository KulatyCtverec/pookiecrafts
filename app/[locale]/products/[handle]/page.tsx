import { notFound } from "next/navigation";
import { getProductByHandle, getProductsByType } from "@/lib/shopify";
import { ProductDetailClient } from "./ProductDetailClient";

interface ProductPageProps {
  params: Promise<{ handle: string; locale: string }>;
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

  return (
    <ProductDetailClient
      product={product}
      relatedProductsByType={relatedByType}
      locale={locale}
    />
  );
}

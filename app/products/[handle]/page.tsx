import { notFound } from "next/navigation";
import { getProductByHandle } from "@/lib/shopify";
import { ProductDetailClient } from "./ProductDetailClient";

interface ProductPageProps {
  params: Promise<{ handle: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { handle } = await params;
  const product = await getProductByHandle(handle);

  if (!product) {
    notFound();
  }

  return <ProductDetailClient product={product} />;
}

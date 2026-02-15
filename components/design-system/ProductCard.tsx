import Link from "next/link";
import { ImageWithFallback } from "./ImageWithFallback";

export interface ProductCardProduct {
  id: string;
  handle: string;
  title: string;
  image: string | null;
  price: string;
  currencyCode: string;
}

interface ProductCardProps {
  product: ProductCardProduct;
}

export function ProductCard({ product }: ProductCardProps) {
  const priceFormatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: product.currencyCode,
  }).format(parseFloat(product.price));

  return (
    <Link
      href={`/products/${product.handle}`}
      className="group block bg-card rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
    >
      <div className="aspect-square overflow-hidden bg-muted relative">
        <ImageWithFallback
          src={product.image || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect fill='%23f3f4f6' width='400' height='400'/%3E%3Ctext fill='%239ca3af' font-family='sans-serif' font-size='24' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3ENo image%3C/text%3E%3C/svg%3E"}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-5">
        <h3 className="text-lg font-semibold mb-1 group-hover:text-accent transition-colors">
          {product.title}
        </h3>
        <p className="text-xl font-semibold text-accent">{priceFormatted}</p>
      </div>
    </Link>
  );
}

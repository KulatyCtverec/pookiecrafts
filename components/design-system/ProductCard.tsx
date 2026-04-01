import { Link } from "@/i18n/navigation";
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
  locale?: string;
}

export function ProductCard({ product, locale = "en" }: ProductCardProps) {
  const normalizedLocale =
    typeof locale === "string" && locale.trim().length > 0 ? locale : "en";
  const formatCurrency = (targetLocale: string) =>
    new Intl.NumberFormat(targetLocale, {
      style: "currency",
      currency: product.currencyCode,
    }).format(parseFloat(product.price));
  let priceFormatted = "";
  try {
    priceFormatted = formatCurrency(normalizedLocale);
  } catch {
    priceFormatted = formatCurrency("en");
  }

  return (
    <Link
      href={`/products/${product.handle}`}
      className="group block bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
    >
      <div className="aspect-square overflow-hidden bg-muted relative">
        <ImageWithFallback
          src={product.image || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect fill='%23f3f4f6' width='400' height='400'/%3E%3Ctext fill='%239ca3af' font-family='sans-serif' font-size='24' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3ENo image%3C/text%3E%3C/svg%3E"}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-4">
        <h3 className="text-base font-semibold mb-1 line-clamp-2 min-h-10 group-hover:text-accent transition-colors">
          {product.title}
        </h3>
        <p className="text-lg font-medium text-accent/90">{priceFormatted}</p>
      </div>
    </Link>
  );
}

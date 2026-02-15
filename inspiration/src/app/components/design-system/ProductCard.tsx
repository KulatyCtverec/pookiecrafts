import { Link } from 'react-router';
import { Badge } from './Badge';
import { ImageWithFallback } from '../figma/ImageWithFallback';

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  badges?: Array<'handmade' | 'bestseller' | 'limited'>;
  category: 'candles' | 'notebooks';
}

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link 
      to={`/product/${product.id}`}
      className="group block bg-card rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
    >
      <div className="aspect-square overflow-hidden bg-muted relative">
        <ImageWithFallback 
          src={product.image} 
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {product.badges && product.badges.length > 0 && (
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.badges.map((badge) => (
              <Badge key={badge} variant={badge} />
            ))}
          </div>
        )}
      </div>
      <div className="p-5">
        <h3 className="text-lg font-semibold mb-1 group-hover:text-accent transition-colors">
          {product.name}
        </h3>
        <p className="text-xl font-semibold text-accent">
          ${product.price.toFixed(2)}
        </p>
      </div>
    </Link>
  );
}

import { useState } from 'react';
import { useParams } from 'react-router';
import { ProductCard } from '../components/design-system/ProductCard';
import { products, getProductsByCategory } from '../data/products';
import { cn } from '../components/ui/utils';

export function Shop() {
  const { category } = useParams<{ category?: string }>();
  const [activeFilter, setActiveFilter] = useState<string | null>(
    category === 'candles' || category === 'notebooks' ? category : null
  );
  
  const filters = [
    { label: 'All Products', value: null },
    { label: 'Candles', value: 'candles' },
    { label: 'Notebooks', value: 'notebooks' },
  ];
  
  const filteredProducts = activeFilter
    ? getProductsByCategory(activeFilter as 'candles' | 'notebooks')
    : products;
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl mb-4">Shop</h1>
        <p className="text-muted-foreground text-lg">
          Explore our handmade collection
        </p>
      </div>
      
      {/* Filter Chips */}
      <div className="flex flex-wrap gap-3 mb-12">
        {filters.map((filter) => (
          <button
            key={filter.label}
            onClick={() => setActiveFilter(filter.value)}
            className={cn(
              'px-6 py-3 rounded-full font-medium transition-all duration-200',
              activeFilter === filter.value
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'bg-card border border-border hover:border-accent hover:bg-muted'
            )}
          >
            {filter.label}
          </button>
        ))}
      </div>
      
      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      
      {/* Results count */}
      <div className="text-center text-muted-foreground">
        Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
      </div>
    </div>
  );
}

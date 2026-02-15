import { Product } from '../components/design-system/ProductCard';

export const products: Product[] = [
  // Candles
  {
    id: '1',
    name: 'Lavender Dreams Candle',
    price: 24.99,
    image: 'https://images.unsplash.com/photo-1758356345661-49276f7b3100?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYXZlbmRlciUyMGNhbmRsZSUyMGFlc3RoZXRpY3xlbnwxfHx8fDE3NzExNzQzNDV8MA&ixlib=rb-4.1.0&q=80&w=1080',
    badges: ['handmade', 'bestseller'],
    category: 'candles',
  },
  {
    id: '2',
    name: 'Vanilla Bliss Candle',
    price: 22.99,
    image: 'https://images.unsplash.com/photo-1571346278539-4ba0417a0ef2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2YW5pbGxhJTIwY2FuZGxlJTIwZ2xhc3MlMjBqYXJ8ZW58MXx8fHwxNzcxMTc0MzQ1fDA&ixlib=rb-4.1.0&q=80&w=1080',
    badges: ['handmade'],
    category: 'candles',
  },
  {
    id: '3',
    name: 'Rose Garden Candle',
    price: 26.99,
    image: 'https://images.unsplash.com/photo-1748326043529-e44ef7a4d386?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyb3NlJTIwc2NlbnRlZCUyMGNhbmRsZXxlbnwxfHx8fDE3NzExMTAzNTR8MA&ixlib=rb-4.1.0&q=80&w=1080',
    badges: ['handmade', 'limited'],
    category: 'candles',
  },
  {
    id: '4',
    name: 'Sweet Pea Candle',
    price: 23.99,
    image: 'https://images.unsplash.com/photo-1590393802688-ab3fd7c186f2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzY2VudGVkJTIwY2FuZGxlJTIwcGFzdGVsJTIwcGlua3xlbnwxfHx8fDE3NzExNzQzNDR8MA&ixlib=rb-4.1.0&q=80&w=1080',
    badges: ['handmade', 'bestseller'],
    category: 'candles',
  },
  
  // Notebooks
  {
    id: '5',
    name: 'Handmade Leather Journal',
    price: 34.99,
    image: 'https://images.unsplash.com/photo-1663809087021-21bdd11cad36?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsZWF0aGVyJTIwYm91bmQlMjBub3RlYm9va3xlbnwxfHx8fDE3NzEwNzczNjJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    badges: ['handmade', 'bestseller'],
    category: 'notebooks',
  },
  {
    id: '6',
    name: 'Artisan Notebook',
    price: 28.99,
    image: 'https://images.unsplash.com/photo-1610089219287-eca286034d53?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYW5kbWFkZSUyMG5vdGVib29rJTIwam91cm5hbHxlbnwxfHx8fDE3NzExNzQzNDV8MA&ixlib=rb-4.1.0&q=80&w=1080',
    badges: ['handmade'],
    category: 'notebooks',
  },
  {
    id: '7',
    name: 'Dotted Bullet Journal',
    price: 29.99,
    image: 'https://images.unsplash.com/photo-1742137745499-34954ce3f1bc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidWxsZXQlMjBqb3VybmFsJTIwYWVzdGhldGljfGVufDF8fHx8MTc3MTE3NDM0Nnww&ixlib=rb-4.1.0&q=80&w=1080',
    badges: ['handmade', 'bestseller'],
    category: 'notebooks',
  },
  {
    id: '8',
    name: 'Pink Dream Notebook',
    price: 26.99,
    image: 'https://images.unsplash.com/photo-1568639152391-61b4303bead7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaW5rJTIwbm90ZWJvb2slMjBzdGF0aW9uZXJ5fGVufDF8fHx8MTc3MTE3NDM0Nnww&ixlib=rb-4.1.0&q=80&w=1080',
    badges: ['handmade', 'limited'],
    category: 'notebooks',
  },
];

export const getProductById = (id: string): Product | undefined => {
  return products.find(p => p.id === id);
};

export const getProductsByCategory = (category: 'candles' | 'notebooks'): Product[] => {
  return products.filter(p => p.category === category);
};

export const getBestsellers = (): Product[] => {
  return products.filter(p => p.badges?.includes('bestseller'));
};

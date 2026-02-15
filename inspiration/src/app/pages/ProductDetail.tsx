import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { getProductById } from '../data/products';
import { Button } from '../components/design-system/Button';
import { QuantitySelector } from '../components/design-system/QuantitySelector';
import { VariantSelector } from '../components/design-system/VariantSelector';
import { Badge } from '../components/design-system/Badge';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { useCartStore } from '../store/cartStore';
import { Truck, Heart, ArrowLeft } from 'lucide-react';

export function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const product = id ? getProductById(id) : undefined;
  const addItem = useCartStore(state => state.addItem);
  
  const [selectedVariant, setSelectedVariant] = useState('Default');
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  
  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <h1 className="text-3xl mb-4">Product Not Found</h1>
        <Button asChild>
          <Link to="/shop">Back to Shop</Link>
        </Button>
      </div>
    );
  }
  
  const variants = product.category === 'candles' 
    ? ['Small', 'Medium', 'Large']
    : ['Lined', 'Dotted', 'Blank'];
  
  const galleryImages = [product.image, product.image, product.image];
  
  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      variant: selectedVariant,
    });
  };
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-muted-foreground hover:text-accent transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>
      
      <div className="grid md:grid-cols-2 gap-12 mb-16">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="rounded-3xl overflow-hidden bg-muted aspect-square">
            <ImageWithFallback 
              src={galleryImages[selectedImage]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            {galleryImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(idx)}
                className={cn(
                  'rounded-2xl overflow-hidden aspect-square border-2 transition-all',
                  selectedImage === idx ? 'border-primary' : 'border-transparent hover:border-accent'
                )}
              >
                <ImageWithFallback 
                  src={img}
                  alt={`${product.name} ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
        
        {/* Product Info */}
        <div className="space-y-6">
          {/* Badges */}
          {product.badges && product.badges.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {product.badges.map((badge) => (
                <Badge key={badge} variant={badge} />
              ))}
            </div>
          )}
          
          {/* Title & Price */}
          <div>
            <h1 className="text-3xl md:text-4xl mb-3">{product.name}</h1>
            <p className="text-3xl font-semibold text-accent">${product.price.toFixed(2)}</p>
          </div>
          
          {/* Variant Selector */}
          <VariantSelector 
            label="Select Size/Type"
            options={variants}
            selected={selectedVariant}
            onChange={setSelectedVariant}
          />
          
          {/* Quantity & Add to Cart */}
          <div className="space-y-4">
            <div>
              <label className="block mb-3 text-sm">Quantity</label>
              <QuantitySelector 
                value={quantity}
                onChange={setQuantity}
              />
            </div>
            
            <div className="flex gap-3">
              <Button 
                size="lg" 
                className="flex-1"
                onClick={handleAddToCart}
              >
                Add to Cart
              </Button>
              <button className="w-14 h-14 rounded-full border-2 border-border hover:border-accent hover:bg-muted transition-all flex items-center justify-center">
                <Heart className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* Description */}
          <div className="pt-6 border-t border-border space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground">
                {product.category === 'candles' 
                  ? 'Hand-poured with 100% natural soy wax and premium fragrance oils. Our candles are crafted in small batches to ensure the highest quality. Each candle provides approximately 40-50 hours of burn time.'
                  : 'Handmade with premium quality paper and durable binding. Perfect for journaling, sketching, or note-taking. Each notebook contains 120 pages of smooth, high-quality paper that resists bleed-through.'
                }
              </p>
            </div>
          </div>
          
          {/* Shipping Info */}
          <div className="bg-muted rounded-2xl p-6 flex gap-4">
            <Truck className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-semibold mb-1">Free Shipping</h4>
              <p className="text-sm text-muted-foreground">
                On orders over $50. Usually ships within 1-2 business days.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Fixed Mobile CTA */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 shadow-lg z-20">
        <Button 
          size="lg" 
          className="w-full"
          onClick={handleAddToCart}
        >
          Add to Cart - ${product.price.toFixed(2)}
        </Button>
      </div>
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

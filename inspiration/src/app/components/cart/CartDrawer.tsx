import { X, Minus, Plus } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { Button } from '../design-system/Button';
import { ImageWithFallback } from '../figma/ImageWithFallback';

export function CartDrawer() {
  const { items, isOpen, closeCart, updateQuantity, removeItem, getTotalPrice } = useCartStore();
  
  if (!isOpen) return null;
  
  const total = getTotalPrice();
  
  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/20 z-40 backdrop-blur-sm"
        onClick={closeCart}
      />
      
      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-card shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-2xl">Your Cart</h2>
          <button
            onClick={closeCart}
            className="w-10 h-10 rounded-full hover:bg-muted flex items-center justify-center transition-colors"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">Your cart is empty</p>
              <Button onClick={closeCart}>Continue Shopping</Button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={`${item.id}-${item.variant}`} className="flex gap-4 bg-background rounded-2xl p-4">
                  <ImageWithFallback 
                    src={item.image} 
                    alt={item.name}
                    className="w-20 h-20 rounded-xl object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{item.name}</h3>
                    {item.variant && (
                      <p className="text-sm text-muted-foreground">{item.variant}</p>
                    )}
                    <p className="text-accent font-semibold mt-1">${item.price.toFixed(2)}</p>
                    
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center gap-2 bg-card border border-border rounded-full px-2 py-1">
                        <button
                          onClick={() => updateQuantity(`${item.id}-${item.variant}`, item.quantity - 1)}
                          className="w-6 h-6 rounded-full hover:bg-muted transition-colors flex items-center justify-center"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center text-sm">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(`${item.id}-${item.variant}`, item.quantity + 1)}
                          className="w-6 h-6 rounded-full hover:bg-muted transition-colors flex items-center justify-center"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(`${item.id}-${item.variant}`)}
                        className="text-sm text-muted-foreground hover:text-destructive transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-border p-6 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-lg">Subtotal</span>
              <span className="text-2xl font-semibold text-accent">${total.toFixed(2)}</span>
            </div>
            <Button size="lg" className="w-full">
              Checkout
            </Button>
            <button 
              onClick={closeCart}
              className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
}

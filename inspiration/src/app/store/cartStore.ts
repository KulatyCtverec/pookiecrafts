import { create } from 'zustand';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  variant?: string;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  isOpen: false,
  
  addItem: (item) => {
    const existingItem = get().items.find(i => i.id === item.id && i.variant === item.variant);
    
    if (existingItem) {
      set({
        items: get().items.map(i => 
          i.id === item.id && i.variant === item.variant
            ? { ...i, quantity: i.quantity + 1 }
            : i
        )
      });
    } else {
      set({ items: [...get().items, { ...item, quantity: 1 }] });
    }
    
    get().openCart();
  },
  
  removeItem: (id) => {
    set({ items: get().items.filter(item => item.id !== id) });
  },
  
  updateQuantity: (id, quantity) => {
    if (quantity <= 0) {
      get().removeItem(id);
    } else {
      set({
        items: get().items.map(item =>
          item.id === id ? { ...item, quantity } : item
        )
      });
    }
  },
  
  clearCart: () => {
    set({ items: [] });
  },
  
  toggleCart: () => {
    set({ isOpen: !get().isOpen });
  },
  
  openCart: () => {
    set({ isOpen: true });
  },
  
  closeCart: () => {
    set({ isOpen: false });
  },
  
  getTotalItems: () => {
    return get().items.reduce((total, item) => total + item.quantity, 0);
  },
  
  getTotalPrice: () => {
    return get().items.reduce((total, item) => total + (item.price * item.quantity), 0);
  },
}));

"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  createCart,
  getCart,
  addToCart,
  updateCartLine,
  removeCartLine,
} from "@/lib/shopify";
import type { ShopifyCart, ShopifyCartLine } from "@/lib/shopify";

const CART_ID_KEY = "pookiecrafts-cart-id";

interface CartContextValue {
  cart: ShopifyCart | null;
  isLoading: boolean;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (variantId: string, quantity?: number) => Promise<void>;
  updateQuantity: (lineId: string, quantity: number) => Promise<void>;
  removeLine: (lineId: string) => Promise<void>;
}

const CartContext = createContext<CartContextValue | null>(null);

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within CartProvider");
  }
  return ctx;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<ShopifyCart | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  const loadCart = useCallback(async (cartId: string) => {
    try {
      const c = await getCart(cartId);
      if (c) {
        setCart(c);
        return;
      }
    } catch {
      // Cart may be invalid
    }
    if (typeof window !== "undefined") {
      localStorage.removeItem(CART_ID_KEY);
    }
    setCart(null);
  }, []);

  const ensureCart = useCallback(async (): Promise<string | null> => {
    if (typeof window === "undefined") return null;
    const stored = localStorage.getItem(CART_ID_KEY);
    if (stored) {
      const c = await getCart(stored);
      if (c) {
        setCart(c);
        return stored;
      }
      localStorage.removeItem(CART_ID_KEY);
    }
    const newCart = await createCart();
    if (newCart) {
      localStorage.setItem(CART_ID_KEY, newCart.id);
      setCart(newCart);
      return newCart.id;
    }
    return null;
  }, []);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem(CART_ID_KEY) : null;
    if (stored) {
      loadCart(stored).finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [loadCart]);

  const addItem = useCallback(
    async (variantId: string, quantity: number = 1) => {
      const cartId = await ensureCart();
      if (!cartId) return;
      const c = await addToCart(cartId, variantId, quantity);
      if (c) {
        setCart(c);
        setIsOpen(true);
      }
    },
    [ensureCart]
  );

  const updateQuantity = useCallback(
    async (lineId: string, quantity: number) => {
      if (!cart?.id) return;
      if (quantity <= 0) {
        const c = await removeCartLine(cart.id, lineId);
        if (c) setCart(c);
        return;
      }
      const c = await updateCartLine(cart.id, lineId, quantity);
      if (c) setCart(c);
    },
    [cart?.id]
  );

  const removeLine = useCallback(
    async (lineId: string) => {
      if (!cart?.id) return;
      const c = await removeCartLine(cart.id, lineId);
      if (c) setCart(c);
    },
    [cart?.id]
  );

  const value = useMemo<CartContextValue>(
    () => ({
      cart,
      isLoading,
      isOpen,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      addItem,
      updateQuantity,
      removeLine,
    }),
    [cart, isLoading, isOpen, addItem, updateQuantity, removeLine]
  );

  return (
    <CartContext.Provider value={value}>{children}</CartContext.Provider>
  );
}

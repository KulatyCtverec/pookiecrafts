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
  /** Chybová zpráva z cart operací (create/add/update/remove). */
  cartError: string | null;
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
  const [cartError, setCartError] = useState<string | null>(null);

  const loadCart = useCallback(async (cartId: string) => {
    try {
      const c = await getCart(cartId);
      if (c) {
        setCart(c);
        setCartError(null);
        return;
      }
    } catch {
      // Cart may be invalid or API error
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
      try {
        const c = await getCart(stored);
        if (c) {
          setCart(c);
          setCartError(null);
          return stored;
        }
      } catch {
        // Invalid or expired cart
      }
      localStorage.removeItem(CART_ID_KEY);
    }
    try {
      const newCart = await createCart();
      localStorage.setItem(CART_ID_KEY, newCart.id);
      setCart(newCart);
      setCartError(null);
      return newCart.id;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to create cart";
      setCartError(msg);
      return null;
    }
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
      setCartError(null);
      const cartId = await ensureCart();
      if (!cartId) return;
      try {
        const c = await addToCart(cartId, variantId, quantity);
        setCart(c);
        setIsOpen(true);
      } catch (e) {
        setCartError(e instanceof Error ? e.message : "Failed to add to cart");
      }
    },
    [ensureCart]
  );

  const updateQuantity = useCallback(
    async (lineId: string, quantity: number) => {
      if (!cart?.id) return;
      setCartError(null);
      try {
        if (quantity <= 0) {
          const c = await removeCartLine(cart.id, lineId);
          setCart(c);
        } else {
          const c = await updateCartLine(cart.id, lineId, quantity);
          setCart(c);
        }
      } catch (e) {
        setCartError(
          e instanceof Error ? e.message : "Failed to update cart"
        );
      }
    },
    [cart?.id]
  );

  const removeLine = useCallback(
    async (lineId: string) => {
      if (!cart?.id) return;
      setCartError(null);
      try {
        const c = await removeCartLine(cart.id, lineId);
        setCart(c);
      } catch (e) {
        setCartError(
          e instanceof Error ? e.message : "Failed to remove from cart"
        );
      }
    },
    [cart?.id]
  );

  const value = useMemo<CartContextValue>(
    () => ({
      cart,
      isLoading,
      isOpen,
      cartError,
      openCart: () => setIsOpen(true),
      closeCart: () => {
        setIsOpen(false);
        setCartError(null);
      },
      addItem,
      updateQuantity,
      removeLine,
    }),
    [cart, isLoading, isOpen, cartError, addItem, updateQuantity, removeLine]
  );

  return (
    <CartContext.Provider value={value}>{children}</CartContext.Provider>
  );
}

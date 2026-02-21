"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  createCart,
  getCart,
  addToCart,
  updateCartLine,
  removeCartLine,
} from "@/lib/shopify/cart-client";
import type { ShopifyCart, ShopifyCartLine } from "@/lib/shopify";

const CART_ID_KEY = "pookiecrafts-cart-id";

/** Snapshot for rendering an optimistic cart line before API responds. */
export interface OptimisticCartLineSnapshot {
  variantId: string;
  quantity: number;
  productTitle: string;
  variantTitle: string;
  price: string;
  currencyCode: string;
  image: string | null;
  handle: string;
}

interface CartContextValue {
  cart: ShopifyCart | null;
  /** Lines added optimistically (not yet confirmed by API). */
  optimisticLines: OptimisticCartLineSnapshot[];
  isLoading: boolean;
  isOpen: boolean;
  isPendingAdd: boolean;
  isLinePending: (lineId: string) => boolean;
  /** Chybová zpráva z cart operací (create/add/update/remove). */
  cartError: string | null;
  openCart: () => void;
  closeCart: () => void;
  addItem: (
    variantId: string,
    quantity?: number,
    optimisticSnapshot?: OptimisticCartLineSnapshot
  ) => Promise<void>;
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

const DEBOUNCE_MS = 400;

export function CartProvider({
  children,
  locale,
}: {
  children: React.ReactNode;
  locale?: string;
}) {
  const [cart, setCart] = useState<ShopifyCart | null>(null);
  const [optimisticLines, setOptimisticLines] = useState<OptimisticCartLineSnapshot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [isPendingAdd, setIsPendingAdd] = useState(false);
  const [pendingLineIds, setPendingLineIds] = useState<Set<string>>(new Set());
  const [cartError, setCartError] = useState<string | null>(null);
  const [pendingQuantities, setPendingQuantities] = useState<Record<string, number>>({});
  const debounceTimersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const isLinePending = useCallback((lineId: string) => pendingLineIds.has(lineId), [pendingLineIds]);

  const loadCart = useCallback(
    async (cartId: string) => {
      try {
        const c = await getCart(cartId, locale);
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
    },
    [locale]
  );

  /** Returns cartId; if none stored, creates cart. Does NOT call getCart in add path. */
  const ensureCartId = useCallback(async (): Promise<string | null> => {
    if (typeof window === "undefined") return null;
    const stored = localStorage.getItem(CART_ID_KEY);
    if (stored) return stored;
    try {
      const newCart = await createCart(locale);
      localStorage.setItem(CART_ID_KEY, newCart.id);
      setCart(newCart);
      setCartError(null);
      return newCart.id;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to create cart";
      setCartError(msg);
      return null;
    }
  }, [locale]);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem(CART_ID_KEY) : null;
    if (stored) {
      loadCart(stored).finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [loadCart]);

  useEffect(() => {
    return () => {
      Object.values(debounceTimersRef.current).forEach(clearTimeout);
      debounceTimersRef.current = {};
    };
  }, []);

  const addItem = useCallback(
    async (
      variantId: string,
      quantity: number = 1,
      optimisticSnapshot?: OptimisticCartLineSnapshot
    ) => {
      setCartError(null);
      const snapshot = optimisticSnapshot ?? {
        variantId,
        quantity,
        productTitle: "",
        variantTitle: "",
        price: "0",
        currencyCode: "USD",
        image: null,
        handle: "",
      };
      setOptimisticLines((prev) => [...prev, snapshot]);
      setIsOpen(true);
      setIsPendingAdd(true);
      let cartId = await ensureCartId();
      if (!cartId) {
        setOptimisticLines((prev) => prev.filter((l) => l.variantId !== variantId));
        setIsPendingAdd(false);
        return;
      }
      try {
        const c = await addToCart(cartId, variantId, quantity, locale);
        setCart(c);
        setOptimisticLines((prev) => prev.filter((l) => l.variantId !== variantId));
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to add to cart";
        const isInvalidCart =
          msg.includes("cart") || msg.includes("not found") || msg.includes("Invalid");
        if (isInvalidCart && typeof window !== "undefined") {
          localStorage.removeItem(CART_ID_KEY);
          try {
            const newCart = await createCart(locale);
            localStorage.setItem(CART_ID_KEY, newCart.id);
            cartId = newCart.id;
            const retry = await addToCart(cartId, variantId, quantity, locale);
            setCart(retry);
            setOptimisticLines((prev) => prev.filter((l) => l.variantId !== variantId));
          } catch (retryErr) {
            setCartError(retryErr instanceof Error ? retryErr.message : "Failed to add to cart");
            setOptimisticLines((prev) => prev.filter((l) => l.variantId !== variantId));
          }
        } else {
          setCartError(msg);
          setOptimisticLines((prev) => prev.filter((l) => l.variantId !== variantId));
        }
      } finally {
        setIsPendingAdd(false);
      }
    },
    [ensureCartId, locale]
  );

  const flushDebouncedUpdate = useCallback(
    (lineId: string) => {
      const timer = debounceTimersRef.current[lineId];
      if (timer) {
        clearTimeout(timer);
        delete debounceTimersRef.current[lineId];
      }
    },
    []
  );

  const updateQuantity = useCallback(
    async (lineId: string, quantity: number) => {
      if (!cart?.id) return;
      setCartError(null);
      const prevQuantity =
        pendingQuantities[lineId] ??
        cart.lines.nodes.find((l) => l.id === lineId)?.quantity ??
        0;
      setPendingQuantities((prev) => ({ ...prev, [lineId]: quantity }));
      if (quantity <= 0) {
        setCart((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            lines: {
              nodes: prev.lines.nodes.filter((l) => l.id !== lineId),
            },
          };
        });
        setPendingLineIds((prev) => new Set(prev).add(lineId));
        try {
          const c = await removeCartLine(cart.id, lineId, locale);
          setCart(c);
          setPendingQuantities((prev) => {
            const next = { ...prev };
            delete next[lineId];
            return next;
          });
        } catch (e) {
          setCart((prev) => {
            if (!prev) return null;
            const line = prev.lines.nodes.find((l) => l.id === lineId);
            if (!line) return prev;
            return {
              ...prev,
              lines: {
                nodes: prev.lines.nodes.map((l) =>
                  l.id === lineId ? { ...l, quantity: prevQuantity } : l
                ),
              },
            };
          });
          setCartError(e instanceof Error ? e.message : "Failed to update cart");
          setPendingQuantities((prev) => {
            const next = { ...prev };
            delete next[lineId];
            return next;
          });
        } finally {
          setPendingLineIds((prev) => {
            const next = new Set(prev);
            next.delete(lineId);
            return next;
          });
        }
        return;
      }
      setCart((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          lines: {
            nodes: prev.lines.nodes.map((l) =>
              l.id === lineId ? { ...l, quantity } : l
            ),
          },
        };
      });
      flushDebouncedUpdate(lineId);
      debounceTimersRef.current[lineId] = setTimeout(() => {
        delete debounceTimersRef.current[lineId];
        setPendingLineIds((prev) => new Set(prev).add(lineId));
        (async () => {
          try {
            const c = await updateCartLine(cart.id, lineId, quantity, locale);
            setCart(c);
            setPendingQuantities((prev) => {
              const next = { ...prev };
              delete next[lineId];
              return next;
            });
          } catch (e) {
            setCart((prev) => {
              if (!prev) return null;
              return {
                ...prev,
                lines: {
                  nodes: prev.lines.nodes.map((l) =>
                    l.id === lineId ? { ...l, quantity: prevQuantity } : l
                  ),
                },
              };
            });
            setCartError(e instanceof Error ? e.message : "Failed to update cart");
            setPendingQuantities((prev) => {
              const next = { ...prev };
              delete next[lineId];
              return next;
            });
          } finally {
            setPendingLineIds((prev) => {
              const next = new Set(prev);
              next.delete(lineId);
              return next;
            });
          }
        })();
        }, DEBOUNCE_MS);
    },
    [cart?.id, flushDebouncedUpdate, pendingQuantities, locale]
  );

  const removeLine = useCallback(
    async (lineId: string) => {
      if (!cart?.id) return;
      setCartError(null);
      const previousLines = cart.lines.nodes;
      setCart((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          lines: {
            nodes: prev.lines.nodes.filter((l) => l.id !== lineId),
          },
        };
      });
      setPendingLineIds((prev) => new Set(prev).add(lineId));
      flushDebouncedUpdate(lineId);
      try {
        const c = await removeCartLine(cart.id, lineId, locale);
        setCart(c);
      } catch (e) {
        setCart((prev) =>
          prev ? { ...prev, lines: { nodes: previousLines } } : null
        );
        setCartError(e instanceof Error ? e.message : "Failed to remove from cart");
      } finally {
        setPendingLineIds((prev) => {
          const next = new Set(prev);
          next.delete(lineId);
          return next;
        });
      }
    },
    [cart?.id, flushDebouncedUpdate, locale]
  );

  const value = useMemo<CartContextValue>(
    () => ({
      cart,
      optimisticLines,
      isLoading,
      isOpen,
      isPendingAdd,
      isLinePending,
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
    [
      cart,
      optimisticLines,
      isLoading,
      isOpen,
      isPendingAdd,
      isLinePending,
      cartError,
      addItem,
      updateQuantity,
      removeLine,
    ]
  );

  return (
    <CartContext.Provider value={value}>{children}</CartContext.Provider>
  );
}

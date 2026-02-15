"use client";

import { ShoppingBag } from "lucide-react";
import { useCart } from "./CartProvider";

export function CartIcon() {
  const { cart, openCart } = useCart();
  const totalItems =
    cart?.lines?.nodes?.reduce((s, l) => s + l.quantity, 0) ?? 0;

  return (
    <button
      type="button"
      onClick={openCart}
      className="relative p-2 hover:bg-muted rounded-full transition-colors"
      aria-label="Open cart"
    >
      <ShoppingBag className="w-6 h-6" />
      {totalItems > 0 && (
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-accent-foreground rounded-full flex items-center justify-center text-xs font-semibold">
          {totalItems > 9 ? "9+" : totalItems}
        </span>
      )}
    </button>
  );
}

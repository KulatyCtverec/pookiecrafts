"use client";

import { X, Minus, Plus } from "lucide-react";
import { useCart } from "./CartProvider";
import { Button } from "@/components/design-system/Button";
import { ImageWithFallback } from "@/components/design-system/ImageWithFallback";
import type { ShopifyCartLine } from "@/lib/shopify";

function formatPrice(amount: string, currencyCode: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
  }).format(parseFloat(amount));
}

export function CartDrawer() {
  const { cart, isOpen, closeCart, updateQuantity, removeLine, cartError } =
    useCart();

  if (!isOpen) return null;

  const lines = cart?.lines?.nodes ?? [];
  const total =
    lines.reduce(
      (s, l) =>
        s +
        parseFloat(l.merchandise.price.amount) * l.quantity,
      0
    ) ?? 0;
  const currency =
    lines[0]?.merchandise.price.currencyCode ?? "USD";

  return (
    <>
      <div
        className="fixed inset-0 bg-black/20 z-40 backdrop-blur-sm"
        onClick={closeCart}
        aria-hidden
      />
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-card shadow-2xl z-50 flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-2xl">Your Cart</h2>
          <button
            type="button"
            onClick={closeCart}
            className="w-10 h-10 rounded-full hover:bg-muted flex items-center justify-center transition-colors"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {cartError && (
            <div className="mb-4 p-3 rounded-xl bg-destructive/10 text-destructive text-sm">
              {cartError}
            </div>
          )}
          {lines.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">Your cart is empty</p>
              <Button onClick={closeCart}>Continue Shopping</Button>
            </div>
          ) : (
            <div className="space-y-4">
              {lines.map((line) => (
                <CartLineItem
                  key={line.id}
                  line={line}
                  onUpdate={(q) => updateQuantity(line.id, q)}
                  onRemove={() => removeLine(line.id)}
                />
              ))}
            </div>
          )}
        </div>

        {lines.length > 0 && cart?.checkoutUrl && (
          <div className="border-t border-border p-6 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-lg">Subtotal</span>
              <span className="text-2xl font-semibold text-accent">
                {formatPrice(String(total), currency)}
              </span>
            </div>
            <Button size="lg" className="w-full" asChild>
              <a href={cart.checkoutUrl} target="_blank" rel="noopener noreferrer">
                Checkout
              </a>
            </Button>
            <button
              type="button"
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

function CartLineItem({
  line,
  onUpdate,
  onRemove,
}: {
  line: ShopifyCartLine;
  onUpdate: (quantity: number) => void;
  onRemove: () => void;
}) {
  const title = line.merchandise.product.title;
  const variantTitle =
    line.merchandise.selectedOptions
      ?.map((o) => o.value)
      .filter(Boolean)
      .join(" / ") || line.merchandise.title;
  const price = line.merchandise.price.amount;
  const currency = line.merchandise.price.currencyCode;
  const img = line.merchandise.image?.url;

  return (
    <div className="flex gap-4 bg-background rounded-2xl p-4">
      {img && (
        <ImageWithFallback
          src={img}
          alt={title}
          className="w-20 h-20 rounded-xl object-cover"
        />
      )}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold truncate">{title}</h3>
        {variantTitle && variantTitle !== "Default Title" && (
          <p className="text-sm text-muted-foreground">{variantTitle}</p>
        )}
        <p className="text-accent font-semibold mt-1">
          {formatPrice(price, currency)}
        </p>
        <div className="flex items-center gap-3 mt-2">
          <div className="flex items-center gap-2 bg-card border border-border rounded-full px-2 py-1">
            <button
              type="button"
              onClick={() => onUpdate(line.quantity - 1)}
              className="w-6 h-6 rounded-full hover:bg-muted transition-colors flex items-center justify-center"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="w-6 text-center text-sm">{line.quantity}</span>
            <button
              type="button"
              onClick={() => onUpdate(line.quantity + 1)}
              className="w-6 h-6 rounded-full hover:bg-muted transition-colors flex items-center justify-center"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
          <button
            type="button"
            onClick={onRemove}
            className="text-sm text-muted-foreground hover:text-destructive transition-colors"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}

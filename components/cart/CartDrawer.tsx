"use client";

import { X, Minus, Plus, Loader2 } from "lucide-react";
import { useCart } from "./CartProvider";
import type { OptimisticCartLineSnapshot } from "./CartProvider";
import { Button } from "@/components/design-system/Button";
import { ImageWithFallback } from "@/components/design-system/ImageWithFallback";
import type { ShopifyCartLine } from "@/lib/shopify";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";

function formatPrice(amount: string, currencyCode: string, locale: string): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currencyCode,
  }).format(parseFloat(amount));
}

export function CartDrawer() {
  const t = useTranslations("cart");
  const locale = useLocale();
  const {
    cart,
    optimisticLines,
    isOpen,
    closeCart,
    updateQuantity,
    removeLine,
    cartError,
    isLinePending,
  } = useCart();

  if (!isOpen) return null;

  const lines = cart?.lines?.nodes ?? [];
  const realTotal =
    lines.reduce(
      (s, l) => s + parseFloat(l.merchandise.price.amount) * l.quantity,
      0
    ) ?? 0;
  const optimisticTotal =
    optimisticLines.reduce(
      (s, l) => s + parseFloat(l.price) * l.quantity,
      0
    ) ?? 0;
  const total = realTotal + optimisticTotal;
  const currency =
    lines[0]?.merchandise.price.currencyCode ??
    optimisticLines[0]?.currencyCode ??
    "USD";
  const hasAnyLines = lines.length > 0 || optimisticLines.length > 0;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/20 z-40 backdrop-blur-sm"
        onClick={closeCart}
        aria-hidden
      />
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-card shadow-2xl z-50 flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-2xl">{t("yourCart")}</h2>
          <button
            type="button"
            onClick={closeCart}
            className="w-10 h-10 rounded-full hover:bg-muted flex items-center justify-center transition-colors"
            aria-label={t("closeCart")}
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
          {!hasAnyLines ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">{t("empty")}</p>
              <Button onClick={closeCart}>{t("continueShopping")}</Button>
            </div>
          ) : (
            <div className="space-y-4">
              {optimisticLines.map((opt) => (
                <OptimisticLineItem key={`opt-${opt.variantId}`} line={opt} locale={locale} t={t} />
              ))}
              {lines.map((line) => (
                <CartLineItem
                  key={line.id}
                  line={line}
                  isPending={isLinePending(line.id)}
                  onUpdate={(q) => updateQuantity(line.id, q)}
                  onRemove={() => removeLine(line.id)}
                  locale={locale}
                  t={t}
                />
              ))}
            </div>
          )}
        </div>

        {hasAnyLines && (
          <div className="border-t border-border p-6 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-lg">{t("subtotal")}</span>
              <span className="text-2xl font-semibold text-accent">
                {formatPrice(String(total), currency, locale)}
              </span>
            </div>
            {cart?.checkoutUrl ? (
              <Button size="lg" className="w-full" asChild>
                <a
                  href={cart.checkoutUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t("checkout")}
                </a>
              </Button>
            ) : (
              <Button size="lg" className="w-full" disabled>
                {t("updatingCart")}
              </Button>
            )}
            <button
              type="button"
              onClick={closeCart}
              className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {t("continueShopping")}
            </button>
          </div>
        )}
      </div>
    </>
  );
}

function OptimisticLineItem({
  line,
  locale,
  t,
}: {
  line: OptimisticCartLineSnapshot;
  locale: string;
  t: (key: string) => string;
}) {
  return (
    <div className="flex gap-4 bg-background rounded-2xl p-4 opacity-90">
      {line.image && (
        <ImageWithFallback
          src={line.image}
          alt={line.productTitle}
          className="w-20 h-20 rounded-xl object-cover"
        />
      )}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold truncate">{line.productTitle}</h3>
        {line.variantTitle && line.variantTitle !== "Default Title" && (
          <p className="text-sm text-muted-foreground">{line.variantTitle}</p>
        )}
        <p className="text-accent font-semibold mt-1">
          {formatPrice(line.price, line.currencyCode, locale)}
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          <span className="inline-flex items-center gap-1">
            <Loader2 className="w-3 h-3 animate-spin" />
            {t("adding")}
          </span>
        </p>
      </div>
    </div>
  );
}

function CartLineItem({
  line,
  isPending,
  onUpdate,
  onRemove,
  locale,
  t,
}: {
  line: ShopifyCartLine;
  isPending: boolean;
  onUpdate: (quantity: number) => void;
  onRemove: () => void;
  locale: string;
  t: (key: string) => string;
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
          {formatPrice(price, currency, locale)}
        </p>
        <div className="flex items-center gap-3 mt-2">
          <div className="flex items-center gap-2 bg-card border border-border rounded-full px-2 py-1">
            <button
              type="button"
              disabled={isPending}
              onClick={() => onUpdate(line.quantity - 1)}
              className="w-6 h-6 rounded-full hover:bg-muted transition-colors flex items-center justify-center disabled:opacity-50 disabled:pointer-events-none"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="w-6 text-center text-sm">{line.quantity}</span>
            <button
              type="button"
              disabled={isPending}
              onClick={() => onUpdate(line.quantity + 1)}
              className="w-6 h-6 rounded-full hover:bg-muted transition-colors flex items-center justify-center disabled:opacity-50 disabled:pointer-events-none"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
          <button
            type="button"
            disabled={isPending}
            onClick={onRemove}
            className="text-sm text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50 disabled:pointer-events-none"
          >
            {t("remove")}
          </button>
        </div>
      </div>
    </div>
  );
}

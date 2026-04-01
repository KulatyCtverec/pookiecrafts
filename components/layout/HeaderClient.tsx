"use client";

import { Link } from "@/i18n/navigation";
import { Menu, X } from "lucide-react";
import { CartIcon } from "@/components/cart/CartIcon";
import { LanguageSelector } from "@/components/layout/LanguageSelector";
import { useState } from "react";
import { cn } from "@/lib/utils";
import NextImage from "next/image";
import { useTranslations } from "next-intl";

export type NavCollectionLink = { handle: string; title: string };

export function HeaderClient({ collectionLinks }: { collectionLinks: NavCollectionLink[] }) {
  const t = useTranslations("nav");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex h-20 w-full max-md:justify-between items-center md:flex-row">
          {/* Desktop: poloviny stejně široké + logo uprostřed. Mobil: logo vlevo, ikony vpravo (justify-between). */}
          <div className="z-1 hidden min-w-0 flex-1 flex-wrap items-center justify-start gap-x-8 gap-y-2 pr-4 md:flex">
            {collectionLinks.map((c) => (
              <Link
                key={c.handle}
                href={`/collections/${c.handle}`}
                className="text-foreground hover:text-accent transition-colors font-medium shrink-0"
              >
                {c.title}
              </Link>
            ))}
          </div>

          <Link
            href="/"
            className="z-2 flex shrink-0 items-center md:absolute md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2"
            aria-label={t("home")}
          >
            <NextImage src="/logo_pookie.svg" alt="" width={200} height={100} priority />
          </Link>

          <div className="z-1 flex max-md:flex-none min-w-0 flex-1 items-center justify-end gap-2 pl-4 max-md:pl-0">
            <LanguageSelector />
            <CartIcon />
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 hover:bg-muted rounded-full transition-colors"
              aria-label={t("toggleMenu")}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        <div
          className={cn(
            "md:hidden overflow-hidden transition-all duration-300",
            mobileMenuOpen ? "max-h-128 overflow-y-auto pb-6" : "max-h-0"
          )}
        >
          <div className="flex flex-col gap-4">

            {collectionLinks.map((c) => (
              <Link
                key={c.handle}
                href={`/collections/${c.handle}`}
                className="text-foreground hover:text-accent transition-colors font-medium py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                {c.title}
              </Link>
            ))}

          </div>
        </div>
      </nav>
    </header>
  );
}

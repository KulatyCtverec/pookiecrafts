"use client";

import { Link } from "@/i18n/navigation";
import { Menu, X } from "lucide-react";
import { CartIcon } from "@/components/cart/CartIcon";
import { WishlistNavLink } from "@/components/favorites/WishlistNavLink";
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
    <header className="sticky top-0 z-30 w-full min-w-0 bg-background/80 backdrop-blur-md border-b border-border">
      <nav className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 min-w-0">
        <div className="relative flex h-20 w-full min-w-0 max-w-full max-md:justify-between items-center md:flex-row gap-2 max-md:gap-1">
          {/* Desktop: poloviny stejně široké + logo uprostřed. Mobil: logo vlevo, ikony vpravo (justify-between). */}
          <div className="z-0 hidden min-w-0 flex-1 flex-wrap items-center justify-start gap-x-8 gap-y-2 pr-4 md:flex">
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
            className="z-5 flex min-w-0 shrink items-center justify-center md:absolute md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:shrink-0 max-md:max-w-[min(156px,42vw)]"
            aria-label={t("home")}
          >
            <NextImage
              src="/logo_pookie.svg"
              alt=""
              width={200}
              height={100}
              priority
              className="h-auto w-full max-h-11 md:max-h-none md:w-[200px] md:max-w-none object-contain object-left md:object-center"
            />
          </Link>

          <div className="relative z-20 flex shrink-0 max-md:flex-none min-w-0 flex-1 items-center justify-end gap-0.5 sm:gap-2 pl-1 sm:pl-2 md:pl-4">
            <LanguageSelector />
            <WishlistNavLink />
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

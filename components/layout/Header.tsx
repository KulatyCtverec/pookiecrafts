"use client";

import { Link } from "@/i18n/navigation";
import { Menu, X } from "lucide-react";
import { CartIcon } from "@/components/cart/CartIcon";
import { LanguageSelector } from "@/components/layout/LanguageSelector";
import { useState } from "react";
import { cn } from "@/lib/utils";
import NextImage from "next/image";
import { useTranslations } from "next-intl";

export function Header() {
  const t = useTranslations("nav");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: t("home"), href: "/" },
    { name: t("collections"), href: "/collections" },
    { name: t("about"), href: "/about" },
    { name: t("faq"), href: "/faq" },
    { name: t("contact"), href: "/contact" },
  ];

  return (
    <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="flex items-center">
            <NextImage src="/logo_pookie.svg" alt="" width={200} height={100} />
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-foreground hover:text-accent transition-colors font-medium"
              >
                {item.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
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
            mobileMenuOpen ? "max-h-96 pb-6" : "max-h-0"
          )}
        >
          <div className="flex flex-col gap-4">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-foreground hover:text-accent transition-colors font-medium py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </header>
  );
}

"use client";

import { Link } from "@/i18n/navigation";
import NextImage from "next/image";
import { Heart, Instagram, Mail } from "lucide-react";
import { useTranslations } from "next-intl";

export function Footer() {
  const t = useTranslations("footer");
  return (
    <footer className="bg-card border-t border-border mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              <NextImage
                src="/logo_pookie.svg"
                alt="PookieCrafts"
                width={200}
                height={100}
              />
            </Link>
            <p className="text-muted-foreground text-sm">{t("tagline")}</p>
            <div className="flex gap-3">
              <a
                href="#"
                className="w-10 h-10 bg-muted hover:bg-accent transition-colors rounded-full flex items-center justify-center"
                aria-label={t("instagram")}
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-muted hover:bg-accent transition-colors rounded-full flex items-center justify-center"
                aria-label={t("email")}
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">{t("shop")}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/collections"
                  className="text-muted-foreground hover:text-accent transition-colors"
                >
                  {t("allCollections")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">{t("about")}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/about"
                  className="text-muted-foreground hover:text-accent transition-colors"
                >
                  {t("ourStory")}
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-muted-foreground hover:text-accent transition-colors"
                >
                  {t("faq")}
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-muted-foreground hover:text-accent transition-colors"
                >
                  {t("contact")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">{t("customerCare")}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-accent transition-colors"
                >
                  {t("shippingInfo")}
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-accent transition-colors"
                >
                  {t("returns")}
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-accent transition-colors"
                >
                  {t("careInstructions")}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>
            {t("madeWith")} <Heart className="w-4 h-4 inline text-accent" /> {t("byPookie")}
          </p>
        </div>
      </div>
    </footer>
  );
}

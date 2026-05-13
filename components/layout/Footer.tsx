"use client";

import { Link } from "@/i18n/navigation";
import NextImage from "next/image";
import { Instagram, Mail } from "lucide-react";
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
            <div className="flex gap-3">
              <a
                href="https://instagram.com/pookie.crafts.store"
                className="w-10 h-10 bg-muted hover:bg-accent transition-colors rounded-full flex items-center justify-center"
                aria-label={t("instagram")}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="mailto:info.pookiecrafts@gmail.com"
                className="w-10 h-10 bg-muted hover:bg-accent transition-colors rounded-full flex items-center justify-center"
                aria-label={t("email")}
              >
                <Mail className="w-5 h-5" />
              </a>
              <a
                href="https://www.tiktok.com/@pookie.crafts"
                className="w-10 h-10 bg-muted hover:bg-accent transition-colors rounded-full flex items-center justify-center"
                aria-label="TikTok"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="w-5 h-5 fill-current"
                >
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.26V2h-3.12v12.46a2.52 2.52 0 1 1-2.18-2.5V8.79a5.68 5.68 0 1 0 5.3 5.67V8.13a7.9 7.9 0 0 0 4.6 1.47V6.69z" />
                </svg>
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">{t("shop")}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/"
                  className="text-muted-foreground hover:text-accent transition-colors"
                >
                  {t("home")}
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
                <Link
                  href="/returns"
                  className="text-muted-foreground hover:text-accent transition-colors"
                >
                  {t("returns")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>{t("copyright")}</p>
        </div>
      </div>
    </footer>
  );
}

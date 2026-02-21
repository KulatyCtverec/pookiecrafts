import { defineRouting } from "next-intl/routing";
import { locales, defaultLocale } from "@/lib/i18n/config";

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: "always",
  localeCookie: {
    name: "NEXT_LOCALE",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    path: "/",
  },
  localeDetection: true,
  alternateLinks: true,
});

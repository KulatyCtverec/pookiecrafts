import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";
import { locales, countryToLocale, isValidLocale } from "@/lib/i18n/config";

const localePattern = new RegExp(`^/(${locales.join("|")})(/|$)`);

function getLocaleFromGeo(request: NextRequest): string | undefined {
  const country = request.headers.get("x-vercel-ip-country");
  if (!country) return undefined;
  const locale = countryToLocale[country];
  return locale && locales.includes(locale) ? locale : undefined;
}

export default function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const hasLocaleInPath = localePattern.test(pathname);
  const cookieName: string =
    routing.localeCookie && typeof routing.localeCookie === "object"
      ? routing.localeCookie.name ?? "NEXT_LOCALE"
      : "NEXT_LOCALE";
  const localeCookie = request.cookies.get(cookieName)?.value;
  const hasValidCookie = localeCookie && isValidLocale(localeCookie);

  if (!hasLocaleInPath) {
    const geoLocale = getLocaleFromGeo(request);
    if (!hasValidCookie && geoLocale) {
      const newPath = pathname === "/" ? `/${geoLocale}` : `/${geoLocale}${pathname}`;
      const url = request.nextUrl.clone();
      url.pathname = newPath;
      const response = NextResponse.redirect(url);
      const cookieConfig = routing.localeCookie;
      if (cookieConfig && typeof cookieConfig === "object" && cookieConfig.name) {
        response.cookies.set(cookieConfig.name, geoLocale, {
          path: cookieConfig.path ?? "/",
          maxAge: cookieConfig.maxAge ?? 60 * 60 * 24 * 365,
          sameSite: (cookieConfig.sameSite as "lax" | "strict" | "none") ?? "lax",
        });
      }
      return response;
    }
  }

  return createMiddleware(routing)(request);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};

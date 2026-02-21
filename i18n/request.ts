import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";
import { isValidLocale } from "@/lib/i18n/config";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = requested && isValidLocale(requested) ? requested : routing.defaultLocale;

  const messages = (await import(`../messages/${locale}.json`)).default;

  return {
    locale,
    messages,
  };
});

export const locales = ["en", "de", "fr", "es", "it", "pl", "cs"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export const localeLabels: Record<Locale, string> = {
  en: "English",
  de: "Deutsch",
  fr: "Français",
  es: "Español",
  it: "Italiano",
  pl: "Polski",
  cs: "Čeština",
};

/** Map Vercel geo country codes to preferred locale (EU focus) */
export const countryToLocale: Record<string, Locale> = {
  CZ: "cs",
  SK: "cs",
  DE: "de",
  AT: "de",
  CH: "de",
  LI: "de",
  FR: "fr",
  BE: "fr",
  MC: "fr",
  LU: "fr",
  ES: "es",
  AD: "es",
  IT: "it",
  SM: "it",
  VA: "it",
  PL: "pl",
  GB: "en",
  UK: "en",
  US: "en",
  IE: "en",
  NL: "en",
  PT: "es",
  RO: "en",
  BG: "en",
  GR: "en",
  HU: "en",
  HR: "en",
  SI: "en",
};

export function isValidLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

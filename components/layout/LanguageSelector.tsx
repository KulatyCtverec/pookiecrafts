"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, usePathname } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { locales, localeLabels } from "@/lib/i18n/config";

/** Locale code → country code for flag-icons (ISO 3166-1 alpha-2) */
const LOCALE_TO_FLAG: Record<string, string> = {
  en: "gb",
  de: "de",
  fr: "fr",
  es: "es",
  it: "it",
  pl: "pl",
  cs: "cz",
};

function FlagIcon({
  locale,
  size = 20,
  className,
}: {
  locale: string;
  size?: number;
  className?: string;
}) {
  const country = LOCALE_TO_FLAG[locale] ?? "gb";
  return (
    <span
      className={`fib fis fi-${country} ${className ?? ""}`}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        overflow: "hidden",
        flexShrink: 0,
      }}
      aria-hidden
    />
  );
}

export function LanguageSelector() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (newLocale: string) => {
    if (newLocale === locale) {
      setIsOpen(false);
      return;
    }
    document.cookie = `NEXT_LOCALE=${newLocale};path=/;max-age=31536000;SameSite=Lax`;
    router.replace(pathname, { locale: newLocale });
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-8 h-8 rounded-full flex items-center justify-center bg-muted hover:bg-accent/20 transition-colors text-lg border border-border"
        aria-label="Select language"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <FlagIcon locale={locale} size={20} />
      </button>
      {isOpen && (
        <div
          className="absolute right-0 top-full mt-2 py-2 bg-card rounded-2xl shadow-lg border border-border min-w-[160px] z-50"
          role="listbox"
        >
          {locales.map((loc) => (
            <button
              key={loc}
              type="button"
              role="option"
              aria-selected={loc === locale}
              onClick={() => handleSelect(loc)}
              className={`w-full flex items-center gap-2 px-4 py-2 text-left hover:bg-muted transition-colors ${loc === locale ? "bg-muted/50" : ""}`}
            >
              <FlagIcon locale={loc} size={22} />
              <span>{localeLabels[loc]}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

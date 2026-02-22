import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { locales } from "@/lib/i18n/config";
import { buildUrl } from "@/lib/seo";
import { FAQPageClient } from "./FAQPageClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "faq" });
  const url = buildUrl(`/${locale}/faq`);
  const alternates = locales.reduce<Record<string, string>>((acc, lang) => {
    acc[lang] = buildUrl(`/${lang}/faq`);
    return acc;
  }, {});

  return {
    title: t("title"),
    description: t("subtitle"),
    alternates: {
      canonical: url,
      languages: alternates,
    },
    openGraph: {
      title: t("title"),
      description: t("subtitle"),
      url,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("subtitle"),
    },
  };
}

export default function FAQPage() {
  return <FAQPageClient />;
}

import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { locales } from "@/lib/i18n/config";
import { buildUrl } from "@/lib/seo";
import { ContactPageClient } from "./ContactPageClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact" });
  const url = buildUrl(`/${locale}/contact`);
  const alternates = locales.reduce<Record<string, string>>((acc, lang) => {
    acc[lang] = buildUrl(`/${lang}/contact`);
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

export default function ContactPage() {
  return <ContactPageClient />;
}

import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { locales } from "@/lib/i18n/config";
import { buildUrl } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "returnsPage" });
  const url = buildUrl(`/${locale}/returns`);
  const alternates = locales.reduce<Record<string, string>>((acc, lang) => {
    acc[lang] = buildUrl(`/${lang}/returns`);
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

export default async function ReturnsPage() {
  const t = await getTranslations("returnsPage");

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12 space-y-4">
        <h1 className="text-4xl md:text-5xl">{t("title")}</h1>
        <p className="text-muted-foreground text-lg">{t("subtitle")}</p>
      </div>

      <div className="prose prose-lg max-w-none space-y-6 text-muted-foreground">
        <p>{t("p1")}</p>
        <p>{t("p2")}</p>
        <p>{t("p3")}</p>
        <p>
          {t("contact")}{" "}
          <a
            href="mailto:pookie.crafts909@gmail.com"
            className="text-accent hover:text-accent/80"
          >
            pookie.crafts909@gmail.com
          </a>
          .
        </p>
      </div>
    </div>
  );
}


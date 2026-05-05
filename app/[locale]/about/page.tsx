import { Heart, Instagram } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { locales } from "@/lib/i18n/config";
import { buildUrl } from "@/lib/seo";
import { getAboutPhotoImage } from "@/lib/shopify";
import { ImageWithFallback } from "@/components/design-system/ImageWithFallback";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  const url = buildUrl(`/${locale}/about`);
  const alternates = locales.reduce<Record<string, string>>((acc, lang) => {
    acc[lang] = buildUrl(`/${lang}/about`);
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
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("subtitle"),
    },
  };
}

export default async function AboutPage() {
  const t = await getTranslations("about");
  const locale = await getLocale();
  const aboutPhoto = await getAboutPhotoImage(locale);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-16 space-y-4">
        <h1 className="text-4xl md:text-5xl">{t("title")}</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          {t("subtitle")}
        </p>
      </div>

      <div className="prose prose-lg max-w-none space-y-8">
        <div className="flex items-stretch gap-8">
          <div className="bg-card rounded-3xl p-8 border border-border flex-1 min-w-0 h-[420px]">
            <h2 className="text-2xl mb-4 flex items-center gap-3">
              <Heart className="w-7 h-7 text-accent" />
              {t("howItStarted")}
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              {t("howItStartedText1")}
            </p>
            <p className="text-muted-foreground leading-relaxed">
              {t("howItStartedText2")}
            </p>
          </div>

          <div className="rounded-3xl overflow-hidden shadow-lg w-[400px] h-[420px] shrink-0">
            {aboutPhoto ? (
              <ImageWithFallback
                src={aboutPhoto.url}
                alt={aboutPhoto.alt || t("workspaceAlt")}
                className="w-full h-full object-cover"
                loading="eager"
                decoding="async"
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground">
                {t("workspaceAlt")}
              </div>
            )}
          </div>
        </div>

        <div className="bg-card rounded-3xl p-8 border border-border text-center">
          <h2 className="text-2xl mb-4">{t("joinCommunity")}</h2>
          <p className="text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            {t("joinCommunityText")}
          </p>
          <div className="mt-6 inline-flex flex-col items-start gap-3">
            <a
              href="https://instagram.com/pookie.crafts.store"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-accent hover:text-accent/80 transition-colors"
              aria-label="Instagram"
            >
              <Instagram className="w-5 h-5" />
              @pookie.crafts.store
            </a>
            <a
              href="https://www.tiktok.com/@pookie.crafts"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-accent hover:text-accent/80 transition-colors"
              aria-label="TikTok"
            >
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="w-5 h-5 fill-current"
              >
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.26V2h-3.12v12.46a2.52 2.52 0 1 1-2.18-2.5V8.79a5.68 5.68 0 1 0 5.3 5.67V8.13a7.9 7.9 0 0 0 4.6 1.47V6.69z" />
              </svg>
              @pookie.crafts
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

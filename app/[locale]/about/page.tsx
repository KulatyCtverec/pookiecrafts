import { Heart } from "lucide-react";
import NextImage from "next/image";
import { getTranslations } from "next-intl/server";

export default async function AboutPage() {
  const t = await getTranslations("about");

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-16 space-y-4">
        <h1 className="text-4xl md:text-5xl">{t("title")}</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          {t("subtitle")}
        </p>
      </div>

      <div className="rounded-3xl overflow-hidden mb-16 shadow-lg">
        <NextImage
          src="/about-candles.jpeg"
          alt={t("workspaceAlt")}
          width={1200}
          height={400}
          className="w-full h-[400px] object-cover"
          sizes="(min-width: 1024px) 1200px, 100vw"
          priority
        />
      </div>

      <div className="prose prose-lg max-w-none space-y-8">
        <div className="bg-card rounded-3xl p-8 border border-border">
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

        <div className="bg-gradient-to-br from-[#FFE6ED] to-[#FFF4E6] rounded-3xl p-8">
          <h2 className="text-2xl mb-4">{t("ourValues")}</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">{t("handmadeQuality")}</h3>
              <p className="text-muted-foreground">{t("handmadeQualityText")}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">{t("naturalMaterials")}</h3>
              <p className="text-muted-foreground">{t("naturalMaterialsText")}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">{t("madeWithLove")}</h3>
              <p className="text-muted-foreground">{t("madeWithLoveText")}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">{t("thoughtfulDesign")}</h3>
              <p className="text-muted-foreground">{t("thoughtfulDesignText")}</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-3xl p-8 border border-border text-center">
          <h2 className="text-2xl mb-4">{t("joinCommunity")}</h2>
          <p className="text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            {t("joinCommunityText")}
          </p>
        </div>
      </div>
    </div>
  );
}

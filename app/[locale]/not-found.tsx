import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/design-system/Button";

export default async function NotFound() {
  const t = await getTranslations("notFound");
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center space-y-6 max-w-md">
        <h1 className="text-8xl md:text-9xl text-primary">404</h1>
        <h2 className="text-3xl">{t("title")}</h2>
        <p className="text-muted-foreground">{t("description")}</p>
        <Button size="lg" asChild>
          <Link href="/">{t("goHome")}</Link>
        </Button>
      </div>
    </div>
  );
}

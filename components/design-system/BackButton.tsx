"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

interface BackButtonProps {
  className?: string;
}

export function BackButton({ className }: BackButtonProps) {
  const t = useTranslations("common");
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => router.back()}
      className={cn(
        "flex items-center gap-2 text-muted-foreground hover:text-accent transition-colors mb-8",
        className
      )}
    >
      <ArrowLeft className="w-4 h-4" />
      {t("back")}
    </button>
  );
}

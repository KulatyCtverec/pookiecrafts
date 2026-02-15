import { cn } from "@/lib/utils";

interface BadgeProps {
  variant: "handmade" | "bestseller" | "limited";
  className?: string;
}

export function Badge({ variant, className }: BadgeProps) {
  const variants = {
    handmade: "bg-secondary text-secondary-foreground",
    bestseller: "bg-accent text-accent-foreground",
    limited: "bg-[#E8D4B8] text-foreground",
  };

  const labels = {
    handmade: "✨ Handmade",
    bestseller: "⭐ Bestseller",
    limited: "💫 Limited Edition",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium",
        variants[variant],
        className
      )}
    >
      {labels[variant]}
    </span>
  );
}

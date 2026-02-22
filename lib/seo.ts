export function getBaseUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) {
    return explicit.startsWith("http") ? explicit.replace(/\/$/, "") : `https://${explicit.replace(/\/$/, "")}`;
  }

  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) {
    return `https://${vercel.replace(/\/$/, "")}`;
  }

  return "http://localhost:3000";
}

export function buildUrl(pathname: string): string {
  const base = getBaseUrl();
  if (!pathname) return base;
  return `${base}${pathname.startsWith("/") ? "" : "/"}${pathname}`;
}


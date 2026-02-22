import type { MetadataRoute } from "next";
import { buildUrl } from "@/lib/seo";

export const revalidate = 3600;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/cart", "/checkout"],
    },
    sitemap: buildUrl("/sitemap.xml"),
  };
}


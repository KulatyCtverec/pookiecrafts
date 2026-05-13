import type { Metadata } from "next";
import { headers } from "next/headers";
import { Nunito } from "next/font/google";
import "./globals.css";
import { getBaseUrl } from "@/lib/seo";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PookieCrafts | Handmade Candles & Notebooks",
  description: "Handcrafted candles and notebooks made with love",
  metadataBase: new URL(getBaseUrl()),
  icons: {
    icon: "/maslicka.png",
  },
  openGraph: {
    title: "PookieCrafts | Handmade Candles & Notebooks",
    description: "Handcrafted candles and notebooks made with love",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PookieCrafts | Handmade Candles & Notebooks",
    description: "Handcrafted candles and notebooks made with love",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const locale = headersList.get("x-next-intl-locale") ?? "en";
  return (
    <html lang={locale} suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/flag-icons@7.2.3/css/flag-icons.min.css"
          crossOrigin="anonymous"
        />
      </head>
      <body className={`${nunito.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}

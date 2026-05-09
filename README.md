This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).  
E-commerce frontend uses **Shopify Storefront API** (headless); no custom backend or database.

## Environment (Shopify)

Copy `.env.local.example` to `.env.local` and set:

- `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN` – store domain (e.g. `your-store.myshopify.com`)
- `NEXT_PUBLIC_SHOPIFY_STOREFRONT_API_TOKEN` – **Storefront API** (public) token from Headless sales channel (not Admin API)
- `NEXT_PUBLIC_SHOPIFY_STOREFRONT_API_VERSION` – e.g. `2025-04` ([Storefront API versions](https://shopify.dev/docs/api/storefront/latest))

## Customer Profiles (Customer Account API)

For headless customer profiles (orders, personal info), use Shopify Customer Account API OAuth with **PKCE** (public web client — no `SHOPIFY_CLIENT_SECRET`):

- `SHOPIFY_CLIENT_ID`
- `SHOPIFY_CUSTOMER_SESSION_SECRET` — required; encrypts the customer session cookie (use a long random string).
- `SHOPIFY_AUTH_REDIRECT_URI` — must be listed under **Callback URIs** in Shopify (exact match with your deployed HTTPS URL).
- `SHOPIFY_AUTH_LOGOUT_REDIRECT_URI` — must be listed under **Logout URIs**.
- `SHOPIFY_AUTH_ORIGIN` *(optional)* — same as your app origin; must appear under **JavaScript origins** (hostname only, e.g. `pookiecrafts.cz`). Defaults to the origin of `SHOPIFY_AUTH_REDIRECT_URI`.
- `SHOPIFY_CUSTOMER_AUTH_DOMAIN` *(optional fallback)* — e.g. `account.pookiecrafts.cz` if discovery on the storefront domain fails.

In Shopify Admin, fill **Callback URIs**, **JavaScript origins**, and **Logout URIs** — leaving them empty breaks OAuth.

Discovery endpoints must resolve (often via `SHOPIFY_CUSTOMER_AUTH_DOMAIN`):

- `https://<domain>/.well-known/openid-configuration`
- `https://<domain>/.well-known/customer-account-api`

Do not hardcode customer auth/token/graphql endpoints. Discover and cache them from the URLs above.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

**Shopify na produkci:** Aby se na Vercelu načítala data (produkty, kolekce), musíš v projektu nastavit env proměnné:

1. Vercel → tvůj projekt → **Settings** → **Environment Variables**.
2. Přidej (pro **Production**, případně i Preview):
   - `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN` = tvoje doména (např. `obchod.myshopify.com`)
   - `NEXT_PUBLIC_SHOPIFY_STOREFRONT_API_TOKEN` = Storefront API token (public)
   - `NEXT_PUBLIC_SHOPIFY_STOREFRONT_API_VERSION` = např. `2025-04`
   - volitelně: `SHOPIFY_STOREFRONT_PRIVATE_API_TOKEN` = private token (pouze server)
3. **Důležité:** Po přidání nebo změně env spusť **nový deploy** (Deployments → … u posledního deploye → Redeploy). Proměnné `NEXT_PUBLIC_*` se vkládají při buildu, takže bez nového buildu zůstanou prázdné.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

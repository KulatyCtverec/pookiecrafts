import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  /* config options here */
};

// Apply next-intl plugin
const configWithIntl = withNextIntl(nextConfig);

// Next.js 16 moved experimental.turbo to top-level turbopack.
// next-intl injects its alias into experimental.turbo; we must merge it into turbopack.
const experimental = configWithIntl.experimental as { turbo?: { resolveAlias?: Record<string, string> } } | undefined;
const turboFromIntl = experimental?.turbo?.resolveAlias;

if (turboFromIntl) {
  const existingTurbopack = (configWithIntl.turbopack ?? {}) as Record<string, unknown>;
  const existingAlias = (existingTurbopack.resolveAlias ?? {}) as Record<string, string>;
  configWithIntl.turbopack = {
    ...existingTurbopack,
    resolveAlias: { ...existingAlias, ...turboFromIntl },
  };
  // Remove deprecated experimental.turbo to avoid Next.js 16 warning
  if (configWithIntl.experimental && "turbo" in configWithIntl.experimental) {
    const { turbo: _, ...rest } = configWithIntl.experimental as Record<string, unknown>;
    configWithIntl.experimental = rest as NextConfig["experimental"];
  }
}

export default configWithIntl;

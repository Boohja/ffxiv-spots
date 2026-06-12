import type { Metadata } from "next";

export const siteName = "XIVSpots";
export const siteDescription = "Discover scenic photo spots across Eorzea and beyond.";
export const defaultOgImage = {
  url: "/brand/logo_space.png",
  width: 1672,
  height: 941,
  alt: "XIVSpots logo",
};

export function getSiteUrl() {
  const configuredUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.SITE_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : undefined) ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined) ??
    "https://xivspots.com";

  return new URL(configuredUrl);
}

export function absoluteUrl(pathOrUrl: string) {
  return new URL(pathOrUrl, getSiteUrl()).toString();
}

export function buildDefaultMetadata(): Metadata {
  return {
    metadataBase: getSiteUrl(),
    title: {
      default: siteName,
      template: `%s | ${siteName}`,
    },
    description: siteDescription,
    applicationName: siteName,
    alternates: {
      canonical: "/",
    },
    openGraph: {
      title: siteName,
      description: siteDescription,
      url: "/",
      siteName,
      type: "website",
      images: [defaultOgImage],
    },
    twitter: {
      card: "summary_large_image",
      title: siteName,
      description: siteDescription,
      images: [defaultOgImage.url],
    },
  };
}

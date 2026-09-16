import type { Metadata } from "next";

const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

export const siteUrl = (configuredSiteUrl || "http://localhost:3000").replace(/\/$/, "");
export const siteName = "Trace publique";

export function pageMetadata(title: string, description: string, path = "/"): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      siteName,
      locale: "fr_FR",
      type: "website",
    },
    twitter: { card: "summary", title, description },
  };
}

import type { MetadataRoute } from "next";
import { candidates, proposals, themes } from "@/lib/data";
import { siteUrl } from "@/lib/seo";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = siteUrl;
  const siteLastModified = new Date("2026-09-15T00:00:00.000Z");
  return [
    { url: `${baseUrl}/`, lastModified: siteLastModified },
    { url: `${baseUrl}/candidats/`, lastModified: siteLastModified },
    { url: `${baseUrl}/themes/`, lastModified: siteLastModified },
    { url: `${baseUrl}/methode/`, lastModified: siteLastModified },
    { url: `${baseUrl}/evaluation/`, lastModified: siteLastModified },
    { url: `${baseUrl}/a-propos/`, lastModified: siteLastModified },
    ...candidates.map((candidate) => ({ url: `${baseUrl}/candidats/${candidate.id}/`, lastModified: siteLastModified })),
    ...themes.map((theme) => ({ url: `${baseUrl}/themes/${theme.id}/`, lastModified: siteLastModified })),
    ...proposals.map((proposal) => ({ url: `${baseUrl}/propositions/${proposal.id}/`, lastModified: new Date(proposal.publishedAt) })),
  ];
}

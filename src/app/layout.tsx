import type { Metadata } from "next";
import "@fontsource-variable/manrope";
import "@fontsource-variable/space-grotesk";
import "./globals.css";
import { pageMetadata, siteName, siteUrl } from "@/lib/seo";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  ...pageMetadata(
    "Trace publique — Présidentielle 2027",
    "Les propositions publiques des candidats, leurs sources et les analyses produites par plusieurs IA.",
  ),
  metadataBase: new URL(siteUrl),
  applicationName: siteName,
  category: "politics",
  authors: [{ name: siteName }],
  creator: siteName,
  publisher: siteName,
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body>
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}

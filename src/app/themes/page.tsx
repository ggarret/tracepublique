import Link from "next/link";
import { proposals, themes } from "@/lib/data";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "Thèmes — Trace publique",
  "Parcourir les 8 thèmes de propositions suivis par Trace publique.",
  "/themes/",
);

export default function ThemesPage() {
  return (
    <main className="shell section">
      <header className="page-header">
        <p className="eyebrow">8 dossiers thématiques</p>
        <h1>Les sujets qui structurent le débat</h1>
        <p className="lede">Parcourez les propositions par grand sujet, avec leurs sources et leur état de vérification.</p>
      </header>
      <div className="directory-grid themes-directory">
        {themes.map((theme, index) => {
          const count = proposals.filter((proposal) => proposal.themeId === theme.id).length;
          return (
            <article className="theme-card" key={theme.id}>
              <span className="theme-index">{String(index + 1).padStart(2, "0")}</span>
              <h2><Link href={`/themes/${theme.id}`}>{theme.label}</Link></h2>
              <p>{count} proposition{count !== 1 ? "s" : ""} suivie{count !== 1 ? "s" : ""}</p>
            </article>
          );
        })}
      </div>
    </main>
  );
}

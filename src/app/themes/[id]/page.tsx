import Link from "next/link";
import { notFound } from "next/navigation";
import { candidates, getCandidate, getOverallScore, proposals, themes } from "@/lib/data";
import { pageMetadata } from "@/lib/seo";
import type { CSSProperties } from "react";

export const dynamicParams = false;

export function generateStaticParams() {
  return themes.map((theme) => ({ id: theme.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const theme = themes.find((item) => item.id === id);
  if (!theme) return pageMetadata("Thème introuvable — Trace publique", "Cette page thématique n’existe pas.", `/themes/${id}/`);
  return pageMetadata(`${theme.label} — Trace publique`, `Les propositions documentées sur le thème « ${theme.label} » pour la présidentielle française 2027.`, `/themes/${theme.id}/`);
}

export default async function ThemePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const theme = themes.find((item) => item.id === id);
  if (!theme) notFound();
  const themeProposals = proposals.filter((proposal) => proposal.themeId === id);

  return (
    <main className="shell section">
      <p className="breadcrumb"><Link href="/themes">Thèmes</Link> / {theme.label}</p>
      <header className="page-header">
        <p className="eyebrow">Dossier thématique</p>
        <h1>{theme.label}</h1>
        <p className="lede">Les propositions suivies sur ce thème, avec leurs sources et leur statut de vérification.</p>
      </header>
      <div className="proposal-list">
        {themeProposals.length === 0 ? (
          <div className="empty-state">Aucune proposition publiée pour le moment.</div>
        ) : themeProposals.map((proposal) => {
          const candidate = getCandidate(proposal.candidateId);
          const overallScore = getOverallScore(proposal);
          return (
            <article
              className="proposal-card"
              key={proposal.id}
              style={{ "--candidate-accent": candidate?.accent ?? "#111111" } as CSSProperties}
            >
              <div className="proposal-date">{proposal.publishedAt}</div>
              <div className="proposal-card-main">
                <div className="meta">
                  <span>{candidate?.name}</span>
                  {overallScore ? <span className="score-chip">Score documentaire IA · {overallScore.value}/100</span> : null}
                </div>
                <h3><Link href={`/propositions/${proposal.id}`}>{proposal.title}</Link></h3>
                <p>{proposal.summary}</p>
              </div>
            </article>
          );
        })}
      </div>
      <p className="directory-note">{candidates.length} candidatures sont suivies dans le périmètre initial.</p>
    </main>
  );
}

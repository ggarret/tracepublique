import { notFound } from "next/navigation";
import Link from "next/link";
import { evaluationCriteria, getCandidate, getOverallScore, getSources, getTheme, proposals, trackRecords } from "@/lib/data";
import { pageMetadata, siteUrl } from "@/lib/seo";
import { attributionReliabilityDescription } from "@/lib/site";
import { CandidatePortrait } from "@/components/candidate-portrait";
import { PartyMark } from "@/components/party-mark";
import type { CSSProperties } from "react";

function scoreColor(value: number) {
  if (value >= 70) return "#26734d";
  if (value >= 40) return "#ad7416";
  return "#ad4037";
}

const relationshipLabels = {
  context: "Contexte",
  continuity: "Continuité documentée",
  evolution: "Évolution",
  tension: "Tension à examiner",
  contradiction_confirmed: "Contradiction confirmée",
};

export const dynamicParams = false;

export function generateStaticParams() {
  return proposals.map((proposal) => ({ id: proposal.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const proposal = proposals.find((item) => item.id === id);
  if (!proposal) return pageMetadata("Proposition introuvable — Trace publique", "Cette proposition n’existe pas.", `/propositions/${id}/`);
  const candidate = getCandidate(proposal.candidateId);
  return pageMetadata(`${proposal.title} — Trace publique`, `${proposal.summary} Proposition suivie pour ${candidate?.name ?? "un candidat"}.`, `/propositions/${proposal.id}/`);
}

export default async function ProposalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const proposal = proposals.find((item) => item.id === id);
  if (!proposal) notFound();

  const candidate = getCandidate(proposal.candidateId);
  const theme = getTheme(proposal.themeId);
  const proposalSources = getSources(proposal);
  const overallScore = getOverallScore(proposal);
  const relatedRecords = trackRecords.filter((record) => record.relatedProposalIds.includes(proposal.id));
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: proposal.title,
    description: proposal.summary,
    datePublished: proposal.publishedAt,
    inLanguage: "fr-FR",
    author: { "@type": "Organization", name: "Trace publique" },
    isPartOf: { "@type": "WebSite", name: "Trace publique", url: `${siteUrl}/` },
  };

  return (
    <main className="shell section">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <p className="breadcrumb"><Link href="/">Propositions</Link> / {proposal.id}</p>
      <header className="proposal-header">
        <div className="meta">
          <span className="tag">{theme?.label}</span>
          <span className="status-pill">{proposal.status}</span>
          <span>{proposal.dateLabel ?? proposal.publishedAt}</span>
          <span>{proposal.attribution.label}</span>
        </div>
        <h1>{proposal.title}</h1>
        {candidate ? (
          <div className="proposal-author" style={{ "--candidate-accent": candidate.accent } as CSSProperties}>
            <CandidatePortrait {...candidate} size="avatar" />
            <div className="proposal-author-copy">
              <span>Proposition attribuée à</span>
              <strong>{candidate.name}</strong>
              <span>{candidate.party}</span>
            </div>
            <PartyMark {...candidate} />
          </div>
        ) : null}
      </header>

      <div className="proposal-layout">
        <article className="proposal-content">
          <p className="proposal-summary">{proposal.summary}</p>

          <section className="content-section" aria-labelledby="sources-title">
            <h2 id="sources-title">Sources utilisées</h2>
            <div className="source-list">
              {proposalSources.length === 0 ? <div className="empty-state">Sources à documenter.</div> : proposalSources.map((source) => (
                <div className="source-item" key={source.id}>
                  <span className="tag">{source.kind}</span>{" "}
                  <a href={source.url} target="_blank" rel="noreferrer">{source.title} ↗</a>
                  <p className="muted">Publié par {source.publisher}{source.publishedAt ? ` · ${source.publishedAt}` : ""}</p>
                  {source.excerpt && <blockquote>{source.excerpt}</blockquote>}
                </div>
              ))}
            </div>
          </section>

          <section className="content-section" aria-labelledby="history-title">
            <h2 id="history-title">Parcours et cohérence</h2>
            <p className="muted">Les précédents sont rapprochés sans forcer une conclusion. Une évolution n'est pas automatiquement une contradiction.</p>
            {relatedRecords.length === 0 ? (
              <div className="empty-state">Aucun précédent comparable n'est encore qualifié pour cette proposition.</div>
            ) : (
              <div className="record-list">
                {relatedRecords.map((record) => (
                  <article className={`record-card relationship-${record.relationship}`} key={record.id}>
                    <div className="record-meta"><span>{record.date}</span><strong>{relationshipLabels[record.relationship]}</strong></div>
                    <h3>{record.title}</h3>
                    <p>{record.summary}</p>
                    <p className="record-conclusion">{record.conclusion}</p>
                    <div className="source">
                      <span className="source-label">Preuve</span>
                      {record.sources.map((source) => <a href={source.url} target="_blank" rel="noreferrer" key={source.url}>{source.publisher} ↗</a>)}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="content-section" aria-labelledby="analyses-title">
            <h2 id="analyses-title">Ce que répondent les IA</h2>
            <p className="muted">Chaque modèle reçoit le même dossier. Les réponses restent séparées et ne remplacent pas la vérification des sources.</p>
            <div className="ai-grid">
              <article className="ai-card">
                <h3>GPT <span>analyse distincte</span></h3>
                <p>{proposal.analysis.gpt || "Analyse en préparation. Elle sera publiée avec le prompt et les sources utilisés."}</p>
              </article>
              <article className="ai-card">
                <h3>Claude <span>analyse distincte</span></h3>
                <p>{proposal.analysis.claude || "Analyse en préparation. Elle sera publiée avec le prompt et les sources utilisés."}</p>
              </article>
            </div>
          </section>

          <section className="content-section" aria-labelledby="notation-title">
            <div className="score-heading">
              <div>
                <p className="eyebrow">Score documentaire IA · {overallScore ? `${overallScore.value}/100` : "abstention"}</p>
                <h2 id="notation-title">Grille d’évaluation</h2>
              </div>
              {overallScore ? (
                <div className="overall-score" style={{ "--score-color": scoreColor(overallScore.value) } as CSSProperties}>
                  <strong>{overallScore.value}<span>/100</span></strong>
                  <small>provisoire</small>
                </div>
              ) : null}
            </div>
            <p className="score-disclaimer">Ce score /100 est produit avec assistance IA selon la grille publique, puis relu humainement. Il mesure la robustesse documentaire, jamais la qualité politique, la popularité, la légitimité ou un consensus GPT/Claude.</p>
            {proposal.scores.length === 0 ? (
              <div className="empty-state">Aucune note publiée. La notation apparaîtra après vérification humaine et documentation des critères.</div>
            ) : (
              <div className="score-list">
                {proposal.scores.map((score) => (
                  <div className="score-row" key={score.criterionId} style={score.value === undefined ? undefined : { "--score-color": scoreColor(score.value) } as CSSProperties}>
                    <div className="score-copy">
                      <strong>{evaluationCriteria.find((criterion) => criterion.id === score.criterionId)?.label ?? score.criterionId}</strong>
                      <span>{score.explanation}</span>
                      <small>Sources : {score.sourceIds.map((sourceId) => proposalSources.find((source) => source.id === sourceId)?.publisher).filter(Boolean).join(" · ")}</small>
                    </div>
                    <div className="score-result">
                      {score.value === undefined ? <b>Abstention</b> : <><b>{score.value}/100</b><span className="score-meter" aria-hidden="true"><i style={{ width: `${score.value}%` }} /></span></>}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <p><Link href="/evaluation">Consulter tous les critères →</Link></p>
          </section>
        </article>

        <aside className="audit-panel" aria-label="Traçabilité de la proposition">
          <div><span className="audit-label">Statut</span><span className="audit-value">{proposal.status}</span></div>
          <div><span className="audit-label">Fiabilité de l’attribution</span><span className="audit-value">{proposal.confidence}</span></div>
          <div><span className="audit-label">Évaluation</span><span className="audit-value">{proposal.evaluation.status} · grille {proposal.evaluation.methodologyVersion}</span></div>
          <div><span className="audit-label">Identifiant public</span><span className="audit-value">{proposal.id}</span></div>
          <p className="audit-help">{attributionReliabilityDescription}</p>
          <p className="audit-help">Les statuts, corrections et critères sont documentés dans la <Link href="/methode">méthode publique</Link>.</p>
        </aside>
      </div>
    </main>
  );
}

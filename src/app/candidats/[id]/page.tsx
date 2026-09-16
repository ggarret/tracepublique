import Link from "next/link";
import { notFound } from "next/navigation";
import { candidates, getOverallScore, getPrograms, getTheme, getTrackRecords, proposals } from "@/lib/data";
import { pageMetadata } from "@/lib/seo";
import { CandidatePortrait } from "@/components/candidate-portrait";
import { PartyMark } from "@/components/party-mark";
import type { CSSProperties } from "react";

const relationshipLabels = {
  context: "Contexte",
  continuity: "Continuité documentée",
  evolution: "Évolution",
  tension: "Tension à examiner",
  contradiction_confirmed: "Contradiction confirmée",
};

export const dynamicParams = false;

export function generateStaticParams() {
  return candidates.map((candidate) => ({ id: candidate.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const candidate = candidates.find((item) => item.id === id);
  if (!candidate) return pageMetadata("Candidat introuvable — Trace publique", "Cette page candidat n’existe pas.", `/candidats/${id}/`);
  return pageMetadata(`${candidate.name} — Trace publique`, `Les propositions publiques suivies pour ${candidate.name} (${candidate.party}) dans le cadre de la présidentielle 2027.`, `/candidats/${candidate.id}/`);
}

export default async function CandidatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const candidate = candidates.find((item) => item.id === id);
  if (!candidate) notFound();
  const candidateProposals = proposals.filter((proposal) => proposal.candidateId === id);
  const candidatePrograms = getPrograms(id);
  const candidateRecords = getTrackRecords(id);

  return (
    <main className="shell section">
      <p className="breadcrumb"><Link href="/candidats">Candidats</Link> / {candidate.name}</p>
      <div className="candidate-hero" style={{ "--candidate-accent": candidate.accent } as CSSProperties}>
        <CandidatePortrait {...candidate} size="large" />
        <div className="candidate-identity">
          <div className="candidate-party-lockup">
            <PartyMark {...candidate} size="medium" />
            <div>
              <p className="eyebrow">Formation politique</p>
              <strong>{candidate.party}</strong>
            </div>
          </div>
          <h1>{candidate.name}</h1>
          <p className="political-position">{candidate.politicalPosition}</p>
          <div className="candidate-stats">
            <span><strong>{candidateProposals.length}</strong> proposition{candidateProposals.length !== 1 ? "s" : ""}</span>
            <span><strong>{candidatePrograms.length}</strong> document{candidatePrograms.length !== 1 ? "s" : ""} officiel{candidatePrograms.length !== 1 ? "s" : ""}</span>
            <span><strong>{candidateRecords.length}</strong> précédent{candidateRecords.length !== 1 ? "s" : ""} qualifié{candidateRecords.length !== 1 ? "s" : ""}</span>
          </div>
        </div>
      </div>
      <section className="program-section" aria-labelledby="programmes-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Sources de référence</p>
            <h2 id="programmes-title">Programmes et documents officiels</h2>
          </div>
          <p>{candidatePrograms.length} source{candidatePrograms.length !== 1 ? "s" : ""} repérée{candidatePrograms.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="program-list">
          {candidatePrograms.map((program) => (
            <article className="program-card" key={program.id}>
              <p className="eyebrow">{program.status.replaceAll("_", " ")}</p>
              <h3><a href={program.url} target="_blank" rel="noreferrer">{program.title} ↗</a></h3>
              <p>{program.note}</p>
              <p className="muted">Source : {program.publisher} · vérifiée le {program.checkedAt}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="record-section" aria-labelledby="records-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Votes, fonctions et positions antérieures</p>
            <h2 id="records-title">Parcours et cohérence</h2>
          </div>
          <p>{candidateRecords.length} élément{candidateRecords.length !== 1 ? "s" : ""} sourcé{candidateRecords.length !== 1 ? "s" : ""}</p>
        </div>
        <p className="record-intro">Trace publique ne transforme pas chaque changement en contradiction. Les rapprochements distinguent le contexte, la continuité, l'évolution, la tension et la contradiction confirmée.</p>
        {candidateRecords.length === 0 ? (
          <div className="empty-state">Aucun précédent comparable n'est encore qualifié. Cela ne signifie pas qu'il n'en existe pas.</div>
        ) : (
          <div className="record-list">
            {candidateRecords.map((record) => (
              <article className={`record-card relationship-${record.relationship}`} key={record.id}>
                <div className="record-meta"><span>{record.date}</span><strong>{relationshipLabels[record.relationship]}</strong></div>
                <h3>{record.title}</h3>
                <p>{record.summary}</p>
                <p className="record-conclusion">{record.conclusion}</p>
                <div className="source"><span className="source-label">Preuve</span>{record.sources.map((source) => <a href={source.url} target="_blank" rel="noreferrer" key={source.url}>{source.publisher} ↗</a>)}</div>
              </article>
            ))}
          </div>
        )}
      </section>
      <div className="section-heading">
        <div>
          <p className="eyebrow">Prises de position</p>
          <h2>Propositions documentées</h2>
        </div>
        <p>{candidateProposals.length} élément{candidateProposals.length !== 1 ? "s" : ""}</p>
      </div>
      <div className="proposal-list">
        {candidateProposals.length === 0 ? (
          <div className="empty-state">Aucune proposition publiée pour le moment.</div>
        ) : candidateProposals.map((proposal) => {
          const overallScore = getOverallScore(proposal);
          return (
            <article className="proposal-card" key={proposal.id} style={{ "--candidate-accent": candidate.accent } as CSSProperties}>
              <div className="proposal-date">{proposal.dateLabel ?? proposal.publishedAt}</div>
              <div className="proposal-card-main">
                <div className="meta">
                  <span className="tag">{getTheme(proposal.themeId)?.label}</span>
                  <span>{proposal.attribution.label}</span>
                  {overallScore ? <span className="score-chip">Note IA · {overallScore.value}/100</span> : null}
                </div>
                <h3><Link href={`/propositions/${proposal.id}`}>{proposal.title}</Link></h3>
                <p>{proposal.summary}</p>
              </div>
            </article>
          );
        })}
      </div>
    </main>
  );
}

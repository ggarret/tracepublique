"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { CandidatePortrait } from "@/components/candidate-portrait";
import { PartyMark } from "@/components/party-mark";
import type { Candidate, Proposal, Source, Theme } from "@/lib/types";
import { getOverallScore } from "@/lib/data";

type Props = { proposals: Proposal[]; candidates: Candidate[]; themes: Theme[]; sources: Source[] };

const formatDate = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export function ProposalFeed({ proposals, candidates, themes, sources }: Props) {
  const [query, setQuery] = useState("");
  const [themeId, setThemeId] = useState("all");
  const [candidateId, setCandidateId] = useState("all");

  const filteredProposals = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("fr");
    return proposals.filter((proposal) => {
      const candidate = candidates.find((item) => item.id === proposal.candidateId);
      const theme = themes.find((item) => item.id === proposal.themeId);
      const searchableText = [proposal.title, proposal.summary, candidate?.name, theme?.label]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase("fr");
      return (
        (themeId === "all" || proposal.themeId === themeId) &&
        (candidateId === "all" || proposal.candidateId === candidateId) &&
        (!normalizedQuery || searchableText.includes(normalizedQuery))
      );
    });
  }, [candidateId, candidates, proposals, query, themeId, themes]);

  return (
    <>
      <div className="filters" aria-label="Filtres des propositions">
        <div className="filter-field">
          <label htmlFor="proposal-search">Rechercher</label>
          <input
            id="proposal-search"
            className="filter-input"
            type="search"
            placeholder="Un sujet, une mesure, un candidat…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <div className="filter-field">
          <label htmlFor="theme-filter">Thème</label>
          <select id="theme-filter" className="filter-select" value={themeId} onChange={(event) => setThemeId(event.target.value)}>
            <option value="all">Tous les thèmes</option>
            {themes.map((theme) => <option key={theme.id} value={theme.id}>{theme.label}</option>)}
          </select>
        </div>
        <div className="filter-field">
          <label htmlFor="candidate-filter">Candidat</label>
          <select id="candidate-filter" className="filter-select" value={candidateId} onChange={(event) => setCandidateId(event.target.value)}>
            <option value="all">Tous les candidats</option>
            {candidates.map((candidate) => <option key={candidate.id} value={candidate.id}>{candidate.name}</option>)}
          </select>
        </div>
      </div>

      <p className="results-count" aria-live="polite">
        {filteredProposals.length} proposition{filteredProposals.length !== 1 ? "s" : ""} affichée{filteredProposals.length !== 1 ? "s" : ""}
      </p>

      {filteredProposals.length === 0 ? (
        <div className="empty-state">Aucune proposition ne correspond à cette recherche.</div>
      ) : (
        <div className="proposal-list">
          {filteredProposals.map((proposal) => {
            const candidate = candidates.find((item) => item.id === proposal.candidateId);
            const theme = themes.find((item) => item.id === proposal.themeId);
            const overallScore = getOverallScore(proposal);
            return (
              <article
                className="proposal-card"
                key={proposal.id}
                style={{ "--candidate-accent": candidate?.accent ?? "#111111" } as CSSProperties}
              >
                <div className="proposal-rail">
                  {candidate ? <CandidatePortrait {...candidate} size="avatar" /> : null}
                  <div className="proposal-date">{proposal.dateLabel ?? formatDate.format(new Date(proposal.publishedAt))}</div>
                </div>
                <div className="proposal-card-main">
                  <div className="meta">
                    {candidate ? <PartyMark {...candidate} /> : null}
                    <span className="candidate-name">{candidate?.name}</span>
                    <span className="tag">{theme?.label}</span>
                    <span className="status-pill">{proposal.status}</span>
                    <span>Fiabilité de l’attribution : {proposal.confidence}</span>
                    {overallScore ? <span className="score-chip">Score documentaire IA · {overallScore.value}/100</span> : null}
                  </div>
                  <h3><Link href={`/propositions/${proposal.id}`}>{proposal.title}</Link></h3>
                  <p>{proposal.summary}</p>
                  <p className="attribution-note">{proposal.attribution.label}</p>
                  <SourceSummary proposal={proposal} sources={sources} />
                </div>
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}

function SourceSummary({ proposal, sources }: { proposal: Proposal; sources: Source[] }) {
  const proposalSources = proposal.sourceIds.map((id) => sources.find((source) => source.id === id)).filter(Boolean) as Source[];
  if (proposalSources.length === 0) return <div className="source">Sources à documenter.</div>;
  return (
    <div className="source">
      <span className="source-label">Source{proposalSources.length > 1 ? "s" : ""}</span>
      <span>{proposalSources.map((source, index) => <span key={source.id}>{index > 0 ? " · " : ""}<a href={source.url} target="_blank" rel="noreferrer">{source.publisher} ↗</a></span>)}</span>
    </div>
  );
}

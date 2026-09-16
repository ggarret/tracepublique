import candidatesJson from "@/../data/candidates.json";
import proposalsJson from "@/../data/proposals.json";
import sourcesJson from "@/../data/sources.json";
import themesJson from "@/../data/themes.json";
import programsJson from "@/../data/programs.json";
import evaluationCriteriaJson from "@/../data/evaluation-criteria.json";
import trackRecordsJson from "@/../data/track-records.json";
import type { Candidate, EvaluationCriterion, Program, Proposal, Source, Theme, TrackRecord } from "./types";

export const candidates = candidatesJson as Candidate[];
export const themes = themesJson as Theme[];
export const proposals = [...(proposalsJson as Proposal[])].sort((a, b) =>
  b.publishedAt.localeCompare(a.publishedAt),
);
export const sources = sourcesJson as Source[];
export const programs = programsJson as Program[];
export const evaluationCriteria = evaluationCriteriaJson as EvaluationCriterion[];
export const trackRecords = [...(trackRecordsJson as TrackRecord[])].sort((a, b) => b.date.localeCompare(a.date));

/** Résout un candidat depuis son identifiant stable de référentiel. */
export function getCandidate(id: string) {
  return candidates.find((candidate) => candidate.id === id);
}

/** Résout un thème depuis son identifiant stable de référentiel. */
export function getTheme(id: string) {
  return themes.find((theme) => theme.id === id);
}

/** Retourne les sources déclarées par une proposition. */
export function getSources(proposal: Proposal) {
  return proposal.sourceIds.map((id) => sources.find((source) => source.id === id)).filter(Boolean) as Source[];
}

/** Retourne les programmes connus pour un candidat. */
export function getPrograms(candidateId: string) {
  return programs.filter((program) => program.candidateId === candidateId);
}

/** Retourne les éléments de parcours documentés pour un candidat. */
export function getTrackRecords(candidateId: string) {
  return trackRecords.filter((record) => record.candidateId === candidateId);
}

/** Calcule la moyenne pondérée sur les six critères de la grille publique. */
export function getOverallScore(proposal: Proposal) {
  const scores = proposal.scores
    .map((score) => ({ score, criterion: evaluationCriteria.find((criterion) => criterion.id === score.criterionId) }))
    .filter((item): item is { score: Proposal["scores"][number]; criterion: EvaluationCriterion } => Boolean(item.criterion));

  if (scores.length !== evaluationCriteria.length) return null;
  const totalWeight = scores.reduce((total, item) => total + item.criterion.weight, 0);
  const weightedValue = scores.reduce((total, item) => total + item.score.value * item.criterion.weight, 0);
  return {
    value: Math.round(weightedValue / totalWeight),
    coverage: totalWeight,
  };
}

import { readFile } from "node:fs/promises";

const readJson = async (path) => JSON.parse(await readFile(path, "utf8"));
const candidates = await readJson("data/candidates.json");
const themes = await readJson("data/themes.json");
const proposals = await readJson("data/proposals.json");
const sources = await readJson("data/sources.json");
const criteria = await readJson("data/evaluation-criteria.json");
const trackRecords = await readJson("data/track-records.json");

const errors = [];
const candidateIds = new Set(candidates.map((item) => item.id));
const themeIds = new Set(themes.map((item) => item.id));
const proposalIds = new Set();
const fingerprints = new Map();
const sourceIds = new Set();
const sourceUrls = new Set();
const criterionIds = new Set(criteria.map((item) => item.id));

if (criteria.reduce((total, criterion) => total + criterion.weight, 0) !== 100) {
  errors.push("La somme des pondérations de la grille doit être égale à 100");
}

const normalize = (value) => value
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLocaleLowerCase("fr")
  .replace(/[^a-z0-9]+/g, " ")
  .trim();

for (const proposal of proposals) {
  if (proposalIds.has(proposal.id)) errors.push(`ID de proposition dupliqué : ${proposal.id}`);
  proposalIds.add(proposal.id);

  if (!candidateIds.has(proposal.candidateId)) errors.push(`${proposal.id}: candidat inconnu (${proposal.candidateId})`);
  if (!themeIds.has(proposal.themeId)) errors.push(`${proposal.id}: thème inconnu (${proposal.themeId})`);
  if (!proposal.title?.trim()) errors.push(`${proposal.id}: titre manquant`);
  if (!Array.isArray(proposal.sourceIds) || proposal.sourceIds.length === 0) errors.push(`${proposal.id}: source manquante`);
  if (!proposal.attribution?.kind || !proposal.attribution?.label) errors.push(`${proposal.id}: attribution manquante`);
  if (!proposal.evaluation?.methodologyVersion || !proposal.evaluation?.evaluatedAt) errors.push(`${proposal.id}: métadonnées d'évaluation manquantes`);
  if (!Array.isArray(proposal.scores) || proposal.scores.length !== criteria.length) errors.push(`${proposal.id}: les ${criteria.length} critères doivent être notés`);

  const seenCriteria = new Set();
  for (const score of proposal.scores ?? []) {
    if (!criterionIds.has(score.criterionId)) errors.push(`${proposal.id}: critère inconnu (${score.criterionId})`);
    if (seenCriteria.has(score.criterionId)) errors.push(`${proposal.id}: critère dupliqué (${score.criterionId})`);
    seenCriteria.add(score.criterionId);
    if (!Number.isFinite(score.value) || score.value < 0 || score.value > 100) errors.push(`${proposal.id}/${score.criterionId}: note hors intervalle 0-100`);
    if (!score.explanation?.trim()) errors.push(`${proposal.id}/${score.criterionId}: justification manquante`);
    if (!Array.isArray(score.sourceIds) || score.sourceIds.length === 0) errors.push(`${proposal.id}/${score.criterionId}: source de notation manquante`);
  }

  const fingerprint = [proposal.candidateId, proposal.themeId, normalize(proposal.title)].join("|");
  const previous = fingerprints.get(fingerprint);
  if (previous) errors.push(`${proposal.id}: doublon probable de ${previous}`);
  fingerprints.set(fingerprint, proposal.id);
}

for (const source of sources) {
  if (sourceIds.has(source.id)) errors.push(`ID de source dupliqué : ${source.id}`);
  sourceIds.add(source.id);
  if (!Array.isArray(source.proposalIds) || source.proposalIds.length === 0) errors.push(`${source.id}: propositions liées manquantes`);
  for (const proposalId of source.proposalIds ?? []) {
    if (!proposalIds.has(proposalId)) errors.push(`${source.id}: proposition inconnue (${proposalId})`);
  }
  if (!/^https?:\/\//.test(source.url ?? "")) errors.push(`${source.id}: URL invalide`);
  if (sourceUrls.has(source.url)) errors.push(`URL de source dupliquée : ${source.url}`);
  sourceUrls.add(source.url);
}

for (const proposal of proposals) {
  for (const sourceId of proposal.sourceIds ?? []) {
    if (!sourceIds.has(sourceId)) errors.push(`${proposal.id}: source inconnue (${sourceId})`);
    const source = sources.find((item) => item.id === sourceId);
    if (source && !source.proposalIds?.includes(proposal.id)) errors.push(`${proposal.id}: le rattachement inverse manque dans ${sourceId}`);
  }
  for (const score of proposal.scores ?? []) {
    for (const sourceId of score.sourceIds ?? []) {
      if (!proposal.sourceIds.includes(sourceId)) errors.push(`${proposal.id}/${score.criterionId}: la source ${sourceId} n'appartient pas au dossier`);
    }
  }
}

for (const record of trackRecords) {
  if (!candidateIds.has(record.candidateId)) errors.push(`${record.id}: candidat de parcours inconnu (${record.candidateId})`);
  if (!themeIds.has(record.themeId)) errors.push(`${record.id}: thème de parcours inconnu (${record.themeId})`);
  if (!record.conclusion?.trim()) errors.push(`${record.id}: conclusion manquante`);
  if (!Array.isArray(record.sources) || record.sources.length === 0) errors.push(`${record.id}: source manquante`);
  for (const proposalId of record.relatedProposalIds ?? []) {
    if (!proposalIds.has(proposalId)) errors.push(`${record.id}: proposition liée inconnue (${proposalId})`);
  }
}

if (errors.length > 0) {
  console.error("Validation échouée :");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Données valides : ${candidates.length} candidats, ${themes.length} thèmes, ${proposals.length} propositions, ${sources.length} sources, ${trackRecords.length} précédents.`);

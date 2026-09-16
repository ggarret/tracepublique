import { readFile } from "node:fs/promises";

const FILES = {
  candidates: "data/candidates.json",
  themes: "data/themes.json",
  proposals: "data/proposals.json",
  sources: "data/sources.json",
  criteria: "data/evaluation-criteria.json",
  trackRecords: "data/track-records.json",
};

const ALLOWED_PROPOSAL_STATUSES = new Set(["validée", "publiée"]);
const FORBIDDEN_PUBLIC_STATUSES = new Set(["à vérifier", "a_verifier", "a_revoir", "revue_humaine"]);
const SOURCE_KINDS = new Set(["primaire", "secondaire", "contextuelle"]);

const errors = [];
const addError = (message) => errors.push(message);

const readJson = async (label, path) => {
  try {
    return JSON.parse(await readFile(path, "utf8"));
  } catch (error) {
    addError(`${label}: JSON illisible (${error.message})`);
    return null;
  }
};

const isNonEmptyString = (value) => typeof value === "string" && value.trim().length > 0;
const isIsoDate = (value) => isNonEmptyString(value) && !Number.isNaN(Date.parse(value));
const requireFields = (item, fields, label) => {
  for (const field of fields) {
    if (item?.[field] === undefined || item?.[field] === null || (typeof item[field] === "string" && !item[field].trim())) {
      addError(`${label}: champ obligatoire absent ou vide: ${field}`);
    }
  }
};

const uniqueIds = (items, label) => {
  const ids = new Set();
  for (const [index, item] of (Array.isArray(items) ? items : []).entries()) {
    if (!isNonEmptyString(item?.id)) addError(`${label}[${index}]: identifiant manquant`);
    else if (ids.has(item.id)) addError(`${label}: identifiant dupliqué: ${item.id}`);
    else ids.add(item.id);
  }
  return ids;
};

const candidates = await readJson("candidats", FILES.candidates);
const themes = await readJson("thèmes", FILES.themes);
const proposals = await readJson("propositions", FILES.proposals);
const sources = await readJson("sources", FILES.sources);
const criteria = await readJson("critères", FILES.criteria);
const trackRecords = await readJson("parcours", FILES.trackRecords);

for (const [label, items] of [["candidats", candidates], ["thèmes", themes], ["propositions", proposals], ["sources", sources], ["critères", criteria], ["parcours", trackRecords]]) {
  if (!Array.isArray(items)) addError(`${label}: le fichier doit contenir un tableau JSON`);
}

const candidateIds = uniqueIds(candidates, "candidats");
const themeIds = uniqueIds(themes, "thèmes");
const proposalIds = uniqueIds(proposals, "propositions");
const sourceIds = uniqueIds(sources, "sources");
const sourceUrls = new Set();
const criterionIds = uniqueIds(criteria, "critères");
if ((criteria ?? []).reduce((total, criterion) => total + (criterion.weight ?? 0), 0) !== 100) addError("critères: la somme des pondérations doit être égale à 100");

for (const [index, proposal] of (Array.isArray(proposals) ? proposals : []).entries()) {
  const label = `propositions[${index}] (${proposal.id ?? "id absent"})`;
  requireFields(proposal, ["id", "candidateId", "themeId", "title", "summary", "publishedAt", "status", "confidence", "attribution", "sourceIds", "analysis", "evaluation", "scores"], label);
  if (!candidateIds.has(proposal.candidateId)) addError(`${label}: candidat inconnu: ${proposal.candidateId}`);
  if (!themeIds.has(proposal.themeId)) addError(`${label}: thème inconnu: ${proposal.themeId}`);
  if (!isIsoDate(proposal.publishedAt)) addError(`${label}: publishedAt doit être une date valide`);
  if (!ALLOWED_PROPOSAL_STATUSES.has(proposal.status)) {
    addError(`${label}: statut non autorisé: ${proposal.status ?? "absent"} (attendu: validée ou publiée)`);
  }
  if (FORBIDDEN_PUBLIC_STATUSES.has(proposal.status)) {
    addError(`${label}: proposition encore à vérifier ou en revue: ${proposal.status}`);
  }
  if (!Array.isArray(proposal.sourceIds) || proposal.sourceIds.length === 0) {
    addError(`${label}: au moins une source est obligatoire`);
  }
  if (!proposal.analysis || typeof proposal.analysis !== "object" || !("gpt" in proposal.analysis) || !("claude" in proposal.analysis)) addError(`${label}: états d'analyse GPT et Claude manquants`);
  if (!isNonEmptyString(proposal.attribution?.kind) || !isNonEmptyString(proposal.attribution?.label)) addError(`${label}: attribution incomplète`);
  if (!isNonEmptyString(proposal.evaluation?.methodologyVersion) || !isIsoDate(proposal.evaluation?.evaluatedAt)) addError(`${label}: métadonnées d'évaluation incomplètes`);
  if (!Array.isArray(proposal.scores) || proposal.scores.length !== criterionIds.size) addError(`${label}: les ${criterionIds.size} critères doivent être présents`);
  const seenCriteria = new Set();
  for (const score of proposal.scores ?? []) {
    if (!criterionIds.has(score.criterionId)) addError(`${label}: critère inconnu: ${score.criterionId}`);
    if (seenCriteria.has(score.criterionId)) addError(`${label}: critère dupliqué: ${score.criterionId}`);
    seenCriteria.add(score.criterionId);
    if (!Number.isFinite(score.value) || score.value < 0 || score.value > 100) addError(`${label}: note invalide pour ${score.criterionId}`);
    if (!isNonEmptyString(score.explanation)) addError(`${label}: justification absente pour ${score.criterionId}`);
    if (!Array.isArray(score.sourceIds) || score.sourceIds.length === 0) addError(`${label}: preuve absente pour ${score.criterionId}`);
  }
  for (const sourceId of proposal.sourceIds ?? []) {
    if (!sourceIds.has(sourceId)) addError(`${label}: source inconnue: ${sourceId}`);
  }
  for (const score of proposal.scores ?? []) {
    for (const sourceId of score.sourceIds ?? []) {
      if (!proposal.sourceIds?.includes(sourceId)) addError(`${label}: la preuve ${sourceId} n'appartient pas au dossier`);
    }
  }
}

for (const [index, record] of (Array.isArray(trackRecords) ? trackRecords : []).entries()) {
  const label = `parcours[${index}] (${record.id ?? "id absent"})`;
  requireFields(record, ["id", "candidateId", "themeId", "kind", "title", "summary", "date", "relationship", "conclusion", "relatedProposalIds", "sources"], label);
  if (!candidateIds.has(record.candidateId)) addError(`${label}: candidat inconnu: ${record.candidateId}`);
  if (!themeIds.has(record.themeId)) addError(`${label}: thème inconnu: ${record.themeId}`);
  if (!isIsoDate(record.date)) addError(`${label}: date invalide`);
  if (!Array.isArray(record.sources) || record.sources.length === 0) addError(`${label}: source manquante`);
  for (const proposalId of record.relatedProposalIds ?? []) if (!proposalIds.has(proposalId)) addError(`${label}: proposition liée inconnue: ${proposalId}`);
}

for (const [index, source] of (Array.isArray(sources) ? sources : []).entries()) {
  const label = `sources[${index}] (${source.id ?? "id absent"})`;
  requireFields(source, ["id", "proposalIds", "kind", "title", "publisher", "url", "accessedAt"], label);
  if (!Array.isArray(source.proposalIds) || source.proposalIds.length === 0) addError(`${label}: au moins une proposition liée est obligatoire`);
  for (const proposalId of source.proposalIds ?? []) {
    if (!proposalIds.has(proposalId)) addError(`${label}: proposition inconnue: ${proposalId}`);
  }
  if (!SOURCE_KINDS.has(source.kind)) addError(`${label}: type de source non autorisé: ${source.kind ?? "absent"}`);
  if (!/^https?:\/\//.test(source.url ?? "")) addError(`${label}: URL invalide`);
  if (sourceUrls.has(source.url)) addError(`${label}: URL de source dupliquée: ${source.url}`);
  sourceUrls.add(source.url);
  if (!isIsoDate(source.accessedAt)) addError(`${label}: accessedAt doit être une date valide`);
  if (source.publishedAt !== undefined && !isIsoDate(source.publishedAt)) addError(`${label}: publishedAt doit être une date valide`);
}

const sourcesByProposal = new Map();
for (const source of sources ?? []) {
  for (const proposalId of source.proposalIds ?? []) {
    if (!sourcesByProposal.has(proposalId)) sourcesByProposal.set(proposalId, new Set());
    sourcesByProposal.get(proposalId).add(source.id);
  }
}
for (const proposal of proposals ?? []) {
  for (const sourceId of sourcesByProposal.get(proposal.id) ?? []) {
    if (!proposal.sourceIds?.includes(sourceId)) addError(`propositions (${proposal.id}): la source ${sourceId} ne figure pas dans sourceIds`);
  }
}

const counts = {
  candidates: candidates?.length ?? 0,
  themes: themes?.length ?? 0,
  proposals: proposals?.length ?? 0,
  sources: sources?.length ?? 0,
};

if (errors.length > 0) {
  console.error("Validation du snapshot public échouée.");
  console.error(`Corpus inspecté : ${counts.proposals} proposition(s), ${counts.sources} source(s), ${counts.candidates} candidat(s), ${counts.themes} thème(s).`);
  console.error(`Blocages détectés : ${errors.length}`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("Validation du snapshot public réussie.");
console.log(`Corpus cohérent : ${counts.proposals} proposition(s), ${counts.sources} source(s), ${counts.candidates} candidat(s), ${counts.themes} thème(s).`);

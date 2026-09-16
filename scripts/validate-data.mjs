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

const expectedBands = [
  [0, 19],
  [20, 39],
  [40, 59],
  [60, 79],
  [80, 100],
];

const uncertaintyLevels = new Set(["faible", "moyenne", "forte"]);
const hasText = (value) => typeof value === "string" && value.trim().length > 0;

const isVersionedReference = (value) =>
  value && typeof value === "object" && hasText(value.id) && hasText(value.version);

const isUncertainty = (value) =>
  value && typeof value === "object" && uncertaintyLevels.has(value.level) &&
  Array.isArray(value.reasons) && value.reasons.length > 0 &&
  (value.interval === undefined || (
    Number.isInteger(value.interval.min) && Number.isInteger(value.interval.max) &&
    value.interval.min >= 0 && value.interval.max <= 100 && value.interval.min <= value.interval.max
  ));

const isAbstention = (value) =>
  value && typeof value === "object" && hasText(value.reason) &&
  Array.isArray(value.missingInformation) && value.missingInformation.length > 0 &&
  Array.isArray(value.reconsiderationConditions) && value.reconsiderationConditions.length > 0;

/**
 * Contrat additionnel des évaluations 2.0.
 * Les évaluations 1.0 retournent volontairement zéro erreur pour préserver
 * le corpus historique, qui n'est ni enrichi ni recalculé par cette version.
 */
export function validateEvaluationContract(proposal, criteria, availableSourceIds = new Set()) {
  const errors = [];
  const label = proposal?.id ?? "proposition sans identifiant";
  if (proposal?.evaluation?.methodologyVersion !== "2.0") return errors;

  const evaluation = proposal.evaluation;
  if (evaluation.status !== "provisoire" && evaluation.status !== "validée" && evaluation.status !== "abstention") {
    errors.push(`${label}: statut d'évaluation 2.0 invalide`);
  }
  if (evaluation.scoreLabel !== "robustesse-documentaire") {
    errors.push(`${label}: une évaluation 2.0 doit nommer le score de robustesse documentaire`);
  }
  if (evaluation.gridVersion !== "2.0") errors.push(`${label}: version de grille 2.0 obligatoire`);
  if (!isVersionedReference(evaluation.corpus) && !isVersionedReference(evaluation.prompt)) {
    errors.push(`${label}: corpus ou prompt versionné obligatoire pour une évaluation 2.0`);
  }
  if (evaluation.corpus !== undefined && !isVersionedReference(evaluation.corpus)) {
    errors.push(`${label}: corpus doit contenir un identifiant et une version`);
  }
  if (evaluation.prompt !== undefined && !isVersionedReference(evaluation.prompt)) {
    errors.push(`${label}: prompt doit contenir un identifiant et une version`);
  }
  if (!evaluation.reviewer || !hasText(evaluation.reviewer.id) || !hasText(evaluation.reviewer.role)) {
    errors.push(`${label}: relecteur avec identifiant et rôle obligatoire pour une évaluation 2.0`);
  }
  if (!isUncertainty(evaluation.uncertainty)) {
    errors.push(`${label}: incertitude globale invalide ou incomplète pour une évaluation 2.0`);
  }
  if (!isUncertainty(evaluation.confidence)) {
    errors.push(`${label}: confiance globale invalide ou incomplète pour une évaluation 2.0`);
  }

  const abstainedScores = (proposal.scores ?? []).filter((score) => score.abstention !== undefined);
  if (evaluation.status === "abstention") {
    if (!isAbstention(evaluation.abstention)) {
      errors.push(`${label}: abstention globale avec raison, informations manquantes et réexamen obligatoire`);
    }
    if (abstainedScores.length === 0) {
      errors.push(`${label}: une abstention 2.0 doit être portée par au moins un critère abstenu`);
    }
    if (evaluation.aggregation !== undefined) {
      errors.push(`${label}: une évaluation abstention ne peut pas déclarer d'agrégation`);
    }
  } else {
    if (evaluation.abstention !== undefined) {
      errors.push(`${label}: une abstention ne peut être déclarée que par le statut abstention`);
    }
    if (abstainedScores.length > 0) {
      errors.push(`${label}: un critère abstenu impose le statut global abstention`);
    }
    const aggregation = evaluation.aggregation;
    if (!aggregation || aggregation.method !== "moyenne-ponderee" || aggregation.gridVersion !== "2.0" || aggregation.criterionCount !== criteria.length || aggregation.rounding !== "nearest-integer") {
      errors.push(`${label}: agrégation 2.0 invalide (méthode, grille, critères ou arrondi manquant)`);
    }
  }

  for (const score of proposal.scores ?? []) {
    const scoreLabel = `${label}/${score.criterionId}`;
    if (score.abstention !== undefined) {
      if (score.value !== undefined) errors.push(`${scoreLabel}: une abstention ne peut pas être codée avec une valeur`);
      if (score.band !== undefined) errors.push(`${scoreLabel}: une abstention ne peut pas déclarer de bande`);
      if (!isAbstention(score.abstention)) errors.push(`${scoreLabel}: abstention sans motif et conditions de réexamen complets`);
      continue;
    }
    if (!Array.isArray(score.observedFacts) || score.observedFacts.length === 0) {
      errors.push(`${scoreLabel}: faits observés obligatoires pour une évaluation 2.0`);
    }
    if (!Array.isArray(score.missingInformation)) {
      errors.push(`${scoreLabel}: informations manquantes obligatoires pour une évaluation 2.0`);
    }
    if (!isUncertainty(score.uncertainty)) {
      errors.push(`${scoreLabel}: incertitude par critère invalide ou incomplète pour une évaluation 2.0`);
    }
    const criterion = criteria.find((item) => item.id === score.criterionId);
    const band = criterion?.bands.find((item) => score.value >= item.min && score.value <= item.max);
    if (!band || score.band?.min !== band.min || score.band?.max !== band.max || score.band?.label !== band.label) {
      errors.push(`${scoreLabel}: bande déclarée incohérente ou absente pour une évaluation 2.0`);
    }
    for (const sourceId of score.sourceIds ?? []) {
      if (availableSourceIds.size > 0 && !availableSourceIds.has(sourceId)) {
        errors.push(`${scoreLabel}: source inconnue (${sourceId})`);
      }
    }
  }
  return errors;
}

for (const criterion of criteria) {
  if (criterion.gridVersion !== "2.0") errors.push(`${criterion.id}: version de grille absente ou invalide`);
  if (!Array.isArray(criterion.evidenceDimensions) || criterion.evidenceDimensions.length < 2) {
    errors.push(`${criterion.id}: éléments observables manquants`);
  }
  if (!Array.isArray(criterion.bands) || criterion.bands.length !== expectedBands.length) {
    errors.push(`${criterion.id}: la grille doit avoir cinq bandes`);
    continue;
  }
  criterion.bands.forEach((band, index) => {
    const expected = expectedBands[index];
    if (band.min !== expected[0] || band.max !== expected[1]) {
      errors.push(`${criterion.id}: bande ${index + 1} incorrecte (${band.min}-${band.max})`);
    }
    if (!band.label?.trim() || !band.anchor?.trim()) {
      errors.push(`${criterion.id}: bande ${index + 1} sans libellé ou ancre observable`);
    }
  });
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
  errors.push(...validateEvaluationContract(proposal, criteria, sourceIds));

  const seenCriteria = new Set();
  for (const score of proposal.scores ?? []) {
    if (!criterionIds.has(score.criterionId)) errors.push(`${proposal.id}: critère inconnu (${score.criterionId})`);
    if (seenCriteria.has(score.criterionId)) errors.push(`${proposal.id}: critère dupliqué (${score.criterionId})`);
    seenCriteria.add(score.criterionId);
    if (score.abstention === undefined && (!Number.isInteger(score.value) || score.value < 0 || score.value > 100)) errors.push(`${proposal.id}/${score.criterionId}: note entière hors intervalle 0-100`);
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

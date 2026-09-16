import { readFile } from "node:fs/promises";

const path = process.argv[2] ?? "tests/fixtures/ai-analysis.json";
const errors = [];

const isObject = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
const isNonEmptyString = (value) => typeof value === "string" && value.trim().length > 0;
const isStringArray = (value) => Array.isArray(value) && value.every(isNonEmptyString);
const checkString = (value, label) => {
  if (!isNonEmptyString(value)) errors.push(`${label} doit être une chaîne non vide.`);
};
const checkStringArray = (value, label) => {
  if (!isStringArray(value)) errors.push(`${label} doit être une liste de chaînes non vides.`);
};

let document;
try {
  document = JSON.parse(await readFile(path, "utf8"));
} catch (error) {
  console.error(`Analyse IA illisible (${path}) : ${error.message}`);
  process.exit(1);
}

if (!isObject(document)) errors.push("Le document racine doit être un objet.");
if (document?.schemaVersion !== "1.0") errors.push("schemaVersion doit être \"1.0\".");
checkString(document?.comparisonId, "comparisonId");
if (typeof document?.fixture !== "boolean") errors.push("fixture doit être un booléen.");
checkString(document?.dossierId, "dossierId");

const corpus = document?.corpus;
if (!isObject(corpus)) {
  errors.push("corpus doit être un objet.");
} else {
  checkString(corpus.id, "corpus.id");
  checkString(corpus.version, "corpus.version");
  checkStringArray(corpus.sourceIds, "corpus.sourceIds");
  if (new Set(corpus.sourceIds ?? []).size !== (corpus.sourceIds ?? []).length) {
    errors.push("corpus.sourceIds ne doit pas contenir de doublon.");
  }
}

const sourceIds = new Set(corpus?.sourceIds ?? []);
const analysisNames = ["gpt", "claude"];
const analyses = document?.analyses;
if (!isObject(analyses)) errors.push("analyses doit être un objet.");

for (const name of analysisNames) {
  const analysis = analyses?.[name];
  const prefix = `analyses.${name}`;
  if (!isObject(analysis)) {
    errors.push(`${prefix} doit être un objet.`);
    continue;
  }
  checkString(analysis.modelVersion, `${prefix}.modelVersion`);
  if (!isNonEmptyString(analysis.analyzedAt) || Number.isNaN(Date.parse(analysis.analyzedAt))) {
    errors.push(`${prefix}.analyzedAt doit être une date ISO valide.`);
  }
  if (!isObject(analysis.prompt)) errors.push(`${prefix}.prompt doit être un objet.`);
  else {
    checkString(analysis.prompt.id, `${prefix}.prompt.id`);
    checkString(analysis.prompt.version, `${prefix}.prompt.version`);
    checkString(analysis.prompt.text, `${prefix}.prompt.text`);
  }
  if (analysis.corpusId !== corpus?.id) errors.push(`${prefix}.corpusId doit correspondre à corpus.id.`);
  if (!Array.isArray(analysis.facts)) errors.push(`${prefix}.facts doit être une liste.`);
  else for (const [index, fact] of analysis.facts.entries()) {
    if (!isObject(fact)) { errors.push(`${prefix}.facts[${index}] doit être un objet.`); continue; }
    checkString(fact.id, `${prefix}.facts[${index}].id`);
    checkString(fact.statement, `${prefix}.facts[${index}].statement`);
    checkStringArray(fact.sourceIds, `${prefix}.facts[${index}].sourceIds`);
    for (const sourceId of fact.sourceIds ?? []) if (!sourceIds.has(sourceId)) errors.push(`${prefix}.facts[${index}] référence une source inconnue (${sourceId}).`);
  }
  if (!Array.isArray(analysis.sourcesUsed)) errors.push(`${prefix}.sourcesUsed doit être une liste.`);
  else for (const [index, source] of analysis.sourcesUsed.entries()) {
    if (!isObject(source)) { errors.push(`${prefix}.sourcesUsed[${index}] doit être un objet.`); continue; }
    checkString(source.sourceId, `${prefix}.sourcesUsed[${index}].sourceId`);
    if (!new Set(["primary", "secondary", "context"]).has(source.role)) errors.push(`${prefix}.sourcesUsed[${index}].role est invalide.`);
    if (!sourceIds.has(source.sourceId)) errors.push(`${prefix}.sourcesUsed[${index}] référence une source inconnue (${source.sourceId}).`);
  }
  for (const field of ["strengths", "limitations", "uncertainties"]) checkStringArray(analysis[field], `${prefix}.${field}`);
  const decision = analysis.nonScoringDecision;
  if (!isObject(decision)) errors.push(`${prefix}.nonScoringDecision doit être un objet.`);
  else {
    if (typeof decision.nonScoring !== "boolean") errors.push(`${prefix}.nonScoringDecision.nonScoring doit être un booléen.`);
    checkString(decision.reason, `${prefix}.nonScoringDecision.reason`);
    checkStringArray(decision.missingInformation, `${prefix}.nonScoringDecision.missingInformation`);
    checkStringArray(decision.reconsiderationConditions, `${prefix}.nonScoringDecision.reconsiderationConditions`);
  }
}

const comparison = document?.comparison;
if (!isObject(comparison)) errors.push("comparison doit être un objet.");
else {
  checkStringArray(comparison.agreements, "comparison.agreements");
  if (!Array.isArray(comparison.disagreements)) errors.push("comparison.disagreements doit être une liste.");
  else for (const [index, item] of comparison.disagreements.entries()) {
    const prefix = `comparison.disagreements[${index}]`;
    if (!isObject(item)) { errors.push(`${prefix} doit être un objet.`); continue; }
    for (const field of ["topic", "gptPosition", "claudePosition"]) checkString(item[field], `${prefix}.${field}`);
    if (!new Set(["resolved", "unresolved", "not-applicable"]).has(item.resolutionStatus)) errors.push(`${prefix}.resolutionStatus est invalide.`);
    if (item.resolutionNote !== undefined) checkString(item.resolutionNote, `${prefix}.resolutionNote`);
  }
}

if (errors.length) {
  console.error(`Contrat d'analyse IA invalide (${path}) :`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Contrat d'analyse IA valide : GPT et Claude, corpus ${corpus.id} v${corpus.version}.`);
console.log("Contrôle en lecture seule : aucune donnée publique n'est écrite.");

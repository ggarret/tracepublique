import { readFile } from "node:fs/promises";
import { REVIEW_STATUSES, validateReviewActions } from "./review-contract.mjs";

const readJson = async (path, fallback) => {
  try { return JSON.parse(await readFile(path, "utf8")); } catch { return fallback; }
};

const suggestions = await readJson("data/inbox/proposal-suggestions.json", []);
const actions = await readJson("data/inbox/review-actions.json", []);
const errors = validateReviewActions(suggestions, actions);

if (!Array.isArray(suggestions)) errors.push("Les suggestions doivent contenir un tableau JSON.");
for (const suggestion of suggestions) {
  if (!suggestion.id || !suggestion.sourceId) errors.push("Chaque suggestion doit avoir un id et un sourceId.");
  if (!REVIEW_STATUSES.has(suggestion.status)) errors.push(`Statut de suggestion invalide : ${suggestion.id}`);
}

if (errors.length) {
  console.error("Contrat de revue invalide :");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Contrat de revue valide : ${suggestions.length} suggestion(s), ${actions.length} décision(s).`);
console.log("Contrôle en lecture seule : aucune donnée publique n'est écrite.");

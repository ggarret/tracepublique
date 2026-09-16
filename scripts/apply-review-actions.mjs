import { readFile, writeFile } from "node:fs/promises";
import { buildReviewedSuggestions, sha256, validateReviewActions } from "./review-contract.mjs";

const suggestions = JSON.parse(await readFile("data/inbox/proposal-suggestions.json", "utf8"));
const actions = JSON.parse(await readFile("data/inbox/review-actions.json", "utf8"));
const errors = validateReviewActions(suggestions, actions);

if (errors.length > 0) {
  console.error("Actions de revue invalides :");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

const reviewed = buildReviewedSuggestions(suggestions, actions);
const inputHash = sha256(JSON.stringify({ suggestions, actions }));
const audit = actions.map((action) => ({
  suggestionId: action.suggestionId,
  decision: action.decision,
  reviewer: action.reviewer.trim(),
  reason: action.reason.trim(),
  reviewedAt: action.reviewedAt ?? new Date().toISOString(),
  inputHash,
  output: "data/inbox/reviewed-suggestions.json",
  publicDataChanged: false,
  publishTriggered: false,
}));

await writeFile("data/inbox/reviewed-suggestions.json", `${JSON.stringify(reviewed, null, 2)}\n`);
await writeFile("data/inbox/review-audit.json", `${JSON.stringify(audit, null, 2)}\n`);
console.log(`Revue appliquée : ${actions.length} décision(s), ${reviewed.length} suggestion(s) conservée(s).`);
console.log("Aucune proposition publique ni aucun déploiement n'a été modifié ou déclenché.");

import { createHash } from "node:crypto";

export const REVIEW_DECISIONS = new Set(["rejeter", "a_revoir", "rattacher_source", "pret_a_publier"]);
export const REVIEW_STATUSES = new Set(["revue_humaine", ...REVIEW_DECISIONS]);

export const sha256 = (value) => createHash("sha256").update(value).digest("hex");

export const validateReviewActions = (suggestions, actions) => {
  const suggestionIds = new Set(suggestions.map((suggestion) => suggestion.id));
  const actionBySuggestion = new Map();
  const errors = [];

  if (!Array.isArray(actions)) return ["Le fichier des actions doit contenir un tableau JSON."];

  for (const action of actions) {
    const id = action?.suggestionId ?? "(identifiant absent)";
    if (!action || typeof action !== "object" || Array.isArray(action)) {
      errors.push(`Action invalide : ${id}`);
      continue;
    }
    if (!suggestionIds.has(action.suggestionId)) errors.push(`Suggestion inconnue : ${id}`);
    if (!REVIEW_DECISIONS.has(action.decision)) errors.push(`Décision invalide : ${id}`);
    if (typeof action.reviewer !== "string" || !action.reviewer.trim()) errors.push(`Relecteur manquant : ${id}`);
    if (typeof action.reason !== "string" || !action.reason.trim()) errors.push(`Justification manquante : ${id}`);
    if (action.reviewedAt !== undefined && Number.isNaN(Date.parse(action.reviewedAt))) {
      errors.push(`Date de revue invalide : ${id}`);
    }
    if (action.decision === "rattacher_source" && (typeof action.targetProposalId !== "string" || !action.targetProposalId.trim())) {
      errors.push(`Proposition cible manquante pour : ${id}`);
    }
    if (actionBySuggestion.has(action.suggestionId)) errors.push(`Plusieurs décisions pour : ${id}`);
    actionBySuggestion.set(action.suggestionId, action);
  }
  return errors;
};

export const buildReviewedSuggestions = (suggestions, actions) => {
  const actionBySuggestion = new Map(actions.map((action) => [action.suggestionId, action]));
  return suggestions.map((suggestion) => {
    const action = actionBySuggestion.get(suggestion.id);
    if (!action) return suggestion;
    return {
      ...suggestion,
      status: action.decision,
      review: {
        reviewer: action.reviewer.trim(),
        reason: action.reason.trim(),
        reviewedAt: action.reviewedAt ?? new Date().toISOString(),
        targetProposalId: action.targetProposalId ?? null,
      },
    };
  });
};

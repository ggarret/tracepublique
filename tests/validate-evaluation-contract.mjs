import assert from "node:assert/strict";
import criteria from "../data/evaluation-criteria.json" with { type: "json" };
import fixture from "./fixtures/evaluation-v2-contract.json" with { type: "json" };
import { validateEvaluationContract } from "../scripts/validate-data.mjs";

const sourceIds = new Set(["fixture-source"]);
const completeScores = criteria.map((criterion) => ({
  criterionId: criterion.id,
  value: 65,
  explanation: "La fixture relie ce score à des éléments vérifiables.",
  sourceIds: ["fixture-source"],
  band: { min: 60, max: 79, label: "Étayé" },
  observedFacts: ["Un fait observable est conservé."],
  missingInformation: [],
  uncertainty: { level: "faible", reasons: ["Contrôle déterministe de fixture."] },
}));

const proposal = (evaluation, scores = completeScores) => ({ id: "fixture-proposal", evaluation, scores });

assert.deepEqual(validateEvaluationContract(proposal(fixture.complete), criteria, sourceIds), []);

const incompleteErrors = validateEvaluationContract(proposal(fixture.incomplete), criteria, sourceIds);
assert.ok(incompleteErrors.some((error) => error.includes("corpus ou prompt versionné")));
assert.ok(incompleteErrors.some((error) => error.includes("relecteur")));
assert.ok(incompleteErrors.some((error) => error.includes("confiance globale")));
assert.ok(incompleteErrors.some((error) => error.includes("agrégation 2.0")));

const abstention = {
  ...fixture.complete,
  status: "abstention",
  aggregation: undefined,
  abstention: {
    reason: "La preuve disponible ne permet pas de noter ce critère.",
    missingInformation: ["Document primaire précisant le périmètre."],
    reconsiderationConditions: ["Publier le document primaire et le faire relire."],
  },
};
const abstentionScores = completeScores.map((score, index) => index === 0 ? {
  criterionId: score.criterionId,
  explanation: "Le critère est abstenu faute de preuve suffisante.",
  sourceIds: ["fixture-source"],
  abstention: {
    reason: "Le document disponible ne couvre pas ce critère.",
    missingInformation: ["Donnée déterminante manquante."],
    reconsiderationConditions: ["Ajouter une source primaire vérifiable."],
  },
} : score);
assert.deepEqual(validateEvaluationContract(proposal(abstention, abstentionScores), criteria, sourceIds), []);

const invalidAbstention = { ...abstention, aggregation: fixture.complete.aggregation };
const invalidAbstentionScores = abstentionScores.map((score, index) => index === 0 ? { ...score, value: 0 } : score);
const invalidAbstentionErrors = validateEvaluationContract(
  proposal(invalidAbstention, invalidAbstentionScores),
  criteria,
  sourceIds,
);
assert.ok(invalidAbstentionErrors.some((error) => error.includes("ne peut pas déclarer d'agrégation")));
assert.ok(invalidAbstentionErrors.some((error) => error.includes("ne peut pas être codée avec une valeur")));

console.log("Contrat d'évaluation 2.0 : acceptation, rejet et abstention vérifiés.");

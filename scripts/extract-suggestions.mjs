import { readFile, writeFile } from "node:fs/promises";
import aliases from "../data/candidate-aliases.json" with { type: "json" };
import themeKeywords from "../data/theme-keywords.json" with { type: "json" };
import { isAnalyzable, normalizeText } from "./ingestion-utils.mjs";

const sources = JSON.parse(await readFile("data/inbox/discovered-sources.json", "utf8"));
let details = [];
let existingSuggestions = [];
const refresh = process.argv.includes("--refresh");
try {
  details = JSON.parse(await readFile("data/inbox/source-details.json", "utf8"));
} catch {
  // Les métadonnées de page sont optionnelles pour la première passe.
}
try {
  existingSuggestions = refresh ? [] : JSON.parse(await readFile("data/inbox/proposal-suggestions.json", "utf8"));
} catch {
  // Première analyse.
}
const normalize = normalizeText;

const containsKeyword = (text, keyword) => {
  const normalizedKeyword = normalize(keyword).trim();
  if (normalizedKeyword.length <= 3) {
    return new RegExp(`(^|\\s)${normalizedKeyword.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\\\$&")}(?=\\s|$)`, "i").test(text);
  }
  return text.includes(normalizedKeyword);
};

const candidatesByAlias = Object.entries(aliases).flatMap(([candidateId, names]) => names.map((name) => ({ candidateId, name: normalize(name) })));

const existingBySourceId = new Map();
for (const suggestion of existingSuggestions) {
  if (!existingBySourceId.has(suggestion.sourceId)) existingBySourceId.set(suggestion.sourceId, suggestion);
}
const pendingSources = refresh
  ? sources.filter(isAnalyzable)
  : sources.filter((source) => isAnalyzable(source) && !existingBySourceId.has(source.id));
const newSuggestions = pendingSources.map((source) => {
  const detail = details.find((item) => item.sourceId === source.id);
  const title = normalize(source.title);
  const context = normalize([detail?.pageTitle, detail?.description].filter(Boolean).join(" "));
  const matchingCandidates = candidatesByAlias.filter(({ name }) => title.includes(name));
  const matchingThemes = Object.entries(themeKeywords)
    .map(([themeId, keywords]) => ({ themeId, matches: keywords.filter((keyword) => containsKeyword(title, keyword)) }))
    .filter(({ matches }) => matches.length > 0)
    .sort((a, b) => b.matches.length - a.matches.length);
  const candidate = matchingCandidates[0];
  const theme = matchingThemes[0];
  const confidence = candidate && theme ? "moyenne" : "faible";
  return {
    id: `suggestion-${source.id}`,
    sourceId: source.id,
    title: source.title,
    context: detail?.description ?? null,
    candidateId: candidate?.candidateId ?? null,
    themeId: theme?.themeId ?? null,
    matchedKeywords: theme?.matches ?? [],
    status: "revue_humaine",
    confidence,
    reason: candidate && theme
      ? "Candidat et thème proposés par correspondance lexicale du titre."
      : "Correspondance insuffisante pour une proposition automatique.",
  };
});

for (const suggestion of newSuggestions) existingBySourceId.set(suggestion.sourceId, suggestion);
const suggestions = [...existingBySourceId.values()];
await writeFile("data/inbox/proposal-suggestions.json", `${JSON.stringify(suggestions, null, 2)}\n`);
console.log(`Suggestions générées : ${newSuggestions.length} nouvelles, ${suggestions.length} conservées au total${refresh ? " (recalcul forcé)" : ""}.`);

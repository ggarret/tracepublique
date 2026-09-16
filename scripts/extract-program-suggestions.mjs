import { readFile, writeFile } from "node:fs/promises";
import aliases from "../data/candidate-aliases.json" with { type: "json" };
import themeKeywords from "../data/theme-keywords.json" with { type: "json" };
import programs from "../data/programs.json" with { type: "json" };
import { isAnalyzable, normalizeText } from "./ingestion-utils.mjs";

const details = JSON.parse(await readFile("data/inbox/program-details.json", "utf8"));
const outputPath = "data/inbox/program-suggestions.json";
const refresh = process.argv.includes("--refresh");
let existing = [];
try { existing = refresh ? [] : JSON.parse(await readFile(outputPath, "utf8")); } catch { /* Première exécution. */ }

const containsKeyword = (text, keyword) => {
  const normalized = normalizeText(keyword);
  return normalized.length <= 3 ? new RegExp(`(^|\\s)${normalized.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\\\$&")}(?=\\s|$)`).test(text) : text.includes(normalized);
};
const candidates = Object.entries(aliases).flatMap(([candidateId, names]) => names.map((name) => ({ candidateId, name: normalizeText(name) })));
const existingByProgram = new Map(existing.map((item) => [item.programId, item]));
const eligible = programs.filter((program) => isAnalyzable({ ...program, status: program.status === "qualifiée" ? "qualifiée" : "à_qualifier" }));
const pendingPrograms = refresh ? eligible : eligible.filter((program) => !existingByProgram.has(program.id));
const suggestions = pendingPrograms.map((program) => {
  const detail = details.find((item) => item.programId === program.id);
  const searchable = normalizeText([program.title, detail?.pageTitle, detail?.description, detail?.excerpt].filter(Boolean).join(" "));
  const candidate = candidates.find(({ candidateId, name }) => candidateId === program.candidateId && searchable.includes(name));
  const themes = Object.entries(themeKeywords).map(([themeId, keywords]) => ({ themeId, matches: keywords.filter((keyword) => containsKeyword(searchable, keyword)) })).filter((item) => item.matches.length).sort((a, b) => b.matches.length - a.matches.length);
  const theme = themes[0] ?? null;
  const accessible = detail?.status?.startsWith("accessible");
  const confidence = !accessible ? "faible" : candidate && theme ? "élevée" : theme ? "moyenne" : "faible";
  return {
    id: `program-suggestion-${program.id}`,
    programId: program.id,
    candidateId: program.candidateId,
    document: program.title,
    suggestedThemeId: accessible ? theme?.themeId ?? null : null,
    excerpt: accessible ? detail?.excerpt ?? null : null,
    url: program.url,
    status: accessible ? "revue_humaine" : "en_revue",
    confidence,
    matchedKeywords: accessible ? theme?.matches ?? [] : [],
    reason: accessible ? "Candidat issu du registre des programmes ; thème proposé par correspondance lexicale des métadonnées publiques." : "Document inaccessible : aucune information ni extrait inventé.",
  };
});
for (const suggestion of suggestions) existingByProgram.set(suggestion.programId, suggestion);
await writeFile(outputPath, `${JSON.stringify([...existingByProgram.values()], null, 2)}\n`);
console.log(`Suggestions de programmes : ${suggestions.length} recalculées, ${existingByProgram.size} conservées au total${refresh ? " (recalcul forcé)" : ""}.`);

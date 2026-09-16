import { readFile, writeFile } from "node:fs/promises";

const readJson = async (path, fallback = []) => {
  try { return JSON.parse(await readFile(path, "utf8")); } catch { return fallback; }
};

const suggestions = await readJson("data/inbox/proposal-suggestions.json");
const sources = await readJson("data/inbox/discovered-sources.json");
const candidates = await readJson("data/candidates.json");
const themes = await readJson("data/themes.json");
const sourceById = new Map(sources.map((source) => [source.id, source]));
const candidateById = new Map(candidates.map((candidate) => [candidate.id, candidate]));
const themeById = new Map(themes.map((theme) => [theme.id, theme]));
const statusCounts = suggestions.reduce((counts, suggestion) => {
  counts[suggestion.status] = (counts[suggestion.status] ?? 0) + 1;
  return counts;
}, {});

const escape = (value) => String(value ?? "").replace(/\|/g, "\\|").replace(/\n/g, " ");
const rows = suggestions.map((suggestion, index) => {
  const source = sourceById.get(suggestion.sourceId);
  const candidate = candidateById.get(suggestion.candidateId);
  const theme = themeById.get(suggestion.themeId);
  return `| ${index + 1} | ${escape(suggestion.title)} | ${escape(candidate?.name ?? "À identifier")} | ${escape(theme?.label ?? "À classer")} | ${suggestion.confidence} | [source](${source?.url ?? ""}) | ${suggestion.status} |`;
});

const report = `# Rapport de revue des suggestions

Généré le ${new Date().toISOString()}.

Ce rapport ne publie aucune proposition. Il sert à décider, pour chaque entrée, si elle doit être rejetée, rattachée à une proposition existante ou transformée en nouvelle fiche.

## Couverture

- Entrées reçues : ${sources.length}
- Suggestions produites : ${suggestions.length}
- Entrées sans suggestion : ${Math.max(0, sources.length - new Set(suggestions.map((suggestion) => suggestion.sourceId)).size)}
- Statuts : ${Object.entries(statusCounts).map(([status, count]) => `${status} (${count})`).join(", ") || "aucun"}

## Décisions attendues

- [ ] candidat confirmé ;
- [ ] lien avec la présidentielle 2027 confirmé ;
- [ ] thème confirmé ;
- [ ] citation ou formulation vérifiée ;
- [ ] doublon recherché ;
- [ ] source primaire recherchée ;
- [ ] décision finale enregistrée dans les données.

## Entrées

| # | Entrée RSS | Candidat proposé | Thème proposé | Confiance | Source | Statut |
|---:|---|---|---|---|---|---|
${rows.join("\n")}

## Règle

Une entrée ambiguë reste en revue humaine. Elle ne doit pas être transformée en proposition publiée par défaut.
`;

await writeFile("data/inbox/review-report.md", report);
console.log(`Rapport généré : ${suggestions.length} entrées.`);

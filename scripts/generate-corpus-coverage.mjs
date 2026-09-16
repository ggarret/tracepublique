import { readFile, writeFile } from "node:fs/promises";

const INPUTS = {
  candidates: "data/candidates.json",
  themes: "data/themes.json",
  programs: "data/programs.json",
  proposals: "data/proposals.json",
  sources: "data/sources.json",
  trackRecords: "data/track-records.json",
};

const OUTPUT_JSON = "data/audits/corpus-coverage.json";
const OUTPUT_MARKDOWN = "docs/CORPUS_COVERAGE.md";
const ATTRIBUTION_KINDS = ["candidate", "campaign", "party", "past_program"];

const readJson = async (path) => JSON.parse(await readFile(path, "utf8"));

const [candidates, themes, programs, proposals, sources, trackRecords] = await Promise.all(
  Object.values(INPUTS).map(readJson),
);

const candidateById = new Map(candidates.map((candidate) => [candidate.id, candidate]));
const themeById = new Map(themes.map((theme) => [theme.id, theme]));
const sourceById = new Map(sources.map((source) => [source.id, source]));

const createAttributionCounts = () => Object.fromEntries(
  ATTRIBUTION_KINDS.map((kind) => [kind, 0]),
);

const increment = (counts, key) => {
  if (Object.hasOwn(counts, key)) counts[key] += 1;
};

const countValues = (items, getValue) => {
  const counts = new Map();
  for (const item of items) {
    const value = getValue(item) ?? "unknown";
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return Object.fromEntries([...counts.entries()].sort(([left], [right]) => left.localeCompare(right)));
};

const dateOnly = (value) => {
  const match = typeof value === "string" ? value.match(/^\d{4}-\d{2}-\d{2}/) : null;
  return match?.[0] ?? null;
};

const latestDate = [...programs.map((program) => program.checkedAt),
  ...proposals.map((proposal) => proposal.publishedAt),
  ...sources.map((source) => source.publishedAt),
  ...sources.map((source) => source.accessedAt),
  ...trackRecords.map((record) => record.date),
  ...trackRecords.flatMap((record) => (record.sources ?? []).map((source) => source.accessedAt)),
].map(dateOnly).filter(Boolean).sort().at(-1) ?? null;

const proposalSourceDetails = new Map(proposals.map((proposal) => {
  const linkedSources = (proposal.sourceIds ?? [])
    .map((sourceId) => sourceById.get(sourceId))
    .filter(Boolean);
  const sourceKinds = linkedSources.map((source) => source.kind);
  const hasPrimarySource = sourceKinds.includes("primaire");
  const secondaryOnly = linkedSources.length > 0
    && linkedSources.length === (proposal.sourceIds ?? []).length
    && sourceKinds.every((kind) => kind === "secondaire");
  return [proposal.id, {
    sourceIds: linkedSources.map((source) => source.id),
    sourceKinds: [...new Set(sourceKinds)].sort(),
    hasPrimarySource,
    secondaryOnly,
  }];
}));

const cellByKey = new Map();
for (const candidate of candidates) {
  for (const theme of themes) {
    const key = `${candidate.id}|${theme.id}`;
    cellByKey.set(key, {
      candidateId: candidate.id,
      themeId: theme.id,
      proposalIds: [],
      attributionCounts: createAttributionCounts(),
      historicalProposalIds: [],
      secondaryOnlyProposalIds: [],
    });
  }
}

const unmappedProposals = [];
for (const proposal of proposals) {
  const cell = cellByKey.get(`${proposal.candidateId}|${proposal.themeId}`);
  if (!cell) {
    unmappedProposals.push({
      proposalId: proposal.id,
      candidateId: proposal.candidateId,
      themeId: proposal.themeId,
    });
    continue;
  }

  const attributionKind = proposal.attribution?.kind ?? "unknown";
  cell.proposalIds.push(proposal.id);
  increment(cell.attributionCounts, attributionKind);
  if (attributionKind === "past_program") cell.historicalProposalIds.push(proposal.id);
  if (proposalSourceDetails.get(proposal.id)?.secondaryOnly) cell.secondaryOnlyProposalIds.push(proposal.id);
}

const coverageMatrix = [...cellByKey.values()].map((cell) => ({
  ...cell,
  proposalCount: cell.proposalIds.length,
  historicalProposalCount: cell.historicalProposalIds.length,
  secondaryOnlyProposalCount: cell.secondaryOnlyProposalIds.length,
  isEmpty: cell.proposalIds.length === 0,
}));

const cellFor = (candidateId, themeId) => cellByKey.get(`${candidateId}|${themeId}`);

const isQualifiedTrackRecord = (record) => Boolean(
  record.date
  && record.relationship
  && record.conclusion?.trim()
  && Array.isArray(record.sources)
  && record.sources.length > 0
  && record.sources.every((source) => source.title?.trim() && source.publisher?.trim() && source.url?.trim()),
);

const qualifiedTrackRecordByCandidate = new Map();
for (const candidate of candidates) {
  qualifiedTrackRecordByCandidate.set(candidate.id, trackRecords
    .filter((record) => record.candidateId === candidate.id && isQualifiedTrackRecord(record)));
}

const classifyProgram = (program) => {
  const status = String(program.status ?? "").toLocaleLowerCase("fr");
  const explicitlyExhaustive = program.exhaustive === true
    || program.isExhaustive === true
    || /(^|[_ -])(complet|exhaustif|integral|final)([_ -]|$)/.test(status);
  const statusReasons = {
    orientations_a_qualifier: "Axes repérés, sans programme complet qualifié.",
    orientations_2027: "Priorités de campagne, sans programme complet.",
    programme_progressif_2027: "Programme annoncé comme publié par étapes.",
    programme_partiel_2027: "Cahiers ou documents de campagne explicitement partiels.",
    socle_programmatique_2027: "Socle repris pour 2027, qui ne vaut pas programme final exhaustif.",
    programme_collectif_2027: "Programme collectif : il ne constitue pas une preuve d'engagement personnel exhaustif.",
    programme_anterieur_a_requalifier: "Millésime ou applicabilité à 2027 encore à requalifier.",
    document_programmatique_a_requalifier: "Document repéré, mais statut présidentiel 2027 encore à vérifier.",
  };
  const knownNonExhaustive = Object.hasOwn(statusReasons, program.status)
    && program.status !== "programme_anterieur_a_requalifier"
    && program.status !== "document_programmatique_a_requalifier";

  return {
    exhaustiveness: explicitlyExhaustive ? "exhaustive" : knownNonExhaustive ? "non_exhaustive" : "unknown",
    nonExhaustive: knownNonExhaustive,
    exhaustivenessReason: statusReasons[program.status]
      ?? "Le registre ne contient pas de champ attestant l'exhaustivité de ce document.",
  };
};

const programCoverage = programs.map((program) => {
  const programClassification = classifyProgram(program);
  const candidateCells = themes.map((theme) => cellFor(program.candidateId, theme.id)).filter(Boolean);
  const candidateProposalIds = [...new Set(candidateCells.flatMap((cell) => cell.proposalIds))];
  const coveredThemeIds = candidateCells.filter((cell) => cell.proposalIds.length > 0).map((cell) => cell.themeId);
  const uncoveredThemeIds = candidateCells.filter((cell) => cell.proposalIds.length === 0).map((cell) => cell.themeId);
  return {
    programId: program.id,
    candidateId: program.candidateId,
    candidateName: candidateById.get(program.candidateId)?.name ?? null,
    title: program.title,
    status: program.status ?? null,
    sourceKind: program.sourceKind ?? null,
    ...programClassification,
    candidateCorpusProposalCount: candidateProposalIds.length,
    candidateCorpusCoveredThemeIds: coveredThemeIds,
    candidateCorpusUncoveredThemeIds: uncoveredThemeIds,
    note: program.note ?? null,
  };
});

const historicalProposals = proposals
  .filter((proposal) => proposal.attribution?.kind === "past_program")
  .map((proposal) => ({
    proposalId: proposal.id,
    candidateId: proposal.candidateId,
    candidateName: candidateById.get(proposal.candidateId)?.name ?? null,
    themeId: proposal.themeId,
    themeLabel: themeById.get(proposal.themeId)?.label ?? null,
    title: proposal.title,
    publishedAt: proposal.publishedAt ?? null,
    sourceIds: proposal.sourceIds ?? [],
  }));

const secondaryOnlyProposals = proposals
  .filter((proposal) => proposalSourceDetails.get(proposal.id)?.secondaryOnly)
  .map((proposal) => ({
    proposalId: proposal.id,
    candidateId: proposal.candidateId,
    candidateName: candidateById.get(proposal.candidateId)?.name ?? null,
    themeId: proposal.themeId,
    themeLabel: themeById.get(proposal.themeId)?.label ?? null,
    title: proposal.title,
    sourceIds: proposal.sourceIds ?? [],
  }));

const candidateCoverage = candidates.map((candidate) => {
  const candidateCells = themes.map((theme) => cellFor(candidate.id, theme.id));
  const attributionCounts = createAttributionCounts();
  for (const cell of candidateCells) {
    for (const kind of ATTRIBUTION_KINDS) attributionCounts[kind] += cell.attributionCounts[kind];
  }
  const qualifiedRecords = qualifiedTrackRecordByCandidate.get(candidate.id) ?? [];
  const candidatePrograms = programCoverage.filter((program) => program.candidateId === candidate.id);
  const coveredThemeIds = candidateCells.filter((cell) => cell.proposalIds.length > 0).map((cell) => cell.themeId);
  const emptyThemeIds = candidateCells.filter((cell) => cell.proposalIds.length === 0).map((cell) => cell.themeId);
  return {
    candidateId: candidate.id,
    name: candidate.name,
    party: candidate.party,
    programCount: candidatePrograms.length,
    programIds: candidatePrograms.map((program) => program.programId),
    nonExhaustiveProgramIds: candidatePrograms
      .filter((program) => program.nonExhaustive)
      .map((program) => program.programId),
    proposalCount: candidateCells.reduce((total, cell) => total + cell.proposalIds.length, 0),
    coveredThemeCount: coveredThemeIds.length,
    coveredThemeIds,
    emptyThemeIds,
    emptyCellCount: emptyThemeIds.length,
    attributionCounts,
    historicalProposalCount: historicalProposals.filter((proposal) => proposal.candidateId === candidate.id).length,
    secondaryOnlyProposalCount: secondaryOnlyProposals.filter((proposal) => proposal.candidateId === candidate.id).length,
    trackRecordCount: trackRecords.filter((record) => record.candidateId === candidate.id).length,
    qualifiedTrackRecordCount: qualifiedRecords.length,
    hasQualifiedPrecedent: qualifiedRecords.length > 0,
    qualifiedTrackRecordIds: qualifiedRecords.map((record) => record.id),
  };
});

const themeCoverage = themes.map((theme) => {
  const themeCells = candidates.map((candidate) => cellFor(candidate.id, theme.id));
  const attributionCounts = createAttributionCounts();
  for (const cell of themeCells) {
    for (const kind of ATTRIBUTION_KINDS) attributionCounts[kind] += cell.attributionCounts[kind];
  }
  const coveredCandidateIds = themeCells.filter((cell) => cell.proposalIds.length > 0).map((cell) => cell.candidateId);
  return {
    themeId: theme.id,
    label: theme.label,
    proposalCount: themeCells.reduce((total, cell) => total + cell.proposalIds.length, 0),
    coveredCandidateCount: coveredCandidateIds.length,
    coveredCandidateIds,
    emptyCandidateIds: themeCells.filter((cell) => cell.proposalIds.length === 0).map((cell) => cell.candidateId),
    attributionCounts,
    historicalProposalCount: themeCells.reduce((total, cell) => total + cell.historicalProposalIds.length, 0),
    secondaryOnlyProposalCount: themeCells.reduce((total, cell) => total + cell.secondaryOnlyProposalIds.length, 0),
  };
});

const emptyCells = coverageMatrix
  .filter((cell) => cell.isEmpty)
  .map((cell) => ({
    candidateId: cell.candidateId,
    candidateName: candidateById.get(cell.candidateId)?.name ?? null,
    themeId: cell.themeId,
    themeLabel: themeById.get(cell.themeId)?.label ?? null,
  }));

const attributionCounts = createAttributionCounts();
for (const proposal of proposals) increment(attributionCounts, proposal.attribution?.kind ?? "unknown");

const qualifiedPrecedentMissing = candidateCoverage
  .filter((candidate) => !candidate.hasQualifiedPrecedent)
  .map((candidate) => ({
    candidateId: candidate.candidateId,
    name: candidate.name,
    proposalCount: candidate.proposalCount,
    trackRecordCount: candidate.trackRecordCount,
  }));

const report = {
  schemaVersion: 1,
  generatedAt: latestDate ? `${latestDate}T00:00:00.000Z` : null,
  dataAsOf: latestDate,
  inputs: Object.fromEntries(Object.entries(INPUTS).map(([name, path]) => [name, { path, count: {
    candidates: candidates.length,
    themes: themes.length,
    programs: programs.length,
    proposals: proposals.length,
    sources: sources.length,
    trackRecords: trackRecords.length,
  }[name] }])),
  totals: {
    candidates: candidates.length,
    themes: themes.length,
    programs: programs.length,
    proposals: proposals.length,
    sources: sources.length,
    trackRecords: trackRecords.length,
    candidateThemeCells: coverageMatrix.length,
    coveredCandidateThemeCells: coverageMatrix.length - emptyCells.length,
    emptyCandidateThemeCells: emptyCells.length,
    historicalProposals: historicalProposals.length,
    secondaryOnlyProposals: secondaryOnlyProposals.length,
    nonExhaustivePrograms: programCoverage.filter((program) => program.nonExhaustive).length,
    candidatesWithoutQualifiedPrecedent: qualifiedPrecedentMissing.length,
    unmappedProposals: unmappedProposals.length,
  },
  attributionCounts,
  sourceCoverage: {
    primarySources: sources.filter((source) => source.kind === "primaire").length,
    secondarySources: sources.filter((source) => source.kind === "secondaire").length,
    proposalsWithAtLeastOnePrimarySource: proposals.filter((proposal) => proposalSourceDetails.get(proposal.id)?.hasPrimarySource).length,
    proposalsWithSecondarySourcesOnly: secondaryOnlyProposals.length,
    secondarySourceIds: sources.filter((source) => source.kind === "secondaire").map((source) => source.id),
  },
  programStatusCounts: countValues(programs, (program) => program.status),
  candidateCoverage,
  themeCoverage,
  coverageMatrix,
  emptyCells,
  programCoverage,
  flags: {
    emptyCells,
    nonExhaustivePrograms: programCoverage.filter((program) => program.nonExhaustive),
    historicalProposals,
    secondaryOnlyProposals,
    candidatesWithoutQualifiedPrecedent: qualifiedPrecedentMissing,
    unmappedProposals,
  },
  definitions: {
    historicalProposal: "Proposition dont attribution.kind vaut past_program ; elle est conservée comme archive et ne vaut pas un engagement 2027 présumé.",
    qualifiedPrecedent: "Fiche de track-record avec date, relation, conclusion et au moins une source complète (titre, éditeur, URL).",
    secondaryOnlyProposal: "Proposition dont toutes les sources actuellement rattachées sont de kind secondaire.",
    nonExhaustiveProgram: "Programme dont le statut signale des orientations, une publication progressive, un corpus partiel, un socle ou un document collectif non équivalent à un engagement personnel exhaustif.",
    emptyCell: "Couple candidat-thème sans proposition actuellement recensée dans proposals.json.",
  },
  caveats: [
    "Un zéro ne prouve pas l'absence d'une proposition : il signifie seulement qu'aucune proposition n'est actuellement recensée dans la cellule du corpus.",
    "Le rattachement des propositions aux programmes est déduit du candidat, car proposals.json ne contient pas de programId ; les compteurs de programCoverage décrivent donc le corpus du candidat, pas une extraction exhaustive de ce programme.",
    "Le registre des programmes lui-même est un premier passage transversal et ne constitue pas une extraction exhaustive de tous les documents et de toutes leurs mesures.",
  ],
};

const markdownEscape = (value) => String(value ?? "").replace(/\|/g, "\\|").replace(/\n/g, " ");
const candidateLabel = (candidateId) => candidateById.get(candidateId)?.name ?? candidateId;
const themeLabel = (themeId) => themeById.get(themeId)?.label ?? themeId;
const attributionHeaders = ATTRIBUTION_KINDS.join(" | ");

const matrixHeader = ["Candidat", ...themes.map((theme) => theme.id), "Total", "Cellules vides"].join(" | ");
const matrixRows = candidateCoverage.map((candidate) => {
  const values = themes.map((theme) => cellFor(candidate.candidateId, theme.id).proposalIds.length);
  return `| ${candidate.name} | ${values.join(" | ")} | ${candidate.proposalCount} | ${candidate.emptyCellCount} |`;
}).join("\n");

const candidateAttributionRows = candidateCoverage.map((candidate) => `| ${candidate.name} | ${ATTRIBUTION_KINDS.map((kind) => candidate.attributionCounts[kind]).join(" | ")} | ${candidate.proposalCount} |`).join("\n");
const themeRows = themeCoverage.map((theme) => `| ${markdownEscape(theme.label)} | ${theme.proposalCount} | ${theme.coveredCandidateCount} | ${theme.emptyCandidateIds.length} | ${ATTRIBUTION_KINDS.map((kind) => theme.attributionCounts[kind]).join(" | ")} |`).join("\n");

const nonExhaustivePrograms = programCoverage.filter((program) => program.nonExhaustive);
const nonExhaustiveProgramRows = nonExhaustivePrograms.length > 0
  ? nonExhaustivePrograms.map((program) => `| ${markdownEscape(program.candidateName)} | ${markdownEscape(program.title)} | ${markdownEscape(program.status)} | ${markdownEscape(program.exhaustivenessReason)} |`).join("\n")
  : "| — | Aucun statut explicitement non exhaustif | — | — |";

const historicalRows = historicalProposals.length > 0
  ? historicalProposals.map((proposal) => `| ${markdownEscape(proposal.candidateName)} | ${markdownEscape(themeLabel(proposal.themeId))} | ${markdownEscape(proposal.title)} | ${markdownEscape(proposal.publishedAt ?? "non datée")} |`).join("\n")
  : "| — | — | Aucune | — |";

const secondaryOnlyRows = secondaryOnlyProposals.length > 0
  ? secondaryOnlyProposals.map((proposal) => `| ${markdownEscape(proposal.candidateName)} | ${markdownEscape(proposal.title)} | ${proposal.sourceIds.map((sourceId) => `\`${sourceId}\``).join(", ")} |`).join("\n")
  : "| — | Aucune proposition concernée | — |";

const emptyCellRows = emptyCells.length > 0
  ? emptyCells.map((cell) => `| ${markdownEscape(cell.candidateName)} | ${markdownEscape(cell.themeLabel)} |`).join("\n")
  : "| — | Aucune |";

const missingPrecedentRows = qualifiedPrecedentMissing.length > 0
  ? qualifiedPrecedentMissing.map((candidate) => `| ${markdownEscape(candidate.name)} | ${candidate.proposalCount} | ${candidate.trackRecordCount} |`).join("\n")
  : "| — | — | — |";

const markdown = `# Audit de couverture du corpus Trace publique

Audit déterministe généré à partir des six fichiers JSON publics. État des données le **${latestDate ?? "non daté"}**. Le script est idempotent : une nouvelle exécution avec les mêmes entrées reproduit les mêmes sorties.

## Avertissement de lecture

> **Un zéro ne prouve pas l'absence d'une proposition.** Il signifie seulement qu'aucune proposition n'est actuellement recensée dans la cellule candidat-thème du corpus. Une cellule vide est donc une piste de collecte ou de revue, pas une conclusion politique.

## Synthèse

| Élément | Nombre |
|---|---:|
| Candidats | ${candidates.length} |
| Thèmes | ${themes.length} |
| Programmes / documents | ${programs.length} |
| Propositions | ${proposals.length} |
| Sources | ${sources.length} |
| Précédents | ${trackRecords.length} |
| Cellules candidat-thème | ${coverageMatrix.length} |
| Cellules couvertes | ${coverageMatrix.length - emptyCells.length} |
| Cellules vides | ${emptyCells.length} |
| Propositions historiques (\`past_program\`) | ${historicalProposals.length} |
| Propositions avec sources secondaires seules | ${secondaryOnlyProposals.length} |
| Programmes signalés non exhaustifs | ${nonExhaustivePrograms.length} |
| Candidats sans précédent qualifié | ${qualifiedPrecedentMissing.length} |

## Ventilation des attributions

Les quatre catégories sont conservées séparément : \`candidate\`, \`campaign\`, \`party\` et \`past_program\`. Une attribution \`past_program\` est traitée comme historique et ne doit pas être lue comme un engagement 2027 présumé.

| Candidat | ${attributionHeaders} | Total |
|---|---:|---:|---:|---:|---:|
${candidateAttributionRows}

Totaux du corpus : **candidate ${attributionCounts.candidate}**, **campaign ${attributionCounts.campaign}**, **party ${attributionCounts.party}**, **past_program ${attributionCounts.past_program}**.

## Couverture par candidat et par thème

Chaque nombre est le nombre de propositions actuellement recensées dans la cellule. Les colonnes reprennent les identifiants stables des thèmes ; le détail lisible des cellules vides figure plus bas.

| ${matrixHeader} |
|---|${themes.map(() => "---:").join("|")}|---:|---:|
${matrixRows}

### Totaux par thème

| Thème | Propositions | Candidats couverts | Candidats absents | candidate | campaign | party | past_program |
|---|---:|---:|---:|---:|---:|---:|---:|
${themeRows}

## Cellules vides

${emptyCells.length === 0 ? "Aucune cellule vide dans le produit candidat-thème." : `**${emptyCells.length} cellules** n'ont aucune proposition actuellement recensée :`}

| Candidat | Thème |
|---|---|
${emptyCellRows}

## Programmes non exhaustifs

Les statuts \`orientations\`, \`progressif\`, \`partiel\`, \`socle\` et \`collectif\` signalent une couverture qui ne doit pas être présentée comme un programme personnel complet. Les deux documents marqués « à requalifier » restent en incertitude et ne sont pas comptés comme non exhaustifs sur la seule base de leur statut. Le registre de programmes reste lui-même un premier passage transversal non exhaustif.

| Candidat | Programme / document | Statut | Motif |
|---|---|---|---|
${nonExhaustiveProgramRows}

## Propositions historiques

Sont listées ici les propositions dont l'attribution vaut \`past_program\`.

| Candidat | Thème | Proposition | Date enregistrée |
|---|---|---|---|
${historicalRows}

## Sources secondaires seules

Une proposition est signalée ici lorsque toutes ses sources actuellement rattachées ont \`kind: secondaire\`. Cela indique une faiblesse documentaire à traiter ; cela ne tranche pas la véracité de la proposition.

| Candidat | Proposition | Sources |
|---|---|---|
${secondaryOnlyRows}

## Candidats sans précédent qualifié

Un précédent est dit qualifié lorsqu'il possède une date, une relation, une conclusion et au moins une source complète. L'absence de fiche qualifiée indique une lacune du corpus de track-record, pas l'absence d'antécédent dans la réalité.

| Candidat | Propositions | Fiches de précédent |
|---|---:|---:|
${missingPrecedentRows}

## Limites méthodologiques

- Le rattachement des propositions aux programmes est déduit du candidat : \`proposals.json\` ne contient pas de \`programId\`. Les compteurs de programme décrivent donc le corpus du candidat et non une extraction exhaustive de ce document.
- Les cellules vides sont calculées sur les propositions présentes dans \`proposals.json\` uniquement.
- Les sources secondaires seules sont détectées à partir de \`sources.json\` et des liens \`sourceIds\` présents sur chaque proposition.
- Le rapport est une photographie de couverture et ne mesure ni la qualité politique, ni l'exhaustivité réelle des prises de position publiques.

Le JSON complet et les listes machine-readable sont disponibles dans [data/audits/corpus-coverage.json](../data/audits/corpus-coverage.json).
`;

await writeFile(OUTPUT_JSON, `${JSON.stringify(report, null, 2)}\n`);
await writeFile(OUTPUT_MARKDOWN, markdown);

console.log(`Audit de couverture généré : ${OUTPUT_JSON} et ${OUTPUT_MARKDOWN}`);
console.log(`${proposals.length} propositions, ${emptyCells.length} cellules vides, ${historicalProposals.length} historiques, ${secondaryOnlyProposals.length} propositions avec sources secondaires seules.`);

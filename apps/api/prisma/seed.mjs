import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");

async function readJson(relativePath) {
  const content = await readFile(resolve(repositoryRoot, relativePath), "utf8");
  return JSON.parse(content);
}

function dateOrNull(value) {
  return value ? new Date(`${value}T00:00:00.000Z`) : null;
}

async function main() {
  const [candidates, themes, programs, proposals, sources, trackRecords] = await Promise.all([
    readJson("data/candidates.json"),
    readJson("data/themes.json"),
    readJson("data/programs.json"),
    readJson("data/proposals.json"),
    readJson("data/sources.json"),
    readJson("data/track-records.json"),
  ]);

  for (const candidate of candidates) {
    await prisma.candidate.upsert({
      where: { id: candidate.id },
      create: candidate,
      update: { ...candidate },
    });
  }

  for (const theme of themes) {
    await prisma.theme.upsert({
      where: { id: theme.id },
      create: theme,
      update: { ...theme },
    });
  }

  for (const program of programs) {
    const { candidateId, checkedAt, ...fields } = program;
    await prisma.program.upsert({
      where: { id: program.id },
      create: { ...fields, candidateId, checkedAt: dateOrNull(checkedAt) },
      update: { ...fields, candidateId, checkedAt: dateOrNull(checkedAt) },
    });
  }

  for (const proposal of proposals) {
    const { candidateId, themeId, publishedAt, analysis, scores, sourceIds: _sourceIds, attribution, evaluation, ...fields } = proposal;
    await prisma.proposal.upsert({
      where: { id: proposal.id },
      create: {
        ...fields,
        candidateId,
        themeId,
        publishedAt: dateOrNull(publishedAt),
        scores: scores ?? [],
        attribution: attribution ?? {},
        evaluation: evaluation ?? {},
      },
      update: {
        ...fields,
        candidateId,
        themeId,
        publishedAt: dateOrNull(publishedAt),
        scores: scores ?? [],
        attribution: attribution ?? {},
        evaluation: evaluation ?? {},
      },
    });

    for (const [provider, output] of Object.entries(analysis ?? {})) {
      if (typeof output !== "string" || output.trim() === "") continue;
      await prisma.aiAnalysis.upsert({
        where: {
          proposalId_provider_promptVersion: {
            proposalId: proposal.id,
            provider,
            promptVersion: "legacy",
          },
        },
        create: { proposalId: proposal.id, provider, promptVersion: "legacy", output: { text: output }, input: {} },
        update: { output: { text: output } },
      });
    }
  }

  for (const source of sources) {
    const { proposalIds, publishedAt, accessedAt, ...fields } = source;
    await prisma.source.upsert({
      where: { id: source.id },
      create: {
        ...fields,
        publishedAt: dateOrNull(publishedAt),
        accessedAt: dateOrNull(accessedAt),
        metadata: {},
      },
      update: {
        ...fields,
        publishedAt: dateOrNull(publishedAt),
        accessedAt: dateOrNull(accessedAt),
      },
    });

    await prisma.proposalSource.deleteMany({ where: { sourceId: source.id } });
    if (proposalIds?.length) {
      await prisma.proposalSource.createMany({
        data: proposalIds.map((proposalId) => ({ proposalId, sourceId: source.id })),
        skipDuplicates: true,
      });
    }
  }

  for (const record of trackRecords) {
    const { candidateId, themeId, date, relatedProposalIds, sources: recordSources, ...fields } = record;
    await prisma.trackRecord.upsert({
      where: { id: record.id },
      create: {
        ...fields,
        candidateId,
        themeId,
        date: dateOrNull(date),
        relatedProposalIds: relatedProposalIds ?? [],
        sources: recordSources ?? [],
      },
      update: {
        ...fields,
        candidateId,
        themeId,
        date: dateOrNull(date),
        relatedProposalIds: relatedProposalIds ?? [],
        sources: recordSources ?? [],
      },
    });
  }

  console.log(`Imported ${candidates.length} candidates, ${themes.length} themes, ${programs.length} programs, ${proposals.length} proposals, ${sources.length} sources and ${trackRecords.length} track records.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());

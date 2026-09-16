import { readFile, writeFile } from "node:fs/promises";
import { isAnalyzable, normalizeUrl } from "./ingestion-utils.mjs";

const sources = JSON.parse(await readFile("data/inbox/discovered-sources.json", "utf8"));
let existingDetails = [];
try { existingDetails = JSON.parse(await readFile("data/inbox/source-details.json", "utf8")); } catch {}
const detailsById = new Map(existingDetails.map((detail) => [detail.sourceId, detail]));
const details = [];

const meta = (html, attribute, value) => {
  const pattern = new RegExp(`<meta[^>]+${attribute}=["']${value}["'][^>]+content=["']([^"']*)["'][^>]*>`, "i");
  const reversePattern = new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+${attribute}=["']${value}["'][^>]*>`, "i");
  return (html.match(pattern) ?? html.match(reversePattern))?.[1]?.trim() ?? null;
};

const decode = (value) => value
  .replace(/&amp;/g, "&")
  .replace(/&quot;/g, '"')
  .replace(/&#39;/g, "'")
  .replace(/&lt;/g, "<")
  .replace(/&gt;/g, ">");

for (const source of sources.filter(isAnalyzable)) {
  try {
    const response = await fetch(source.url, {
      headers: { "user-agent": "observatoire-citoyen/0.1 (+source-enrichment)" },
      signal: AbortSignal.timeout(10000),
    });
    const html = await response.text();
    const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.replace(/<[^>]+>/g, "").trim() ?? null;
    details.push({
      sourceId: source.id,
      url: normalizeUrl(source.url),
      httpStatus: response.status,
      pageTitle: title ? decode(title) : null,
      description: meta(html, "property", "og:description") ?? meta(html, "name", "description"),
      canonical: meta(html, "rel", "canonical"),
      fetchedAt: new Date().toISOString(),
      status: "enrichie",
    });
  } catch (error) {
    details.push({
      sourceId: source.id,
      url: normalizeUrl(source.url),
      httpStatus: null,
      pageTitle: null,
      description: null,
      canonical: null,
      fetchedAt: new Date().toISOString(),
      status: "erreur",
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

for (const detail of details) detailsById.set(detail.sourceId, detail);
await writeFile("data/inbox/source-details.json", `${JSON.stringify([...detailsById.values()], null, 2)}\n`);
console.log(`Enrichissement terminé : ${sources.filter(isAnalyzable).length} pages inspectées, ${detailsById.size} détails conservés.`);

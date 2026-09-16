import { mkdir, readFile, writeFile } from "node:fs/promises";
import { normalizeUrl } from "./ingestion-utils.mjs";

const programs = JSON.parse(await readFile("data/programs.json", "utf8"));
const refresh = process.argv.includes("--refresh");
const outputPath = "data/inbox/program-details.json";
let existing = [];
try {
  existing = refresh ? [] : JSON.parse(await readFile(outputPath, "utf8"));
} catch {
  // Première exécution.
}

const decodeHtml = (value) => value
  .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
  .replace(/&amp;/g, "&")
  .replace(/&quot;/g, '"')
  .replace(/&#39;/g, "'")
  .replace(/&lt;/g, "<")
  .replace(/&gt;/g, ">");

const metadata = (html, name, attribute = "name") => {
  const escaped = name.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&");
  const match = html.match(new RegExp(`<meta[^>]+${attribute}=["']${escaped}["'][^>]*content=["']([^"']*)["'][^>]*>`, "i"))
    ?? html.match(new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+${attribute}=["']${escaped}["'][^>]*>`, "i"));
  return match ? decodeHtml(match[1]).replace(/\\s+/g, " ").trim() : null;
};

const titleFromHtml = (html) => {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return match ? decodeHtml(match[1]).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() : null;
};

const canonicalFromHtml = (html) => {
  const match = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["'][^>]*>/i)
    ?? html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["'][^>]*>/i);
  return match ? normalizeUrl(decodeHtml(match[1])) : null;
};

const shortExcerpt = (value) => value ? value.slice(0, 280).trim() : null;
const details = [];
const errors = [];

for (const program of programs) {
  const url = normalizeUrl(program.url);
  const base = { programId: program.id, candidateId: program.candidateId, url, requestedUrl: url, collectedAt: new Date().toISOString() };
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: { "user-agent": "observatoire-citoyen/0.1 (+program-discovery)" },
      signal: AbortSignal.timeout(15000),
    });
    const contentType = response.headers.get("content-type") ?? "";
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    if (contentType.includes("pdf")) {
      details.push({ ...base, status: "accessible_sans_extrait", httpStatus: response.status, contentType, pageTitle: null, description: null, canonicalUrl: null, excerpt: null });
      continue;
    }
    const html = await response.text();
    const description = metadata(html, "description") ?? metadata(html, "og:description", "property");
    details.push({ ...base, status: "accessible", httpStatus: response.status, contentType, pageTitle: titleFromHtml(html), description, canonicalUrl: canonicalFromHtml(html), excerpt: shortExcerpt(description) });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    errors.push({ programId: program.id, url, message });
    details.push({ ...base, status: "en_revue", httpStatus: null, contentType: null, pageTitle: null, description: null, canonicalUrl: null, excerpt: null, error: message });
  }
}

const byProgramId = new Map(existing.map((item) => [item.programId, item]));
for (const item of details) byProgramId.set(item.programId, item);
await mkdir("data/inbox", { recursive: true });
await writeFile(outputPath, `${JSON.stringify([...byProgramId.values()], null, 2)}\n`);
await writeFile("data/inbox/program-discovery-report.json", `${JSON.stringify({ collectedAt: new Date().toISOString(), programs: programs.length, accessible: details.filter((item) => item.status.startsWith("accessible")).length, review: details.filter((item) => item.status === "en_revue").length, errors }, null, 2)}\n`);
console.log(`Programmes inspectés : ${details.length}, accessibles : ${details.filter((item) => item.status.startsWith("accessible")).length}, en revue : ${details.filter((item) => item.status === "en_revue").length}.`);

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { normalizeUrl, sourceKeys } from "./ingestion-utils.mjs";

const feeds = JSON.parse(await readFile("data/feeds.json", "utf8"));
const discovered = [];
const errors = [];
let existing = [];
try {
  existing = JSON.parse(await readFile("data/inbox/discovered-sources.json", "utf8"));
} catch {
  // Première exécution.
}

const decode = (value) => value
  .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
  .replace(/&amp;/g, "&")
  .replace(/&quot;/g, '"')
  .replace(/&#39;/g, "'")
  .replace(/&lt;/g, "<")
  .replace(/&gt;/g, ">")
  .trim();

const tag = (block, name) => {
  const match = block.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, "i"));
  return match ? decode(match[1]).replace(/<[^>]+>/g, "").trim() : "";
};

const atomLink = (block) => {
  const match = block.match(/<link[^>]+href=["']([^"']+)["'][^>]*>/i);
  return match ? decode(match[1]) : "";
};

for (const feed of feeds) {
  try {
    const response = await fetch(feed.url, {
      headers: { "user-agent": "observatoire-citoyen/0.1 (+source-discovery)" },
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const xml = await response.text();
    const blocks = [...xml.matchAll(/<(item|entry)\b[\s\S]*?<\/\1>/gi)].map((match) => match[0]);
    for (const block of blocks) {
      const url = normalizeUrl(tag(block, "link") || atomLink(block) || tag(block, "guid"));
      const title = tag(block, "title");
      if (!url || !title) continue;
      discovered.push({
        id: `inbox-${createHash("sha256").update(url).digest("hex").slice(0, 24)}`,
        kind: "secondaire",
        title,
        publisher: feed.publisher,
        url,
        publishedAt: tag(block, "pubDate") || tag(block, "published") || tag(block, "updated") || null,
        status: "à_qualifier",
        feedUrl: feed.url,
      });
    }
  } catch (error) {
    errors.push({ feed: feed.url, message: error instanceof Error ? error.message : String(error) });
  }
}

const byKey = new Map();
for (const item of existing) {
  const normalized = { ...item, url: normalizeUrl(item.url) };
  if (!sourceKeys(normalized).some((key) => byKey.has(key))) {
    for (const key of sourceKeys(normalized)) byKey.set(key, normalized);
  }
}
for (const item of discovered) {
  if (!sourceKeys(item).some((key) => byKey.has(key))) {
    for (const key of sourceKeys(item)) byKey.set(key, item);
  }
}
const unique = [...new Set(byKey.values())];
const existingKeys = new Set(existing.flatMap(sourceKeys));
const newCount = discovered.filter((item) => !sourceKeys(item).some((key) => existingKeys.has(key))).length;
await mkdir("data/inbox", { recursive: true });
await writeFile("data/inbox/discovered-sources.json", `${JSON.stringify(unique, null, 2)}\n`);
await writeFile("data/inbox/discovery-report.json", `${JSON.stringify({ fetchedAt: new Date().toISOString(), feeds: feeds.length, discovered: unique.length, newEntries: newCount, errors }, null, 2)}\n`);

console.log(`Découverte terminée : ${newCount} nouvelles sources, ${unique.length} sources conservées, ${errors.length} flux en erreur.`);

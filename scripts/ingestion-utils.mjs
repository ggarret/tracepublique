/** Statuts qui empêchent une source d'être retraitée automatiquement. */
export const TERMINAL_SOURCE_STATUSES = new Set(["qualifiée", "rejetée", "publiée", "fusionnée"]);
/** Statuts qui autorisent une nouvelle passe d'analyse ou d'enrichissement. */
export const ANALYZABLE_SOURCE_STATUSES = new Set(["détectée", "à_qualifier", "à qualifier", "à_analyser", "à analyser", "enrichie", "erreur"]);

/** Produit une forme comparable pour les titres, alias et mots-clés. */
export const normalizeText = (value) => String(value ?? "")
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLocaleLowerCase("fr")
  .replace(/[^a-z0-9]+/g, " ")
  .trim();

/** Supprime les variations non éditoriales d'une URL pour le dédoublonnage. */
export const normalizeUrl = (value) => {
  try {
    const url = new URL(String(value).trim());
    url.hash = "";
    for (const key of [...url.searchParams.keys()]) {
      if (/^(utm_|fbclid$|gclid$|mc_cid$|mc_eid$)/i.test(key)) url.searchParams.delete(key);
    }
    url.hostname = url.hostname.toLocaleLowerCase("en");
    if (url.pathname !== "/") url.pathname = url.pathname.replace(/\/+$/, "");
    return url.toString();
  } catch {
    return String(value ?? "").trim();
  }
};

/** Construit les clés utilisées pour repérer une source déjà connue. */
export const sourceKeys = (source) => [
  `url:${normalizeUrl(source.url)}`,
  `title:${normalizeText(source.publisher)}|${normalizeText(source.title)}`,
  source.id ? `id:${source.id}` : null,
].filter(Boolean);

/** Indique si une source peut encore être traitée par le pipeline automatique. */
export const isAnalyzable = (source) => !TERMINAL_SOURCE_STATUSES.has(source.status ?? "à_qualifier")
  && ANALYZABLE_SOURCE_STATUSES.has(source.status ?? "à_qualifier");

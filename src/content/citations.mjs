/**
 * Inline citation tokens.
 *
 * Archive prose marks citations as `[@loc17]` or `[@loc17; @icj16]`. The token
 * stays in the stored text so each superscript lands exactly where the claim
 * is made. The remark plugin (remark-archive-citations.mjs) validates and
 * extracts them at import time; the renderer uses `splitCitations` to turn
 * them into numbered superscripts.
 */
export const CITE_TOKEN = /\[@([a-z0-9][a-z0-9-]*(?:\s*;\s*@[a-z0-9][a-z0-9-]*)*)\]/g;

/** Source ids inside one token body: "loc17; @icj16" -> ["loc17", "icj16"]. */
export function idsOfToken(body) {
  return body.split(";").map((x) => x.trim().replace(/^@/, "")).filter(Boolean);
}

/** Split text into `{ text }` and `{ cite: string[] }` parts, in reading order. */
export function splitCitations(text) {
  const parts = [];
  let last = 0;
  for (const m of text.matchAll(CITE_TOKEN)) {
    if (m.index > last) parts.push({ text: text.slice(last, m.index) });
    parts.push({ cite: idsOfToken(m[1]) });
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push({ text: text.slice(last) });
  return parts;
}

/** All source ids cited by tokens in `text`, in order, de-duplicated. */
export function citedIds(text) {
  const out = [];
  for (const p of splitCitations(text)) for (const id of p.cite ?? []) if (!out.includes(id)) out.push(id);
  return out;
}

/** Text with tokens removed (for meta descriptions, search, tests). */
export function stripCitations(text) {
  return text.replace(CITE_TOKEN, "").replace(/\s{2,}/g, " ").replace(/\s+([.,;:])/g, "$1").trim();
}

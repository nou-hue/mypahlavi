import { KINDS, DISPLAYABLE_RIGHTS, UNVERIFIED_MARKER } from "./schema.mjs";
import { citedIds } from "./citations.mjs";

/**
 * Turn raw JSON files into a validated dataset.
 *
 * `files` is `{ [path]: json }` where path looks like
 * `content/archive/<kind>/<id>.json` (any prefix is fine; only the last two
 * segments matter). Returns `{ data, errors }`:
 *  - `errors` lists every problem with a file path, so authors can fix them.
 *  - `data` holds only records that passed *both* the schema and the
 *    cross-checks, so the site fails closed: a broken record is left out
 *    rather than half-rendered.
 */
export function buildDataset(files) {
  const errors = [];
  const data = { sources: [], plates: [], articles: [], events: [], collections: [] };
  const pathOf = new Map();

  for (const [path, json] of Object.entries(files)) {
    // A record the production gate stripped from the bundle (see scripts/archive-content-gate.mjs).
    if (json === null) continue;
    const parts = path.split("/");
    const file = parts.at(-1);
    const dir = parts.at(-2);
    const kind = Object.keys(KINDS).find((k) => KINDS[k].dir === dir);
    if (!kind) {
      errors.push({ path, message: `unknown folder "${dir}" — expected one of ${Object.values(KINDS).map((k) => k.dir).join(", ")}` });
      continue;
    }
    const { schema, key } = KINDS[kind];
    const parsed = schema.safeParse(json);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        errors.push({ path, message: `${issue.path.join(".") || "(root)"}: ${issue.message}` });
      }
      continue;
    }
    const rec = parsed.data;
    if (`${rec[key]}.json` !== file) {
      errors.push({ path, message: `file name must be "${rec[key]}.json" to match its ${key}` });
      continue;
    }
    pathOf.set(`${kind}:${rec[key]}`, path);
    data[kind].push(rec);
  }

  // Cross-checks run repeatedly: dropping a broken record can leave another
  // record pointing at it, so we iterate until nothing new is dropped.
  const runChecks = () => {
  const bad = new Set();
  const has = (kind, id) => data[kind].some((r) => r[KINDS[kind].key] === id);
  const get = (kind, id) => data[kind].find((r) => r[KINDS[kind].key] === id);
  const fail = (kind, rec, message) => {
    errors.push({ path: pathOf.get(`${kind}:${rec[KINDS[kind].key]}`) ?? kind, message });
    bad.add(`${kind}:${rec[KINDS[kind].key]}`);
  };
  const live = (rec) => rec.status === "published";

  // Sources must exist and be citable.
  const checkCites = (kind, rec, cites, where) => {
    for (const c of cites ?? []) {
      if (!has("sources", c.sourceId)) fail(kind, rec, `${where}: unknown source "${c.sourceId}"`);
    }
  };

  for (const s of data.sources) {
    if (live(s) && !(s.url || s.institution || s.publisher)) {
      fail("sources", s, "a published source needs a url, institution or publisher so readers can find it");
    }
    if (live(s) && !s.perspective && ["primary", "oral-history", "periodical"].includes(s.type)) {
      fail("sources", s, `a published ${s.type} source needs a "perspective" (whose voice is this?)`);
    }
  }

  for (const p of data.plates) {
    for (const id of p.sourceIds) if (!has("sources", id)) fail("plates", p, `unknown source "${id}"`);
    const showable = p.image && DISPLAYABLE_RIGHTS.includes(p.rights.status);
    if (p.image && !showable && live(p)) {
      fail("plates", p, `rights status "${p.rights.status}" does not allow a published image — set image to null or clear the rights`);
    }
    if (live(p)) {
      if (!p.rights.holder) fail("plates", p, 'published plate needs rights.holder');
      if (!p.rights.evidence) fail("plates", p, 'published plate needs rights.evidence (how do you know?)');
      if (p.rights.status === "cc" && !p.rights.licence) fail("plates", p, 'rights.status "cc" needs rights.licence');
      if (p.date.precision === "unknown") fail("plates", p, "published plate needs a date (or a decade/century precision)");
      if (p.sourceIds.length === 0) fail("plates", p, "published plate needs at least one sourceId");
    }
    if (p.status === "placeholder" && p.image) {
      fail("plates", p, "a placeholder plate must not carry a real image");
    }
  }

  for (const a of data.articles) {
    const cited = [];
    for (const [i, b] of a.body.entries()) {
      if (b.type === "plate" && !has("plates", b.plateId)) fail("articles", a, `body[${i}]: unknown plate "${b.plateId}"`);
      const cs = b.type === "quote" ? [b.cite] : b.cite;
      checkCites("articles", a, cs, `body[${i}]`);
      cited.push(...(cs ?? []));
    }
    checkCites("articles", a, a.furtherReading, "furtherReading");
    for (const id of a.plateIds) if (!has("plates", id)) fail("articles", a, `unknown plate "${id}"`);
    if (a.template === "photograph" && a.plateIds.length === 0) {
      fail("articles", a, 'a "photograph" entry needs plateIds[0] — the photograph it is about');
    }
    if (live(a)) {
      if (cited.length + a.furtherReading.length === 0) fail("articles", a, "a published entry needs at least one source citation");
      if (!a.standfirst) fail("articles", a, "a published entry needs a standfirst");
      if (!a.byline) fail("articles", a, "a published entry needs a byline");
      if (!a.reviewedBy) fail("articles", a, "a published entry needs reviewedBy");
      if (a.body.length === 0) fail("articles", a, "a published entry needs body content");
      if (a.template === "document") {
        const kinds = [...cited, ...a.furtherReading].map((c) => get("sources", c.sourceId)?.type);
        if (!kinds.includes("primary") && !kinds.includes("archive-record")) {
          fail("articles", a, 'a "document" entry must cite the document itself (a primary or archive-record source)');
        }
      }
    }
  }

  for (const e of data.events) {
    checkCites("events", e, e.cite, "cite");
    if (e.entrySlug && !has("articles", e.entrySlug)) fail("events", e, `unknown entry "${e.entrySlug}"`);
    if (live(e)) {
      if (e.cite.length === 0) fail("events", e, "a published timeline event needs at least one citation");
      if (e.date.precision === "unknown") fail("events", e, "a published timeline event needs a date");
      if (e.confidence === "disputed" && !e.perspective) fail("events", e, 'a "disputed" event must say whose account it is in "perspective"');
    }
  }

  for (const c of data.collections) {
    if (c.coverPlateId && !has("plates", c.coverPlateId)) fail("collections", c, `unknown cover plate "${c.coverPlateId}"`);
    const kindMap = { entry: "articles", plate: "plates", event: "events" };
    for (const m of c.members) {
      if (!has(kindMap[m.kind], m.id)) fail("collections", c, `member ${m.kind} "${m.id}" does not exist`);
    }
  }

  /* ---- generic, record-wide rules ---- */
  const RANK = { draft: 0, review: 1 };
  const allRecords = Object.keys(data).flatMap((kind) => data[kind].map((rec) => [kind, rec]));
  const refsOf = (kind, rec) => {
    const out = [];
    const cites = (cs) => (cs ?? []).forEach((c) => out.push(["sources", c.sourceId]));
    if (kind === "plates") rec.sourceIds.forEach((id) => out.push(["sources", id]));
    if (kind === "articles") {
      rec.plateIds.forEach((id) => out.push(["plates", id]));
      rec.related.forEach((id) => out.push(["articles", id]));
      cites(rec.furtherReading);
      for (const b of rec.body) {
        if (b.type === "plate") out.push(["plates", b.plateId]);
        cites(b.type === "quote" ? [b.cite] : b.cite);
      }
    }
    if (kind === "events") {
      cites(rec.cite);
      rec.plateIds.forEach((id) => out.push(["plates", id]));
      if (rec.entrySlug) out.push(["articles", rec.entrySlug]);
    }
    if (kind === "collections") {
      if (rec.coverPlateId) out.push(["plates", rec.coverPlateId]);
      const map = { entry: "articles", plate: "plates", event: "events" };
      rec.members.forEach((m) => out.push([map[m.kind], m.id]));
    }
    return out;
  };
  for (const [kind, rec] of allRecords) {
    const own = RANK[rec.status] ?? 2; // draft 0, review 1, published/placeholder 2
    if (own === 0) continue;
    // 1. A shipped record may not lean on a draft, and a published one may not lean on a record that is still in review.
    for (const [rk, rid] of refsOf(kind, rec)) {
      const target = get(rk, rid);
      if (!target) continue; // reported elsewhere
      const t = RANK[target.status] ?? 2;
      if (t < own && !(own === 1 && t === 1)) {
        fail(kind, rec, `refers to ${rk.slice(0, -1)} "${rid}" which is "${target.status}"; set it to at least "${rec.status}" first, or remove the reference`);
      }
    }
    // 2. Nothing shipped may carry an unverified marker.
    const strings = JSON.stringify(rec);
    const mk = UNVERIFIED_MARKER.exec(strings);
    if (mk) fail(kind, rec, `contains the unverified marker "${strings.slice(mk.index, mk.index + 40)}…" — resolve it, or set status to "draft"`);
  }
  // 3. Inline citation tokens must be listed in the block's cite array, and a published claim
  //    cannot rest on tier C (tertiary pointer) sources alone.
  const tierC = (id) => get("sources", id)?.tier === "C";
  for (const a of data.articles) {
    for (const [i, b] of a.body.entries()) {
      if (b.type === "quote" || b.type === "heading" || b.type === "plate") continue;
      const texts = b.type === "list" ? b.items : [b.text];
      const inline = texts.flatMap((t) => citedIds(t));
      const listed = new Set((b.cite ?? []).map((c) => c.sourceId));
      for (const id of inline) if (!listed.has(id)) fail("articles", a, `body[${i}]: [@${id}] appears in the text but not in the block's cite list`);
      if (a.status === "published" && listed.size > 0 && [...listed].every(tierC)) {
        fail("articles", a, `body[${i}]: a published claim cannot rest on tier C sources alone — add a tier A or B source`);
      }
    }
  }
  for (const e of data.events) {
    if (e.status === "published" && e.cite.length > 0 && e.cite.every((c) => tierC(c.sourceId))) {
      fail("events", e, "a published event cannot rest on tier C sources alone — add a tier A or B source");
    }
  }

  return bad;
  };

  for (;;) {
    const bad = runChecks();
    if (bad.size === 0) break;
    for (const kind of Object.keys(data)) {
      data[kind] = data[kind].filter((r) => !bad.has(`${kind}:${r[KINDS[kind].key]}`));
    }
  }
  return { data, errors };
}

/** What the site can show. `review` records exist only in non-production bundles. */
export const isVisible = (rec) => ["published", "placeholder", "review"].includes(rec.status);

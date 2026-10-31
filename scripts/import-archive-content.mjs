#!/usr/bin/env node
/**
 * Imports Content & SEO's archive drafts into content/archive/*.json.
 *
 *   node scripts/import-archive-content.mjs [--from <dir>] [--download]
 *
 *   --from <dir>   Refresh content/source/ from a Content & SEO drop (SPEC.md layout),
 *                  then import. Without it, content/source/ (committed) is used.
 *   --download     Self-host the images: fetch each cleared image from Wikimedia Commons
 *                  once, into public/archive/plates/. The site never hotlinks Commons.
 *
 * What it does
 *   - Reads data/*.json and content/**\/*.mdx from content/source/.
 *   - Parses each MDX body with unified + remark-parse + remarkArchiveCitations
 *     (an unknown [@id] aborts the import).
 *   - Maps everything onto the archive schema (src/content/schema.mjs).
 *   - Status: "review" (preview-only) when clean; "draft" (never shipped) when the
 *     text still carries [VERIFY], [CONFIRM] or [UPGRADE], the source says it is
 *     blocked, or an image is on hold. Promotion to "published" is a human decision.
 *
 * Deterministic: re-running overwrites the generated records. Hand edits belong in
 * content/source/ (or, once published, directly in content/archive/ — then stop importing).
 */
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync, statSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { unified } from "unified";
import remarkParse from "remark-parse";
import { load as yamlLoad } from "js-yaml";
import { remarkArchiveCitations } from "../src/content/remark-archive-citations.mjs";
import { UNVERIFIED_MARKER } from "../src/content/schema.mjs";
import { citedIds } from "../src/content/citations.mjs";

const root = resolve(import.meta.dirname, "..");
const args = process.argv.slice(2);
const fromIdx = args.indexOf("--from");
const download = args.includes("--download");
const srcDir = join(root, "content/source");
const outDir = join(root, "content/archive");

if (fromIdx >= 0) {
  const from = resolve(args[fromIdx + 1] ?? "");
  for (const sub of ["data", "content"]) {
    rmSync(join(srcDir, sub), { recursive: true, force: true });
    // shop-links.json is deliberately never imported: archive-to-shop links stay unwired
    // until product artwork provenance and titles are settled.
    cpSync(join(from, sub), join(srcDir, sub), { recursive: true, filter: (f) => !f.endsWith("shop-links.json") });
  }
}

const readJson = (p) => JSON.parse(readFileSync(join(srcDir, p), "utf8"));
const problems = [];
const problem = (m) => problems.push(m);

/* ------------------------------ helpers ------------------------------ */
const MONTHS = ["january","february","march","april","may","june","july","august","september","october","november","december"];
const pad = (n) => String(n).padStart(2, "0");
const lc = (s) => s.toLowerCase();
const hasMarker = (s) => UNVERIFIED_MARKER.test(s);

/** Free-text date from Content & SEO -> archive date object. */
function parseDate(raw) {
  const t = String(raw ?? "").replace(/[\s\u00a0\u202f]+/g, " ").trim();
  let m;
  if ((m = /^(\d{4})\/(\d{4})$/.exec(t))) return { precision: "year", value: m[1], end: m[2] };
  if ((m = /^(\d{4})-(\d{2})-(\d{2})(?:[ T].*)?$/.exec(t))) return { precision: "day", value: `${m[1]}-${m[2]}-${m[3]}` };
  if ((m = /^(\d{4})-(\d{2})$/.exec(t))) return { precision: "month", value: t };
  if ((m = /^(\d{4})$/.exec(t))) return { precision: "year", value: t };
  if ((m = /^(\d{4})s$/.exec(t))) return { precision: "decade", value: t };
  if ((m = /^circa (\d{4})$/i.exec(t))) return { precision: "year", value: m[1], circa: true };
  if ((m = /^between (\d{4}) and (\d{4})$/i.exec(t))) return { precision: "year", value: m[1], end: m[2] };
  if ((m = /^(?:Taken on )?(\d{1,2}) ([A-Za-z]+) (\d{4})(?:,.*)?$/.exec(t)) && MONTHS.includes(lc(m[2]))) {
    return { precision: "day", value: `${m[3]}-${pad(MONTHS.indexOf(lc(m[2])) + 1)}-${pad(m[1])}` };
  }
  if ((m = /^(\d{1,2})-(\d{1,2}) ([A-Za-z]+) (\d{4})$/.exec(t)) && MONTHS.includes(lc(m[3]))) {
    const mo = pad(MONTHS.indexOf(lc(m[3])) + 1);
    return { precision: "day", value: `${m[4]}-${mo}-${pad(m[1])}`, end: `${m[4]}-${mo}-${pad(m[2])}` };
  }
  if ((m = /^before (\d{1,2}) ([A-Za-z]+) (\d{4})$/i.exec(t)) && MONTHS.includes(lc(m[2]))) {
    return { precision: "day", value: `${m[3]}-${pad(MONTHS.indexOf(lc(m[2])) + 1)}-${pad(m[1])}`, note: "Before this date." };
  }
  problem(`unparsed date "${t}"`);
  return { precision: "unknown" };
}
function periodToDate(period) {
  const m = /^(\d{4})\s*[–-]\s*(\d{4})$/.exec(period ?? "");
  if (m) return { precision: "year", value: m[1], end: m[2] };
  if (/^\d{4}$/.test(period ?? "")) return { precision: "year", value: period };
  return { precision: "unknown" };
}
const clean = (o) => JSON.parse(JSON.stringify(o, (k, v) => (v === undefined ? undefined : v)));

/* ------------------------------ sources ------------------------------ */
const srcRaw = readJson("data/sources.json").sources;
const TYPE_MAP = {
  "official-reference": "reference",
  archive: "archive-record",
  court: "primary",
  "news-archive": "periodical",
  encyclopedia: "reference",
  tertiary: "reference",
  scholarly: "secondary",
};
const sources = new Map();
for (const s of srcRaw) {
  const notOpened = !/^\d{4}-\d{2}-\d{2}$/.test(s.accessed);
  sources.set(s.id, clean({
    id: s.id,
    status: notOpened ? "draft" : "review",
    type: TYPE_MAP[s.type] ?? "reference",
    title: s.title,
    creator: s.author,
    publisher: s.publisher,
    date: s.date && /^\d{4}-\d{2}-\d{2}$/.test(s.date) ? parseDate(s.date) : s.year ? { precision: "year", value: String(s.year) } : undefined,
    url: s.url,
    accessed: notOpened ? undefined : s.accessed,
    note: [s.note, notOpened ? "Listed as a pointer; not yet opened by the researcher." : null].filter(Boolean).join(" "),
    tier: s.tier,
    edition: s.edition,
    rights: s.rights,
  }));
}

/* ------------------------------ plates ------------------------------- */
const imgRaw = readJson("data/images.json").images;
const plateId = (id) => lc(id);
const IMAGE_STATUS = { approved: "review", "approved-editorial-with-attribution": "review", "verify-before-use": "review", hold: "draft", "do-not-use": "draft" };
const plates = new Map();
for (const i of imgRaw) {
  const id = plateId(i.id);
  const shown = ["approved", "approved-editorial-with-attribution"].includes(i.status);
  const isCC = /^CC BY/i.test(i.license);
  const rightsStatus = shown ? (isCC ? "cc" : "public-domain") : i.status === "verify-before-use" ? "pending" : i.status === "hold" ? "pending" : "unknown";
  const date = parseDate(i.dateText);
  plates.set(id, {
    rec: clean({
      id,
      status: IMAGE_STATUS[i.status],
      title: i.caption.replace(/\.$/, "").slice(0, 110),
      caption: i.caption,
      image: shown
        ? { src: `/archive/plates/${id}.jpg`, alt: i.alt, width: undefined, height: undefined }
        : null,
      date,
      credit: { line: i.attribution, creator: i.author, sourceUrl: i.pageUrl },
      rights: {
        status: rightsStatus,
        holder: i.author,
        licence: i.license,
        licenceUrl: i.licenseUrl || undefined,
        evidence: `${i.rightsNote} Checked via ${i.verifiedVia} on ${i.verifiedOn}.`,
        tier: i.rightsTier,
        ukSafe: i.ukSafe,
        checkedBy: "Content & SEO (automated Commons API check)",
        checkedOn: i.verifiedOn,
      },
      sourceIds: [],
      uncertainty: i.status === "verify-before-use" ? "Rights check pending: the licence needs confirming at the holding institution before the image is shown." : undefined,
      useFor: i.useFor,
      captionBasis: i.captionBasis,
      holdReason: shown ? undefined : i.rightsNote,
    }),
    raw: i,
    alt: i.alt,
  });
}

/* ----------------------- MDX -> body blocks ------------------------- */
const processor = (usesOut, errors) =>
  unified().use(remarkParse).use(remarkArchiveCitations, {
    sourceIds: new Set(sources.keys()),
    uses: usesOut,
    onError: (m) => errors.push(m),
  });

function inline(node) {
  switch (node.type) {
    case "text": return node.value.replace(/\*/g, "\\*");
    case "emphasis": return `*${node.children.map(inline).join("")}*`;
    case "strong": return `**${node.children.map(inline).join("")}**`;
    case "link": return `[${node.children.map(inline).join("")}](${node.url})`;
    case "inlineCode": return node.value;
    case "break": return " ";
    case "archiveCitation": return `[@${node.ids.join("; @")}]`;
    default:
      problem(`unsupported inline node "${node.type}"`);
      return "";
  }
}
const cites = (text) => citedIds(text).map((sourceId) => ({ sourceId }));
const unescape = (t) => t.replace(/\\\*/g, "\u2217"); // keep a literal asterisk out of emphasis parsing

function toBlocks(markdown, label) {
  const errors = [];
  const tree = processor([], errors).parse(markdown);
  processor([], errors).runSync(tree);
  const blocks = [];
  for (const n of tree.children) {
    if (n.type === "heading") blocks.push({ type: "heading", text: n.children.map(inline).join("").trim() });
    else if (n.type === "paragraph") {
      const text = unescape(n.children.map(inline).join("").trim());
      const c = cites(text);
      blocks.push(clean({ type: "paragraph", text, cite: c.length ? c : undefined }));
    } else if (n.type === "list") {
      const items = n.children.map((li) => unescape(li.children.map((p) => p.children.map(inline).join("")).join(" ").trim()));
      const c = cites(items.join(" "));
      blocks.push(clean({ type: "list", items, cite: c.length ? c : undefined }));
    } else if (n.type === "thematicBreak") continue;
    else problem(`${label}: unsupported block "${n.type}"`);
  }
  for (const e of errors) problem(`${label}: ${e}`);
  return blocks;
}

function readMdx(path) {
  const t = readFileSync(join(srcDir, path), "utf8");
  const m = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/.exec(t);
  if (!m) throw new Error(`${path}: no frontmatter`);
  return { fm: yamlLoad(m[1]), body: m[2], raw: t };
}

/* ------------------------------ articles ------------------------------ */
const articles = new Map();
const mdxFiles = (dir) => readdirSync(join(srcDir, dir)).filter((f) => f.endsWith(".mdx")).sort().map((f) => `${dir}/${f}`);

function holdReasons(fm, body) {
  const why = [];
  const marks = [...new Set((fm.reviewNote ? [] : []).concat(body.match(/\[(?:VERIFY|CONFIRM|UPGRADE)[^\]]{0,60}/g) ?? []))];
  if (marks.length) why.push(`unverified markers in the text: ${marks.map((x) => x + "…]").join(" ")}`);
  if (/needs-sources|blocked/.test(fm.status ?? "")) why.push(`source status "${fm.status}"`);
  if (fm.reviewNote) why.push(fm.reviewNote);
  return why;
}

function spreadPlates(blocks, extra) {
  // Put each additional plate after a successive section (before the next heading).
  if (extra.length === 0) return blocks;
  const out = [];
  const queue = [...extra];
  let seenHeading = false;
  for (const b of blocks) {
    if (b.type === "heading" && seenHeading && queue.length) out.push({ type: "plate", plateId: queue.shift() });
    if (b.type === "heading") seenHeading = true;
    out.push(b);
  }
  while (queue.length) out.push({ type: "plate", plateId: queue.shift() });
  return out;
}

const liveImageIds = (ids) =>
  (ids ?? []).map(plateId).filter((id) => {
    const p = plates.get(id);
    if (!p) { problem(`unknown image "${id}"`); return false; }
    return p.rec.status !== "draft";
  });

for (const path of [...mdxFiles("content/sections"), ...mdxFiles("content/editorial")]) {
  const { fm, body } = readMdx(path);
  const isSection = path.includes("/sections/");
  const why = holdReasons(fm, body);
  const imgs = liveImageIds(fm.images);
  const blocks = toBlocks(body, path);
  const status = why.length ? "draft" : "review";
  const rec = clean({
    slug: fm.slug,
    status,
    template: "essay",
    kind: isSection ? "section" : "editorial",
    order: isSection ? fm.order : undefined,
    period: isSection ? fm.period : undefined,
    title: fm.title,
    standfirst: isSection ? fm.summary : fm.standfirst,
    date: isSection ? periodToDate(fm.period) : { precision: "unknown" },
    seoTitle: fm.seoTitle,
    metaDescription: fm.metaDescription,
    readingMinutes: fm.readingMinutes,
    facts: isSection ? [{ label: "Period", value: fm.period }] : [],
    plateIds: imgs,
    body: spreadPlates(blocks, imgs.slice(1)),
    furtherReading: [],
    related: (fm.related ?? []),
    reviewNote: why.length ? `Held as a draft: ${why.join("; ")}` : undefined,
  });
  articles.set(fm.slug, { rec, fm, path });
}

/* places -> "place" template entries */
for (const p of readJson("data/places.json").places) {
  const body = [];
  for (const f of p.facts) {
    const tok = `[@${f.s.join("; @")}]`;
    const t = f.t.endsWith(".") ? `${f.t.slice(0, -1)}${tok}.` : `${f.t}${tok}`;
    body.push({ type: "paragraph", text: t, cite: cites(t) });
  }
  const why = [];
  if (p.flag) why.push(`flagged by Content & SEO: ${p.flag}`);
  const flagText = JSON.stringify(p);
  if (hasMarker(flagText)) why.push("unverified marker in text");
  articles.set(p.slug, {
    rec: clean({
      slug: p.slug,
      // A "tertiary source only" or "date contested" flag is not an unverified marker; it is shown on the page.
      status: hasMarker(flagText) ? "draft" : "review",
      template: "place",
      kind: "place",
      title: p.name,
      standfirst: p.summary,
      date: { precision: "unknown" },
      place: p.region,
      facts: [{ label: "Region", value: p.region }, ...(p.flag ? [{ label: "Evidence note", value: `Currently ${p.flag}.` }] : [])],
      plateIds: liveImageIds(p.images),
      body,
      furtherReading: [],
      related: [...p.sections, ...p.editorial],
    }),
    fm: p,
    path: "data/places.json",
  });
}

// "Related" may only point at entries that are not held drafts.
for (const a of articles.values()) {
  a.rec.related = a.rec.related.filter((slug) => articles.has(slug) && articles.get(slug).rec.status !== "draft" && slug !== a.rec.slug);
}

/* ------------------------------ events -------------------------------- */
const CONF = { high: "documented", medium: "to-verify", contested: "disputed" };
const events = new Map();
for (const e of readJson("data/timeline.json").events) {
  const entry = e.sections.map((s) => articles.get(s)).find((a) => a && a.rec.status !== "draft");
  const note = e.confidence === "contested"
    ? "Sources differ on this point. The entry above follows the cited sources; read them for the variance."
    : e.confidence === "medium"
      ? "Rests on a tertiary source and has not yet been independently confirmed."
      : undefined;
  events.set(e.id, clean({
    id: e.id,
    status: "review",
    title: e.title,
    summary: e.summary,
    date: parseDate(e.date.includes("/") ? e.date : e.date),
    confidence: CONF[e.confidence],
    perspective: e.confidence === "contested" ? "Accounts differ between the cited sources." : undefined,
    note,
    cite: e.sources.map((sourceId) => ({ sourceId })),
    entrySlug: entry?.rec.slug,
    plateIds: liveImageIds(e.images),
  }));
}

/* plate -> sources: link each plate to the sources of the sections/events that use it */
for (const [id, p] of plates) {
  const used = new Set();
  for (const a of articles.values()) if (a.rec.plateIds.includes(id) || a.rec.body.some((b) => b.plateId === id)) {
    for (const c of citedIdsOfArticle(a.rec)) used.add(c);
  }
  for (const e of events.values()) if (e.plateIds.includes(id)) e.cite.forEach((c) => used.add(c.sourceId));
  p.rec.sourceIds = [...used].slice(0, 3);
}
function citedIdsOfArticle(rec) {
  return rec.body.flatMap((b) => (b.cite ?? []).map((c) => c.sourceId));
}

/* ----------------------------- collections ---------------------------- */
const collections = new Map();
const visibleEntry = (slug) => articles.get(slug)?.rec.status !== "draft" && articles.has(slug);
const visiblePlate = (id) => plates.get(plateId(id))?.rec.status !== "draft" && plates.has(plateId(id));
for (const c of readJson("data/collections.json").collections) {
  let members = [];
  const m = c.members;
  if (m.data === "timeline.json") members = [...events.values()].map((e) => ({ kind: "event", id: e.id }));
  else if (m.sections) members = m.sections.filter(visibleEntry).map((id) => ({ kind: "entry", id }));
  else if (m.places) members = m.places.filter(visibleEntry).map((id) => ({ kind: "entry", id }));
  else if (m.editorial) members = m.editorial.filter(visibleEntry).map((id) => ({ kind: "entry", id }));
  else if (m.images) members = m.images.filter(visiblePlate).map((id) => ({ kind: "plate", id: plateId(id) }));
  else if (m.filter) members = [...plates.values()].filter((p) => ["approved", "approved-editorial-with-attribution"].includes(p.raw.status)).map((p) => ({ kind: "plate", id: p.rec.id }));
  else problem(`collection ${c.slug}: unknown members shape`);
  const cover = members.find((x) => x.kind === "plate" && plates.get(x.id)?.rec.image)?.id
    ?? members.filter((x) => x.kind === "entry").map((x) => articles.get(x.id).rec.plateIds.find((p) => plates.get(p).rec.image)).find(Boolean);
  collections.set(c.slug, clean({
    slug: c.slug,
    status: members.length ? "review" : "draft",
    title: c.title,
    description: c.description,
    coverPlateId: cover,
    members,
    curatorNote: members.length ? undefined : "Held: every member is still a draft.",
  }));
}

/* ------------------------ images: self-host ---------------------------- */
const plateDir = join(root, "public/archive/plates");
const UA = "mypahlavi-archive-import/1.0 (https://www.mypahlavi.com; hello@mypahlavi.com)";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const dims = (file) => {
  const out = execFileSync("python3", ["-c", "import sys;from PIL import Image;i=Image.open(sys.argv[1]);print(i.width,i.height)", file]).toString().trim().split(" ").map(Number);
  return { width: out[0], height: out[1] };
};
async function fetchTo(url, file) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const r = await fetch(url, { headers: { "user-agent": UA } });
    if (r.status === 429 || r.status >= 500) { await sleep(4000 * (attempt + 1)); continue; }
    if (!r.ok) throw new Error(`${r.status} ${url}`);
    writeFileSync(file, Buffer.from(await r.arrayBuffer()));
    return r.headers.get("content-type");
  }
  throw new Error(`gave up on ${url}`);
}
mkdirSync(plateDir, { recursive: true });
for (const [id, p] of plates) {
  if (!p.rec.image) continue;
  const base = join(plateDir, `${id}.jpg`);
  if (download && !existsSync(base)) {
    // Largest practical size is 960px wide; smaller originals are fetched as they are.
    const url = p.raw.width <= 960 ? p.raw.originalUrl : p.raw.thumbUrl960.replace("thumb.wikimedia.org", "upload.wikimedia.org");
    const type = await fetchTo(url, base);
    if (!/jpeg/.test(type ?? "")) {
      // PNG/other: convert once so the record's path is stable.
      execFileSync("python3", ["-c", "import sys;from PIL import Image;Image.open(sys.argv[1]).convert('RGB').save(sys.argv[1],'JPEG',quality=88)", base]);
    }
    await sleep(1200);
  }
  if (!existsSync(base)) { problem(`image file missing for ${id} (run with --download)`); continue; }
  const d = dims(base);
  p.rec.image.width = d.width;
  p.rec.image.height = d.height;
  const small = join(plateDir, `${id}-500.jpg`);
  if (d.width > 640) {
    if (!existsSync(small)) execFileSync("python3", ["-c", "import sys;from PIL import Image;i=Image.open(sys.argv[1]).convert('RGB');i.thumbnail((500,5000));i.save(sys.argv[2],'JPEG',quality=82)", base, small]);
    p.rec.image.variants = [{ src: `/archive/plates/${id}-500.jpg`, width: 500 }];
  }
}

/* ------------------------------ write ---------------------------------- */
if (problems.length) {
  console.error("import problems:\n" + problems.map((x) => "  - " + x).join("\n"));
  process.exit(1);
}
const kinds = {
  sources: [...sources.values()],
  plates: [...plates.values()].map((p) => p.rec),
  articles: [...articles.values()].map((a) => a.rec),
  events: [...events.values()],
  collections: [...collections.values()],
};
for (const [dir, list] of Object.entries(kinds)) {
  const key = dir === "articles" || dir === "collections" ? "slug" : "id";
  const d = join(outDir, dir);
  mkdirSync(d, { recursive: true });
  for (const f of readdirSync(d)) rmSync(join(d, f)); // regenerated wholesale (placeholders are retired)
  for (const rec of list) writeFileSync(join(d, `${rec[key]}.json`), JSON.stringify(rec, null, 2) + "\n");
}
const held = (list, key) => list.filter((r) => r.status === "draft").map((r) => r[key]);
console.log(`imported: ${sources.size} sources, ${plates.size} plates, ${articles.size} entries, ${events.size} events, ${collections.size} collections`);
console.log(`held as draft → sources: ${held(kinds.sources, "id").join(", ") || "-"}`);
console.log(`                 plates: ${held(kinds.plates, "id").join(", ") || "-"}`);
console.log(`                 entries: ${held(kinds.articles, "slug").join(", ") || "-"}`);
console.log(`                 collections: ${held(kinds.collections, "slug").join(", ") || "-"}`);

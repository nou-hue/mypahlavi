import assert from "node:assert/strict";
import { test } from "node:test";
import { checkContent } from "./content-check.mjs";
import { buildDataset } from "../src/content/validate.mjs";
import { createArchive } from "../src/content/queries.mjs";
import { checkDateValue, formatDate, sortKey, decadeOf } from "../src/content/dates.mjs";

/* ---- fixtures live in the tests only; none of this ships as site content ---- */
const src = (o = {}) => ({ id: "s1", status: "published", type: "secondary", title: "A book", publisher: "A press", ...o });
const plate = (o = {}) => ({
  id: "p1", status: "published", title: "Plate", caption: "c",
  image: { src: "/archive/x.jpg", alt: "alt" },
  date: { precision: "year", value: "1950" },
  credit: { line: "Credit" },
  rights: { status: "owned", holder: "Us", evidence: "Contract 12" },
  sourceIds: ["s1"], ...o,
});
const art = (o = {}) => ({
  slug: "a1", status: "published", template: "essay", title: "T", standfirst: "S",
  date: { precision: "decade", value: "1950s" }, byline: "B", reviewedBy: "R",
  body: [{ type: "paragraph", text: "x", cite: [{ sourceId: "s1", locator: "p. 4" }] }], ...o,
});
const ev = (o = {}) => ({
  id: "e1", status: "published", title: "E", date: { precision: "year", value: "1951" },
  confidence: "documented", cite: [{ sourceId: "s1" }], ...o,
});
const col = (o = {}) => ({ slug: "c1", status: "published", title: "C", description: "d", members: [], ...o });
const f = (kind, rec, key = "id") => [`content/archive/${kind}/${rec[key]}.json`, rec];
const files = (...pairs) => Object.fromEntries(pairs);
const msgs = (r) => r.errors.map((e) => e.message).join(" | ");

test("the committed content passes the check", () => {
  const { errors } = checkContent();
  assert.deepEqual(errors, []);
});

test("every committed placeholder is clearly marked and makes no claims", () => {
  // Real (published) content is welcome; this only polices placeholders.
  const { data } = checkContent();
  const placeholders = (kind) => data[kind].filter((r) => r.status === "placeholder");
  for (const r of [...placeholders("articles"), ...placeholders("plates"), ...placeholders("events")]) {
    assert.equal(r.date.precision, "unknown", `${r.id ?? r.slug}: a placeholder must not state a date`);
    assert.ok(r.placeholderNote, `${r.id ?? r.slug}: a placeholder needs a placeholderNote`);
  }
  for (const p of placeholders("plates")) assert.equal(p.image, null, `${p.id}: a placeholder has no image`);
  for (const r of placeholders("collections")) assert.ok(r.placeholderNote, `${r.slug}: needs a placeholderNote`);
});

test("dates: validation by precision", () => {
  assert.equal(checkDateValue("1946-03-02", "day"), null);
  assert.match(checkDateValue("1946-02-30", "day"), /real calendar day/);
  assert.match(checkDateValue("1946-13", "month"), /no such month/);
  assert.equal(checkDateValue("1940s", "decade"), null);
  assert.match(checkDateValue("1945s", "decade"), /not a valid decade/);
  assert.equal(checkDateValue("20th", "century"), null);
  assert.match(checkDateValue("22nd", "century"), /not a valid century/);
  assert.match(checkDateValue("21th", "century"), /not a valid century/);
  assert.match(checkDateValue("1946", "day"), /not a valid day/);
  assert.equal(checkDateValue(undefined, "unknown"), null);
  assert.match(checkDateValue("1946", "unknown"), /must not have a value/);
});

test("dates: labels honour precision, circa and ranges", () => {
  assert.equal(formatDate({ precision: "day", value: "1946-03-02" }), "2 March 1946");
  assert.equal(formatDate({ precision: "month", value: "1946-03" }), "March 1946");
  assert.equal(formatDate({ precision: "decade", value: "1940s", circa: true }), "c. 1940s");
  assert.equal(formatDate({ precision: "century", value: "20th" }), "20th century");
  assert.equal(formatDate({ precision: "year", value: "1941", end: "1945" }), "1941 – 1945");
  assert.equal(formatDate({ precision: "year", value: "1941", end: "1945-05-08", endPrecision: "day" }), "1941 – 8 May 1945");
  assert.equal(formatDate({ precision: "unknown" }), "Date to be confirmed");
});

test("dates: sorting and decade grouping", () => {
  assert.ok(sortKey({ precision: "day", value: "1950-01-02" }) > sortKey({ precision: "year", value: "1950" }));
  assert.equal(sortKey({ precision: "unknown" }), null);
  assert.equal(decadeOf({ precision: "century", value: "20th" }), 1900);
  assert.equal(decadeOf({ precision: "year", value: "1957" }), 1950);
});

test("a complete published set validates", () => {
  const r = buildDataset(files(f("sources", src()), f("plates", plate()), f("articles", art({ plateIds: ["p1"] }), "slug"), f("events", ev()), f("collections", col({ members: [{ kind: "entry", id: "a1" }] }), "slug")));
  assert.deepEqual(r.errors, []);
  assert.equal(r.data.articles.length, 1);
});

test("file name must match id", () => {
  const r = buildDataset({ "content/archive/sources/other.json": src() });
  assert.match(msgs(r), /file name must be "s1.json"/);
  assert.equal(r.data.sources.length, 0);
});

test("unknown fields and bad slugs are rejected", () => {
  const r = buildDataset(files(f("sources", src({ colour: "red" })), f("sources", src({ id: "Bad_Slug" }))));
  assert.ok(r.errors.length >= 2);
  assert.equal(r.data.sources.length, 0);
});

test("published article needs a citation, standfirst, byline and review", () => {
  const bare = art({ body: [{ type: "paragraph", text: "x" }], standfirst: undefined, byline: undefined, reviewedBy: undefined });
  const r = buildDataset(files(f("sources", src()), f("articles", bare, "slug")));
  const m = msgs(r);
  assert.match(m, /at least one source citation/);
  assert.match(m, /standfirst/);
  assert.match(m, /byline/);
  assert.match(m, /reviewedBy/);
  assert.equal(r.data.articles.length, 0, "invalid record is dropped (fail closed)");
});

test("draft articles may be incomplete but cannot cite unknown sources", () => {
  const draft = art({ status: "draft", body: [{ type: "paragraph", text: "x", cite: [{ sourceId: "nope" }] }] });
  const r = buildDataset(files(f("articles", draft, "slug")));
  assert.match(msgs(r), /unknown source "nope"/);
  const ok = buildDataset(files(f("articles", art({ status: "draft", body: [], standfirst: undefined }), "slug")));
  assert.deepEqual(ok.errors, []);
});

test("a photograph entry needs its plate; a document entry needs a primary source", () => {
  const r1 = buildDataset(files(f("sources", src()), f("articles", art({ template: "photograph" }), "slug")));
  assert.match(msgs(r1), /needs plateIds\[0\]/);
  const r2 = buildDataset(files(f("sources", src()), f("articles", art({ template: "document" }), "slug")));
  assert.match(msgs(r2), /primary or archive-record/);
  const r3 = buildDataset(files(f("sources", src({ type: "primary", perspective: "Author" })), f("articles", art({ template: "document" }), "slug")));
  assert.deepEqual(r3.errors, []);
});

test("rights: a published image needs cleared rights, holder and evidence", () => {
  const withheld = buildDataset(files(f("sources", src()), f("plates", plate({ rights: { status: "pending", holder: "X", evidence: "asked" } }))));
  assert.match(msgs(withheld), /does not allow a published image/);
  const noEvidence = buildDataset(files(f("sources", src()), f("plates", plate({ rights: { status: "owned", holder: "X" } }))));
  assert.match(msgs(noEvidence), /rights.evidence/);
  const cc = buildDataset(files(f("sources", src()), f("plates", plate({ rights: { status: "cc", holder: "X", evidence: "page" } }))));
  assert.match(msgs(cc), /rights.licence/);
  const nullImage = buildDataset(files(f("sources", src()), f("plates", plate({ image: null, rights: { status: "pending", holder: "X", evidence: "asked" } }))));
  assert.deepEqual(nullImage.errors, []);
});

test("a placeholder plate must not carry a real image", () => {
  const r = buildDataset(files(f("sources", src()), f("plates", plate({ status: "placeholder" }))));
  assert.match(msgs(r), /must not carry a real image/);
});

test("published plates and events need dates and sources", () => {
  const r = buildDataset(files(f("sources", src()), f("plates", plate({ date: { precision: "unknown" }, sourceIds: [] })), f("events", ev({ date: { precision: "unknown" }, cite: [] }))));
  const m = msgs(r);
  assert.match(m, /plate needs a date/);
  assert.match(m, /at least one sourceId/);
  assert.match(m, /event needs a date/);
  assert.match(m, /at least one citation/);
});

test("a disputed event must name the perspective", () => {
  const r = buildDataset(files(f("sources", src()), f("events", ev({ confidence: "disputed" }))));
  assert.match(msgs(r), /perspective/);
});

test("published primary/oral sources must state their perspective", () => {
  const r = buildDataset(files(f("sources", src({ type: "oral-history" }))));
  assert.match(msgs(r), /perspective/);
});

test("collections reject members that do not exist", () => {
  const r = buildDataset(files(f("collections", col({ members: [{ kind: "plate", id: "ghost" }], coverPlateId: "ghost" }), "slug")));
  assert.match(msgs(r), /does not exist/);
  assert.match(msgs(r), /unknown cover plate/);
});

test("dropping a broken record also drops records that depend on it", () => {
  const badSource = src({ type: "primary" }); // missing perspective → dropped
  const r = buildDataset(files(f("sources", badSource), f("events", ev())));
  assert.equal(r.data.sources.length, 0);
  assert.equal(r.data.events.length, 0);
});

test("only published and placeholder records are visible; drafts stay hidden", () => {
  const r = buildDataset(files(
    f("sources", src()),
    f("articles", art({ slug: "pub" }), "slug"),
    f("articles", art({ slug: "dr", status: "draft" }), "slug"),
    f("articles", art({ slug: "rv", status: "review" }), "slug"),
  ));
  const a = createArchive(r.data);
  assert.deepEqual(a.articles.map((x) => x.slug), ["pub"]);
  assert.equal(a.article("dr"), undefined);
  assert.equal(a.onlyPlaceholders, false);
});

test("timeline groups by decade, sorts within, and lists undated last", () => {
  const r = buildDataset(files(
    f("sources", src()),
    f("events", ev({ id: "e-late", title: "Late", date: { precision: "day", value: "1962-05-01" } })),
    f("events", ev({ id: "e-early", title: "Early", date: { precision: "year", value: "1951" } })),
    f("events", ev({ id: "e-mid", title: "Mid", date: { precision: "year", value: "1958" } })),
    f("events", ev({ id: "e-undated", title: "Undated", status: "placeholder", date: { precision: "unknown" } })),
  ));
  const t = createArchive(r.data).timeline();
  assert.deepEqual(t.decades.map((d) => d.decade), [1950, 1960]);
  assert.deepEqual(t.decades[0].items.map((e) => e.id), ["e-early", "e-mid"]);
  assert.deepEqual(t.undated.map((e) => e.id), ["e-undated"]);
});

test("citations are numbered in order of first appearance and reused", () => {
  const body = [
    { type: "paragraph", text: "a", cite: [{ sourceId: "s2", locator: "p. 1" }] },
    { type: "paragraph", text: "b", cite: [{ sourceId: "s1" }, { sourceId: "s2", locator: "p. 1" }] },
    { type: "quote", text: "q", speaker: "X", cite: { sourceId: "s1" } },
  ];
  const r = buildDataset(files(f("sources", src()), f("sources", src({ id: "s2" })), f("articles", art({ body }), "slug")));
  assert.deepEqual(r.errors, []);
  const c = createArchive(r.data).citationsFor(r.data.articles[0]);
  assert.deepEqual(c.numbered, [[1], [2, 1], [2]]);
  assert.equal(c.notes.length, 2);
});

test("collection membership resolves both ways and skips hidden records", () => {
  const r = buildDataset(files(
    f("sources", src()),
    f("articles", art({ slug: "pub" }), "slug"),
    f("articles", art({ slug: "dr", status: "draft" }), "slug"),
    f("collections", col({ members: [{ kind: "entry", id: "pub" }, { kind: "entry", id: "dr" }] }), "slug"),
  ));
  const a = createArchive(r.data);
  assert.deepEqual(a.membersOf(a.collection("c1")).entries.map((e) => e.slug), ["pub"]);
  assert.deepEqual(a.collectionsContaining("entry", "pub").map((c) => c.slug), ["c1"]);
});

/* ---------------- preview isolation ---------------- */
import { scrubProductionSecrets } from "../src/lib/preview-guard.mjs";

const prodEnv = () => ({
  VERCEL_ENV: "preview",
  DATABASE_URL: "postgres://prod", POSTGRES_URL: "p", PGHOST: "h", NEON_PROJECT_ID: "n", VITE_NEON_AUTH_URL: "a",
  STRIPE_SECRET_KEY: "sk_live_x", STRIPE_WEBHOOK_SECRET: "whsec_x", STRIPE_PUBLISHABLE_KEY: "pk_live_x",
  PRINTIFY_API_TOKEN: "t", PRINTIFY_SHOP_ID: "1", SHOP_ADMIN_SECRET: "s", UNRELATED: "keep",
});

test("preview: production database, live Stripe, Printify and auth variables are removed", () => {
  const env = prodEnv();
  const r = scrubProductionSecrets(env);
  assert.equal(r.active, true);
  assert.deepEqual(Object.keys(env).sort(), ["UNRELATED", "VERCEL_ENV"]);
});

test("preview: a test-mode Stripe set is kept, a live publishable key is not", () => {
  const env = { ...prodEnv(), STRIPE_SECRET_KEY: "sk_test_x", STRIPE_PUBLISHABLE_KEY: "pk_live_oops" };
  scrubProductionSecrets(env);
  assert.equal(env.STRIPE_SECRET_KEY, "sk_test_x");
  assert.equal(env.STRIPE_WEBHOOK_SECRET, "whsec_x");
  assert.equal(env.STRIPE_PUBLISHABLE_KEY, undefined);
  assert.equal(env.DATABASE_URL, undefined);
});

test("preview: PREVIEW_DATABASE_URL becomes the only database", () => {
  const env = { ...prodEnv(), PREVIEW_DATABASE_URL: "postgres://preview-only" };
  scrubProductionSecrets(env);
  assert.equal(env.DATABASE_URL, "postgres://preview-only");
  assert.equal(env.POSTGRES_URL, undefined);
});

test("production and local environments are left untouched", () => {
  for (const vercelEnv of ["production", undefined]) {
    const env = { ...prodEnv(), VERCEL_ENV: vercelEnv };
    const before = { ...env };
    assert.equal(scrubProductionSecrets(env).active, false);
    assert.deepEqual(env, before);
  }
});

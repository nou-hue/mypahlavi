import assert from "node:assert/strict";
import { test } from "node:test";
import { unified } from "unified";
import remarkParse from "remark-parse";
import { remarkArchiveCitations } from "../src/content/remark-archive-citations.mjs";
import { canShowImage, canUseOnProduct, withheldReason } from "../src/content/rights-gate.mjs";
import { gateRecord } from "./archive-content-gate.mjs";
import { buildDataset } from "../src/content/validate.mjs";
import { splitCitations, stripCitations } from "../src/content/citations.mjs";
import { SITE_URL, absoluteUrl } from "../src/lib/site-config.mjs";
import { entryJsonLd } from "../src/content/jsonld.mjs";
import { checkContent } from "./content-check.mjs";

const parse = (text, opts) => unified().use(remarkParse).use(remarkArchiveCitations, opts).runSync(unified().use(remarkParse).parse(text), { value: text });

test("citation plugin: known ids pass, unknown ids fail the import", () => {
  const uses = [];
  parse("Claim.[@loc17; @icj16]", { sourceIds: ["loc17", "icj16"], uses });
  assert.throws(() => parse("Claim.[@nope]", { sourceIds: ["loc17"] }), /unknown citation \[@nope\]/);
  const errors = [];
  parse("a [@x] b", { sourceIds: [], onError: (m) => errors.push(m) });
  assert.equal(errors.length, 1);
  assert.doesNotThrow(() => parse("`[@nope]`", { sourceIds: [] }), "code is left alone");
});

test("citation tokens split and strip cleanly", () => {
  assert.deepEqual(splitCitations("A.[@a; @b] B"), [{ text: "A." }, { cite: ["a", "b"] }, { text: " B" }]);
  assert.equal(stripCitations("A.[@a] B."), "A. B.");
});

const plate = (o = {}) => ({
  id: "p", status: "published", image: { src: "/archive/plates/p.jpg", alt: "a" },
  rights: { status: "public-domain", tier: "A", ukSafe: "true" }, useFor: ["editorial", "product"], ...o,
});

test("rights gate: only cleared, self-hosted, non-draft images show", () => {
  assert.equal(canShowImage(plate()), true);
  for (const status of ["pending", "unknown", "withdrawn"]) assert.equal(canShowImage(plate({ rights: { status } })), false, status);
  assert.equal(canShowImage(plate({ status: "draft" })), false);
  assert.equal(canShowImage(plate({ image: null })), false);
  assert.equal(canShowImage(plate({ image: { src: "https://upload.wikimedia.org/x.jpg", alt: "" } })), false, "never hotlink");
  assert.equal(withheldReason(plate()), null);
  assert.match(withheldReason(plate({ rights: { status: "pending" } })), /pending|not cleared/i);
});

test("rights gate: product use needs tier A, UK-safe and an explicit product listing", () => {
  assert.equal(canUseOnProduct(plate()), true);
  assert.equal(canUseOnProduct(plate({ useFor: ["editorial"] })), false);
  assert.equal(canUseOnProduct(plate({ rights: { status: "public-domain", tier: "B", ukSafe: "true" } })), false);
  assert.equal(canUseOnProduct(plate({ rights: { status: "public-domain", tier: "A", ukSafe: "verify" } })), false);
});

test("content gate: drafts never ship; review is stripped only from production", () => {
  assert.equal(gateRecord({ status: "draft" }, false), null);
  assert.equal(gateRecord({ status: "draft" }, true), null);
  assert.notEqual(gateRecord({ status: "review" }, false), null);
  assert.equal(gateRecord({ status: "review" }, true), null);
  assert.notEqual(gateRecord({ status: "published" }, true), null);
});

test("committed content: production build ships no review or draft records", () => {
  const { errors } = checkContent({ production: true });
  assert.deepEqual(errors, []);
});

test("committed content: no unverified marker, hotlink or shop link in non-draft records", () => {
  const { data } = checkContent({ production: false });
  const shipped = JSON.stringify([...data.articles, ...data.plates, ...data.events, ...data.collections, ...data.sources].filter((r) => r.status !== "draft"));
  assert.doesNotMatch(shipped, /\[(?:VERIFY|CONFIRM|UPGRADE)\b/);
  assert.doesNotMatch(shipped, /"products"|shop-links|\/shop\//);
  for (const p of data.plates) if (p.image) assert.match(p.image.src, /^\/archive\/plates\//, p.id);
});

test("validate: unverified marker in a non-draft record fails; in a draft it is allowed", () => {
  const src = { id: "s1", status: "published", type: "secondary", title: "B", publisher: "P", tier: "A" };
  const art = (status, text) => ({
    slug: "a", status, template: "essay", title: "T", standfirst: "S", date: { precision: "decade", value: "1950s" }, byline: "B",
    body: [{ type: "paragraph", text, cite: [{ sourceId: "s1" }] }],
    ...(status === "published" ? { reviewedBy: "R" } : {}),
  });
  const f = (a) => ({ "content/archive/sources/s1.json": src, "content/archive/articles/a.json": a });
  const bad = buildDataset(f(art("published", "Claim [VERIFY: date]")));
  assert.match(bad.errors.map((e) => e.message).join("|"), /VERIFY|unverified/i);
  const ok = buildDataset(f(art("draft", "Claim [VERIFY: date]")));
  assert.deepEqual(ok.errors, []);
});

test("site config: canonical host defaults to www and comes from one constant", () => {
  assert.equal(SITE_URL, "https://www.mypahlavi.com");
  assert.equal(absoluteUrl("/archive"), "https://www.mypahlavi.com/archive");
  const [article] = entryJsonLd({ title: "T", standfirst: "S" }, "/archive/entries/t");
  assert.equal(article.mainEntityOfPage, "https://www.mypahlavi.com/archive/entries/t");
});

/* ---- the 31 October review ---- */
import { readFileSync } from "node:fs";
const rec = (d, k) => JSON.parse(readFileSync(new URL(`../content/archive/${d}/${k}.json`, import.meta.url), "utf8"));

test("review: the four previously flagged pieces are published, reviewed by Content & SEO on 2026-10-31", () => {
  for (const slug of ["the-long-boom-and-its-ceremonies", "persepolis-capitals-and-1971", "reading-the-1953-record", "the-lion-and-sun"]) {
    const a = rec("articles", slug);
    assert.equal(a.status, "published", slug);
    assert.equal(a.reviewedBy, "Content & SEO");
    assert.equal(a.reviewedOn, "2026-10-31");
  }
});

test("review: Lion and Sun opens with 'a long-used emblem' and carries no shop copy", () => {
  const a = rec("articles", "the-lion-and-sun");
  assert.match(a.body[0].text, /^The lion and sun is a long-used emblem of Persia and Iran/);
  assert.doesNotMatch(JSON.stringify(a), /shop|canvas|products/i);
});

test("review: only the Woolf portrait is released, editorial use only; the other 8 stay held and 1 do-not-use", () => {
  const p = rec("plates", "reza-shah-portrait-1938");
  assert.equal(p.status, "published");
  assert.deepEqual(p.useFor, ["editorial"]);
  assert.equal(canShowImage(p), true);
  assert.equal(canUseOnProduct(p), false);
  const held = ["abadan-1941", "tabriz-soviet-1941", "cossack-brigade-1909", "coronation-reza-shah-1926", "tent-city-1971-hold", "demonstrators-1979-hold", "revolutionaries-1979-hold", "khomeini-ghotbzadeh-1978-hold", "shiraz-festival-jalali-1972-do-not-use"];
  for (const id of held) {
    const h = rec("plates", id);
    assert.equal(h.status, "draft", id);
    assert.equal(h.image, null, id);
    assert.equal(canShowImage(h), false, id);
  }
});

test("review: Schmidt has page locators, Najmabadi has none", () => {
  const a = rec("articles", "persepolis-capitals-and-1971");
  const sch = a.body.flatMap((b) => b.cite ?? []).filter((c) => c.sourceId === "schmidt1953");
  assert.ok(sch.length > 0);
  assert.match(rec("sources", "schmidt1953").note, /pp\. 68, 80, 81 and 137/);
  assert.match(rec("sources", "najmabadi2005").note, /no page locator|not available/);
  const lion = rec("articles", "the-lion-and-sun").body.flatMap((b) => b.cite ?? []).filter((c) => c.sourceId === "najmabadi2005");
  for (const c of lion) assert.equal(c.locator, undefined);
});

test("review: University of Tehran, Azadi Tower and TMoCA wording", () => {
  const uot = JSON.stringify(rec("articles", "university-of-tehran"));
  assert.match(uot, /13 March 1934/);
  assert.match(uot, /4 February 1935/);
  assert.deepEqual(rec("events", "1935-university").date, { precision: "day", value: "1935-02-04" });
  assert.deepEqual(rec("events", "1971-azadi").date, { precision: "month", value: "1971-10" });
  assert.match(rec("articles", "azadi-tower").standfirst, /October 1971/);
  assert.doesNotMatch(JSON.stringify([rec("articles", "tehran-museum-of-contemporary-art"), rec("events", "1977-tmoca")]), /Ardalan/);
});

test("review: a production build shows exactly the reviewed pieces and what they need", () => {
  const { data } = checkContent({ production: true });
  assert.deepEqual(data.articles.map((a) => a.slug).sort(), ["persepolis-capitals-and-1971", "reading-the-1953-record", "the-lion-and-sun", "the-long-boom-and-its-ceremonies"]);
  assert.ok(data.plates.every((p) => canShowImage(p) && p.status === "published"));
  assert.ok(data.articles.every((a) => a.status === "published"));
  assert.equal(data.events.length, 0);
});

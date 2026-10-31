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

import { z } from "zod";
import { DATE_PRECISIONS, checkDateValue } from "./dates.mjs";

/* ------------------------------------------------------------------ *
 * Content model for the MyPahlavi archive.
 *
 * One JSON file per record under content/archive/<kind>/<id>.json.
 * Every record has a `status`; only `published` and `placeholder`
 * records are ever shown. Placeholders are labelled on the page and
 * kept out of search engines. See docs/content-guide.md.
 * ------------------------------------------------------------------ */

export const STATUSES = ["placeholder", "draft", "review", "published"];
/**
 * Who sees what:
 *  - published / placeholder: everywhere (placeholders are labelled and noindex).
 *  - review: preview deployments and local builds only, with a "Draft" banner and
 *    noindex. Production builds strip these records from the bundle.
 *  - draft: never shipped. Used for anything still carrying an unverified marker,
 *    a withheld image, or a source problem. Validated, but not bundled.
 */
export const PREVIEW_ONLY_STATUSES = ["review"];

/** Markers Content & SEO leaves where a claim still needs checking. */
export const UNVERIFIED_MARKER = /\[(?:VERIFY|CONFIRM|UPGRADE)\b/;
export const TEMPLATES = ["essay", "photograph", "object", "place", "document"];
export const SOURCE_TYPES = [
  "primary", // letters, memoranda, official records, contemporaneous documents
  "archive-record", // catalogue entry or finding aid for an item in a collection
  "oral-history", // interview or recorded testimony
  "secondary", // scholarship, books, journal articles
  "reference", // encyclopaedias, gazetteers, yearbooks
  "periodical", // newspapers and magazines
];
export const RIGHTS_STATUSES = [
  "public-domain", // out of copyright or no known restriction — say how you know
  "cc", // Creative Commons or similar open licence — licence field required
  "licensed", // written permission on file
  "owned", // MyPahlavi owns it, or the contributor assigned it in writing
  "pending", // permission being sought — image is withheld
  "unknown", // not yet researched — image is withheld
  "withdrawn", // a rights holder objected — image is withheld
];
/** Rights statuses that allow the image itself to be shown. */
export const DISPLAYABLE_RIGHTS = ["public-domain", "cc", "licensed", "owned"];

const slug = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "use lower-case words joined by hyphens, e.g. my-entry-name");
const isoDay = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "use YYYY-MM-DD");
const text = z.string().trim().min(1);
const url = z.string().url().refine((u) => /^https?:\/\//.test(u), "must be http(s)");

export const dateSchema = z
  .object({
    precision: z.enum(DATE_PRECISIONS),
    value: z.string().optional(),
    circa: z.boolean().optional(),
    end: z.string().optional(),
    endPrecision: z.enum(DATE_PRECISIONS.filter((p) => p !== "unknown")).optional(),
    note: z.string().optional(),
  })
  .strict()
  .superRefine((d, ctx) => {
    const err = checkDateValue(d.value, d.precision);
    if (err) ctx.addIssue({ code: "custom", path: ["value"], message: err });
    if (d.end !== undefined) {
      if (d.precision === "unknown") {
        ctx.addIssue({ code: "custom", path: ["end"], message: "an unknown date cannot be a range" });
        return;
      }
      const endErr = checkDateValue(d.end, d.endPrecision ?? d.precision);
      if (endErr) ctx.addIssue({ code: "custom", path: ["end"], message: endErr });
    }
    if (d.endPrecision && d.end === undefined) {
      ctx.addIssue({ code: "custom", path: ["endPrecision"], message: "endPrecision needs an end value" });
    }
  });

export const citationSchema = z.object({ sourceId: slug, locator: z.string().optional() }).strict();

/* -------------------------------- sources ------------------------------- */
export const sourceSchema = z
  .object({
    id: slug,
    status: z.enum(STATUSES),
    type: z.enum(SOURCE_TYPES),
    title: text,
    creator: z.string().optional(), // author, photographer, interviewee …
    institution: z.string().optional(), // holding / publishing body
    publisher: z.string().optional(),
    date: dateSchema.optional(),
    url: url.optional(),
    accessed: isoDay.optional(), // date the URL was last checked
    /** Whose voice is this? e.g. "U.S. government", "participant recollection". */
    perspective: z.string().optional(),
    note: z.string().optional(),
    /** A = primary/official/peer-reviewed, B = reputable news or encyclopaedia, C = tertiary pointer (never sufficient alone). */
    tier: z.enum(["A", "B", "C"]).optional(),
    edition: z.string().optional(),
    /** Reuse terms of the source text itself, e.g. "US government work, public domain". */
    rights: z.string().optional(),
  })
  .strict();

/* --------------------------------- plates ------------------------------- */
export const rightsSchema = z
  .object({
    status: z.enum(RIGHTS_STATUSES),
    holder: z.string().optional(),
    licence: z.string().optional(), // e.g. "CC BY 4.0", "Public domain — published before 1900"
    licenceUrl: url.optional(),
    /** How you know: permission letter reference, catalogue statement, URL … */
    evidence: z.string().optional(),
    restrictions: z.string().optional(),
    /** Content & SEO rights tier (A, A-CC, B, C, X) and UK-safety flag; product use needs tier A and ukSafe true/likely. */
    tier: z.enum(["A", "A-CC", "B", "C", "X"]).optional(),
    ukSafe: z.enum(["true", "likely", "editorial-only", "verify", "false"]).optional(),
    checkedBy: z.string().optional(),
    checkedOn: isoDay.optional(),
  })
  .strict();

export const creditSchema = z
  .object({
    /** The credit line exactly as it must appear under the image. */
    line: text,
    creator: z.string().optional(),
    institution: z.string().optional(),
    accession: z.string().optional(),
    sourceUrl: url.optional(),
  })
  .strict();

export const plateSchema = z
  .object({
    id: slug,
    status: z.enum(STATUSES),
    title: text,
    caption: z.string().optional(),
    /** `null` while the image has not been supplied or cleared. */
    image: z
      .object({
        src: z.string().regex(/^\/[^\s]+\.(jpe?g|png|webp|avif)$/i, "path from /public, e.g. /archive/plates/name.jpg"),
        alt: text,
        width: z.number().int().positive().optional(),
        height: z.number().int().positive().optional(),
        /** Smaller self-hosted copies for srcset. */
        variants: z
          .array(z.object({ src: z.string().regex(/^\/[^\s]+\.(jpe?g|png|webp|avif)$/i), width: z.number().int().positive() }).strict())
          .optional(),
      })
      .strict()
      .nullable(),
    date: dateSchema,
    place: z.string().optional(),
    credit: creditSchema,
    rights: rightsSchema,
    sourceIds: z.array(slug).default([]),
    /** Anything uncertain about the attribution, date or identification. */
    uncertainty: z.string().optional(),
    /** Where the image may be used. Product use is gated separately (see rights.tier / rights.ukSafe). */
    useFor: z.array(z.enum(["editorial", "product"])).optional(),
    /** Where the caption comes from, so a reader can check it. */
    captionBasis: z.string().optional(),
    /** Why a plate is held or withheld (internal; never shown as a claim). */
    holdReason: z.string().optional(),
    placeholderNote: z.string().optional(),
  })
  .strict();

/* ------------------------------- articles ------------------------------- */
const blockSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("heading"), text }).strict(),
  z.object({ type: z.literal("paragraph"), text, cite: z.array(citationSchema).optional() }).strict(),
  z
    .object({
      type: z.literal("quote"),
      text,
      speaker: text,
      cite: citationSchema, // a quotation always names its source
    })
    .strict(),
  z.object({ type: z.literal("list"), items: z.array(text).min(1), cite: z.array(citationSchema).optional() }).strict(),
  z.object({ type: z.literal("plate"), plateId: slug, caption: z.string().optional() }).strict(),
  z
    .object({
      type: z.literal("note"),
      tone: z.enum(["context", "caveat", "perspective"]),
      text,
      cite: z.array(citationSchema).optional(),
    })
    .strict(),
]);

export const articleSchema = z
  .object({
    slug,
    status: z.enum(STATUSES),
    template: z.enum(TEMPLATES),
    title: text,
    standfirst: z.string().optional(),
    date: dateSchema,
    place: z.string().optional(),
    byline: z.string().optional(),
    reviewedBy: z.string().optional(),
    updated: isoDay.optional(),
    /** Label / value rows shown in the "At a glance" panel (dimensions, maker, holder …). */
    facts: z.array(z.object({ label: text, value: text }).strict()).default([]),
    plateIds: z.array(slug).default([]), // first = lead image
    /** Imported long-form pieces. `section` = numbered history section; `editorial` = note on method or motif. */
    kind: z.enum(["section", "editorial", "place"]).optional(),
    order: z.number().int().positive().optional(),
    period: z.string().optional(),
    seoTitle: z.string().optional(), // without the brand; " | mypahlavi" is appended
    metaDescription: z.string().optional(),
    readingMinutes: z.number().int().positive().optional(),
    related: z.array(slug).default([]), // other entry slugs
    /** Why a draft is held (internal). */
    reviewNote: z.string().optional(),
    body: z.array(blockSchema).default([]),
    /** Sources that informed the entry without being cited in a specific block. */
    furtherReading: z.array(citationSchema).default([]),
    placeholderNote: z.string().optional(),
  })
  .strict();

/* ------------------------------- timeline ------------------------------- */
export const eventSchema = z
  .object({
    id: slug,
    status: z.enum(STATUSES),
    title: text,
    summary: z.string().optional(),
    date: dateSchema,
    place: z.string().optional(),
    /** How firmly the record establishes this. */
    confidence: z.enum(["documented", "disputed", "to-verify"]),
    /** Whose account this is, when sources differ. */
    perspective: z.string().optional(),
    cite: z.array(citationSchema).default([]),
    entrySlug: slug.optional(), // read more
    /** Reader-facing explanation shown under a "Sources differ" tag. */
    note: z.string().optional(),
    plateIds: z.array(slug).default([]),
    placeholderNote: z.string().optional(),
  })
  .strict();

/* ------------------------------ collections ----------------------------- */
export const collectionSchema = z
  .object({
    slug,
    status: z.enum(STATUSES),
    title: text,
    subtitle: z.string().optional(),
    description: text,
    curatorNote: z.string().optional(),
    coverPlateId: slug.optional(),
    members: z
      .array(z.object({ kind: z.enum(["entry", "plate", "event"]), id: slug }).strict())
      .default([]),
    updated: isoDay.optional(),
    placeholderNote: z.string().optional(),
  })
  .strict();

export const KINDS = {
  sources: { dir: "sources", key: "id", schema: sourceSchema },
  plates: { dir: "plates", key: "id", schema: plateSchema },
  articles: { dir: "articles", key: "slug", schema: articleSchema },
  events: { dir: "events", key: "id", schema: eventSchema },
  collections: { dir: "collections", key: "slug", schema: collectionSchema },
};

# Archive content guide

For Content & SEO. This explains how to add sourced material to the MyPahlavi archive without touching code.

The archive is a set of plain JSON files in the repo. Each file is one record. The site reads them, checks them, and builds the index pages, collections, timeline, plates, sources and entry pages from them.

> Nothing here should state a historical fact that is not backed by a source in `content/archive/sources/`. If you cannot cite it, leave it out or mark it `draft`.

## 1. Folder layout

```
content/archive/
  sources/       one file per source (book, letter, catalogue record, interview, newspaper)
  plates/        one file per image, with credit and rights
  articles/      one file per entry page (the "entries")
  events/        one file per timeline event
  collections/   one file per curated collection
public/archive/plates/   the image files themselves
```

**The file name must equal the record's `id` (sources, plates, events) or `slug` (articles, collections).** `mughal-garden-plan.json` must contain `"slug": "mughal-garden-plan"`. Use lower-case words joined by hyphens. The ID becomes part of the URL, so choose it once and do not change it.

## 2. Status: the publishing workflow

Every record has a `status`.

| status | meaning | visible on site? |
| --- | --- | --- |
| `draft` | being written | no |
| `review` | written, waiting for a second pair of eyes | no |
| `published` | checked and ready | yes, indexed by search engines |
| `placeholder` | layout demo only | yes, clearly labelled, **noindex** |

Move a record `draft` → `review` → `published`. Drafts and reviews never appear, even in a preview, so unfinished or rights-pending material cannot leak.

If a **published** record is missing something required (a citation, a rights holder, a byline…), the record is **not shown** and `npm run content:check` fails with a message naming the file and field.

## 3. Check your work

```
npm run content:check     # validates every file, and that every image exists
npm test                  # runs the content tests too
```

`npm run build` runs `content:check` first, so a broken record stops the deploy rather than reaching the site. Fix the messages top to bottom. The first one is usually the cause of the rest.

## 4. Dates

Every date says how precise it is. Do not write `1953-01-01` when all you know is "1953".

```json
{ "precision": "day",     "value": "1953-08-19" }
{ "precision": "month",   "value": "1953-08" }
{ "precision": "year",    "value": "1953" }
{ "precision": "decade",  "value": "1950s" }
{ "precision": "century", "value": "20th" }
{ "precision": "unknown" }
```

Optional extras:

- `"circa": true` shows "c. 1953".
- A range: add `"end": "1955"` (and `"endPrecision"` if the end is less precise than the start).
- `"note": "Sources differ: …"` explains a date problem.

`unknown` shows as "Date to be confirmed" and sorts last on the timeline ("Awaiting dates").

## 5. Sources (`content/archive/sources/<id>.json`)

Add the source **first**. Everything else refers to it by `id`. A published source needs a `url`, `institution` or `publisher`, so a reader can find it.

```json
{
  "id": "example-memoir-1999",
  "status": "published",
  "type": "secondary",
  "title": "Title of the book",
  "creator": "Author name",
  "publisher": "Publisher, City",
  "date": { "precision": "year", "value": "1999" },
  "url": "https://…",
  "accessed": "2026-11-02",
  "perspective": "Whose voice is this? e.g. participant recollection"
}
```

`type` is one of: `primary`, `archive-record`, `oral-history`, `secondary`, `reference`, `periodical`.

`perspective` is **required** for `primary`, `oral-history` and `periodical` sources. It records whose account this is (an official, a participant, a newspaper with a stated position). That is how readers see when sources disagree.

## 6. Plates: images (`content/archive/plates/<id>.json`)

```json
{
  "id": "example-photo-1",
  "status": "published",
  "title": "Short descriptive title",
  "caption": "What the viewer is looking at.",
  "image": { "src": "/archive/plates/example-photo-1.jpg", "alt": "Describe what is visible, for screen readers", "width": 1600, "height": 1200 },
  "date": { "precision": "year", "value": "1953", "circa": true },
  "place": "City, Country",
  "credit": {
    "line": "Photographer / Institution, Accession no. 123. Used with permission.",
    "creator": "Photographer",
    "institution": "Holding institution",
    "accession": "123",
    "sourceUrl": "https://…"
  },
  "rights": {
    "status": "licensed",
    "holder": "Who owns the rights",
    "licence": "Written permission, 2026-10-30",
    "evidence": "Email from … saved at …",
    "checkedBy": "Your name",
    "checkedOn": "2026-10-30"
  },
  "sourceIds": ["example-archive-record"],
  "uncertainty": "Date based on … ; location not confirmed."
}
```

Put the image file in `public/archive/plates/`. Use a web-sized JPEG or WebP, with the width and height filled in.

### Rights status

| status | image shown? | what you must provide |
| --- | --- | --- |
| `public-domain` | yes | `holder` (or "None known") and `evidence`: **how you know** (for example "published 1897, author died 1920") |
| `cc` | yes | `holder`, `evidence` and `licence` (for example "CC BY 4.0"); `licenceUrl` is welcome |
| `licensed` | yes | `holder` and `evidence` (permission reference) |
| `owned` | yes | `holder` and `evidence` (assignment or ownership) |
| `pending` | **no** | permission is being sought |
| `unknown` | **no** | not researched yet |
| `withdrawn` | **no** | a rights holder objected. Keep the record, do not show the image |

A **published** plate always needs `rights.holder`, `rights.evidence`, a real date (a decade or century is fine) and at least one `sourceIds` entry, even while its image is still withheld.

When the status does not allow display, the page shows a labelled "image withheld" frame and the reason instead of the picture. Never publish an image whose rights you cannot evidence. "Found online" is not evidence.

The `credit.line` is printed under the image exactly as written, so write it as the lender or rights holder asked.

## 7. Entries (`content/archive/articles/<slug>.json`)

Pick a `template`. It changes the layout, not the rules.

| template | use for |
| --- | --- |
| `essay` | a researched piece of writing |
| `photograph` | one image and what it shows (needs a `plateIds` entry) |
| `object` | an artefact (use `facts` for maker, material, dimensions, holder) |
| `place` | a building, street, garden or site |
| `document` | a letter, memorandum, record (needs at least one `primary` source) |

```json
{
  "slug": "example-entry",
  "status": "published",
  "template": "essay",
  "title": "Entry title",
  "standfirst": "One or two sentences placing the entry in context.",
  "date": { "precision": "decade", "value": "1950s" },
  "place": "City, Country",
  "byline": "Written by …",
  "reviewedBy": "Second reader",
  "updated": "2026-11-02",
  "facts": [ { "label": "Maker", "value": "…" } ],
  "plateIds": ["example-photo-1"],
  "body": [
    { "type": "heading", "text": "Section heading" },
    { "type": "paragraph", "text": "A claim.", "cite": [ { "sourceId": "example-memoir-1999", "locator": "p. 42" } ] },
    { "type": "quote", "text": "The quotation.", "speaker": "Who said it", "cite": { "sourceId": "example-memoir-1999", "locator": "p. 57" } },
    { "type": "plate", "plateId": "example-photo-1", "caption": "Optional caption." },
    { "type": "note", "tone": "perspective", "text": "This account is from … ; the other side says …" }
  ],
  "furtherReading": [ { "sourceId": "example-memoir-1999" } ]
}
```

Body blocks: `heading`, `paragraph`, `quote`, `plate`, `note` (tone: `context`, `caveat` or `perspective`).

### Citations

- Every factual paragraph has a `cite` list of `{ "sourceId", "locator" }`. The `locator` is the page, folio, box/file, timestamp or paragraph.
- Quotes **must** name their source (`cite` is required) and a `speaker`.
- Citations are numbered automatically in order of first use and appear as footnotes with a "Sources cited" list under the entry. You do not number them yourself.
- `furtherReading` lists sources that informed the piece but are not cited at a particular point.

### Rules for published entries

A `published` entry must have: a `standfirst`, a `byline`, a `reviewedBy`, some body content and at least one citation. Every cited source and plate must exist and be published (otherwise the entry is dropped). A `document` entry must cite a `primary` or `archive-record` source, and a `photograph` entry needs a plate. Please also give every entry a real date. Where a source is a primary document, oral history or periodical, add a `perspective` note in the body saying whose account it is.

## 8. Timeline events (`content/archive/events/<id>.json`)

```json
{
  "id": "example-event",
  "status": "published",
  "title": "What happened",
  "summary": "One sentence, only as far as the sources establish it.",
  "date": { "precision": "month", "value": "1953-08" },
  "place": "City, Country",
  "confidence": "documented",
  "perspective": "Required when confidence is disputed: whose account this is",
  "cite": [ { "sourceId": "example-memoir-1999", "locator": "p. 42" } ],
  "entrySlug": "example-entry"
}
```

`confidence` is `documented` (sources agree), `disputed` (sources differ; name the perspective, and add a second event or a note for the other account) or `to-verify`. Published events need a date and at least one citation. `entrySlug` links to a fuller entry.

## 9. Collections (`content/archive/collections/<slug>.json`)

A collection groups entries, plates and events around a single thread.

```json
{
  "slug": "example-collection",
  "status": "published",
  "title": "Collection title",
  "subtitle": "The thread that connects the items",
  "description": "Two or three sentences: what this is, how it was assembled, what it leaves out.",
  "curatorNote": "Optional: selection and gaps in the record.",
  "coverPlateId": "example-photo-1",
  "members": [
    { "kind": "entry", "id": "example-entry" },
    { "kind": "plate", "id": "example-photo-1" },
    { "kind": "event", "id": "example-event" }
  ]
}
```

A member that does not exist is an error. A member that exists but is not visible (a draft) is skipped on the page. A collection that ends up empty shows an "empty" message, not an error.

## 10. Adding your first real content and removing the placeholders

1. Add real **sources**, then **plates**, **entries**, **events**, and then the **collection**, in that order.
2. Run `npm run content:check` and fix every message.
3. Delete the placeholder files, which are every file whose name starts with `placeholder-`. When the last placeholder is gone, the "this is a placeholder" banner disappears by itself.
4. Add the new pages to `public/sitemap.xml` (see below).

Tests only police placeholders: they must show no date or image and carry a `placeholderNote`. Real published content never trips them. If a test fails, read the message. It names the file.

## 11. Sitemap and SEO

- Published entries, collections and plates get a canonical URL and page title automatically. Placeholders get `noindex`.
- **`public/sitemap.xml` is static.** It is not generated, so when you publish something, add its URL by hand. For example `https://www.mypahlavi.com/archive/entries/example-entry`. Do not list placeholders or drafts.
- Write `standfirst` and `description` as you would a search snippet: one or two plain sentences, no fluff.
- Alt text (`image.alt`) describes what is visible, not the keywords.

## 12. Previews: what you will see

Every pull request gets a Vercel Preview URL. A preview shows `published` and `placeholder` records only. Previews are isolated from production: a code guard (`src/lib/preview-guard.mjs`) removes production database and payment-provider secrets when `VERCEL_ENV=preview`, and keeps Stripe **test** keys only. Test purchases on a preview use Stripe's test cards and never charge money. A separate preview database can be supplied with `PREVIEW_DATABASE_URL` (set in Vercel for the Preview environment). Without it, shop and account features on a preview are simply unavailable. You never need to set any of this to edit content.

## 13. Quick checklist before setting `published`

- [ ] Every claim has a citation with a locator.
- [ ] Every source has a creator or institution, and a `perspective` where required.
- [ ] Every image has a credit line, a rights status with evidence, alt text and the file in `public/archive/plates/`.
- [ ] Dates use the right precision. Doubts are in a `note` or `uncertainty`.
- [ ] Where accounts differ, the entry says whose account is whose.
- [ ] A second person has read it (`reviewedBy`).
- [ ] `npm run content:check` is clean.
- [ ] The URL is added to `public/sitemap.xml`.

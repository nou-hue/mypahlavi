import { isVisible } from "./validate.mjs";
import { sortKey, decadeOf } from "./dates.mjs";

/**
 * Read-side helpers over a validated dataset. Pure functions: no I/O, so
 * they can be unit-tested and reused by the build check.
 */
export function createArchive(data) {
  const vis = (list) => list.filter(isVisible);
  const sources = vis(data.sources);
  const plates = vis(data.plates);
  const articles = vis(data.articles);
  const events = vis(data.events);
  const collections = vis(data.collections);

  const byId = (list, key) => new Map(list.map((r) => [r[key], r]));
  const sourceMap = byId(sources, "id");
  const plateMap = byId(plates, "id");
  const articleMap = byId(articles, "slug");
  const eventMap = byId(events, "id");
  const collectionMap = byId(collections, "slug");

  // Newest/most-specific first is not meaningful for an archive; sort by date, undated last.
  const byDate = (a, b) => {
    const ka = sortKey(a.date);
    const kb = sortKey(b.date);
    if (ka == null && kb == null) return a.title.localeCompare(b.title);
    if (ka == null) return 1;
    if (kb == null) return -1;
    return ka - kb || a.title.localeCompare(b.title);
  };

  const sortedEvents = [...events].sort(byDate);

  /** Dated events grouped by decade, plus the undated ones. */
  function timeline() {
    const groups = new Map();
    const undated = [];
    for (const e of sortedEvents) {
      const d = decadeOf(e.date);
      if (d == null) undated.push(e);
      else groups.set(d, [...(groups.get(d) ?? []), e]);
    }
    return {
      decades: [...groups.entries()].sort((a, b) => a[0] - b[0]).map(([decade, items]) => ({ decade, items })),
      undated,
    };
  }

  /** Collections that list a given member. */
  function collectionsContaining(kind, id) {
    return collections.filter((c) => c.members.some((m) => m.kind === kind && m.id === id));
  }

  /** Resolve a collection's members to records, skipping any that are not visible. */
  function membersOf(collection) {
    const out = { entries: [], plates: [], events: [] };
    for (const m of collection.members) {
      if (m.kind === "entry" && articleMap.has(m.id)) out.entries.push(articleMap.get(m.id));
      if (m.kind === "plate" && plateMap.has(m.id)) out.plates.push(plateMap.get(m.id));
      if (m.kind === "event" && eventMap.has(m.id)) out.events.push(eventMap.get(m.id));
    }
    return out;
  }

  /**
   * Number the citations in an article in order of first appearance.
   * Returns `{ numbered, notes }`: `numbered[i]` is the list of note numbers
   * for body block i; `notes` is the ordered footnote list.
   */
  function citationsFor(article) {
    const notes = [];
    const indexOf = new Map();
    const numberFor = (c) => {
      const k = `${c.sourceId}|${c.locator ?? ""}`;
      if (!indexOf.has(k)) {
        indexOf.set(k, notes.length + 1);
        notes.push({ n: notes.length + 1, source: sourceMap.get(c.sourceId), locator: c.locator, sourceId: c.sourceId });
      }
      return indexOf.get(k);
    };
    const numbered = article.body.map((b) => {
      const cs = b.type === "quote" ? [b.cite] : (b.cite ?? []);
      return cs.filter((c) => sourceMap.has(c.sourceId)).map(numberFor);
    });
    const reading = article.furtherReading
      .filter((c) => sourceMap.has(c.sourceId))
      .map((c) => ({ source: sourceMap.get(c.sourceId), locator: c.locator }));
    return { numbered, notes, reading };
  }

  /** Everything that cites a given source, for the Sources index. */
  function usesOfSource(id) {
    const cites = (list) => list.some((c) => c?.sourceId === id);
    return {
      entries: articles.filter(
        (a) =>
          cites(a.furtherReading) ||
          a.body.some((b) => cites(b.type === "quote" ? [b.cite] : (b.cite ?? []))),
      ),
      plates: plates.filter((p) => p.sourceIds.includes(id)),
      events: events.filter((e) => cites(e.cite)),
    };
  }

  const entriesByTemplate = (template) =>
    articles.filter((a) => !template || a.template === template).sort(byDate);

  return {
    sources: [...sources].sort((a, b) => a.title.localeCompare(b.title)),
    plates: [...plates].sort(byDate),
    articles: [...articles].sort(byDate),
    events: sortedEvents,
    collections: [...collections].sort((a, b) => a.title.localeCompare(b.title)),
    source: (id) => sourceMap.get(id),
    plate: (id) => plateMap.get(id),
    article: (slug) => articleMap.get(slug),
    event: (id) => eventMap.get(id),
    collection: (slug) => collectionMap.get(slug),
    timeline,
    collectionsContaining,
    membersOf,
    citationsFor,
    usesOfSource,
    entriesByTemplate,
    counts: {
      entries: articles.length,
      plates: plates.length,
      events: events.length,
      collections: collections.length,
      sources: sources.length,
    },
    /** True while everything visible is a placeholder — drives the "being catalogued" framing. */
    onlyPlaceholders: [...articles, ...plates, ...events, ...collections].every((r) => r.status === "placeholder"),
  };
}

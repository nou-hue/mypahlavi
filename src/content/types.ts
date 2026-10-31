import type { z } from "zod";
import type {
  articleSchema,
  collectionSchema,
  eventSchema,
  plateSchema,
  sourceSchema,
  citationSchema,
} from "./schema.mjs";

export type ArchiveEntry = z.infer<typeof articleSchema>;
export type ArchivePlate = z.infer<typeof plateSchema>;
export type ArchiveEvent = z.infer<typeof eventSchema>;
export type ArchiveCollection = z.infer<typeof collectionSchema>;
export type ArchiveSource = z.infer<typeof sourceSchema>;
export type Citation = z.infer<typeof citationSchema>;

export interface Archive {
  sources: ArchiveSource[];
  plates: ArchivePlate[];
  articles: ArchiveEntry[];
  events: ArchiveEvent[];
  collections: ArchiveCollection[];
  source(id: string): ArchiveSource | undefined;
  plate(id: string): ArchivePlate | undefined;
  article(slug: string): ArchiveEntry | undefined;
  event(id: string): ArchiveEvent | undefined;
  collection(slug: string): ArchiveCollection | undefined;
  timeline(): {
    decades: { decade: number; items: ArchiveEvent[] }[];
    undated: ArchiveEvent[];
  };
  collectionsContaining(kind: "entry" | "plate" | "event", id: string): ArchiveCollection[];
  membersOf(collection: ArchiveCollection): {
    entries: ArchiveEntry[];
    plates: ArchivePlate[];
    events: ArchiveEvent[];
  };
  citationsFor(article: ArchiveEntry): {
    numbered: number[][];
    inline: Map<string, number>;
    notes: { n: number; source: ArchiveSource | undefined; locator?: string; sourceId: string }[];
    reading: { source: ArchiveSource | undefined; locator?: string }[];
  };
  usesOfSource(id: string): { entries: ArchiveEntry[]; plates: ArchivePlate[]; events: ArchiveEvent[] };
  entriesByTemplate(template?: string): ArchiveEntry[];
  counts: { entries: number; plates: number; events: number; collections: number; sources: number };
  onlyPlaceholders: boolean;
  hasReview: boolean;
}

import { buildDataset } from "./validate.mjs";
import { createArchive } from "./queries.mjs";
import type { Archive } from "./types";

/**
 * Loads every JSON record under /content/archive at build time.
 * Records are validated; anything invalid is left out (fail closed) and
 * reported to the server log. `npm run content:check` makes the same
 * checks fatal, and runs as part of `npm run build`.
 */
const files = import.meta.glob("/content/archive/**/*.json", {
  eager: true,
  import: "default",
}) as Record<string, unknown>;

const { data, errors } = buildDataset(files);

if (errors.length > 0 && typeof console !== "undefined") {
  console.error(
    `[archive] ${errors.length} content problem(s):\n` +
      errors.map((e) => `  ${e.path}: ${e.message}`).join("\n"),
  );
}

export const archive = createArchive(data) as Archive;
export const archiveErrors = errors;

export type {
  Archive,
  ArchiveCollection,
  ArchiveEntry,
  ArchiveEvent,
  ArchivePlate,
  ArchiveSource,
} from "./types";

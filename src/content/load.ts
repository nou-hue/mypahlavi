import { buildDataset } from "./validate.mjs";
import { createArchive } from "./queries.mjs";

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

export const archive = createArchive(data);
export const archiveErrors = errors;

export type Archive = typeof archive;
export type ArchiveEntry = NonNullable<ReturnType<Archive["article"]>>;
export type ArchivePlate = NonNullable<ReturnType<Archive["plate"]>>;
export type ArchiveEvent = NonNullable<ReturnType<Archive["event"]>>;
export type ArchiveCollection = NonNullable<ReturnType<Archive["collection"]>>;
export type ArchiveSource = NonNullable<ReturnType<Archive["source"]>>;

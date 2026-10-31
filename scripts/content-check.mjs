#!/usr/bin/env node
// Validates every record in content/archive. Exits non-zero on any problem
// so a bad record fails the build instead of silently disappearing.
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { buildDataset } from "../src/content/validate.mjs";
import { createArchive } from "../src/content/queries.mjs";

const root = resolve(import.meta.dirname, "..");
const contentDir = join(root, "content/archive");

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : p.endsWith(".json") ? [p] : [];
  });
}

export function checkContent() {
  const files = {};
  const errors = [];
  for (const p of existsSync(contentDir) ? walk(contentDir) : []) {
    const rel = relative(root, p);
    try {
      files[rel] = JSON.parse(readFileSync(p, "utf8"));
    } catch (e) {
      errors.push({ path: rel, message: `invalid JSON: ${e.message}` });
    }
  }
  const result = buildDataset(files);
  errors.push(...result.errors);

  // Image files must exist under /public.
  for (const plate of result.data.plates) {
    if (plate.image && !existsSync(join(root, "public", plate.image.src))) {
      errors.push({ path: `plates/${plate.id}.json`, message: `image file not found: public${plate.image.src}` });
    }
  }
  return { errors, data: result.data, count: Object.keys(files).length };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { errors, data, count } = checkContent();
  const a = createArchive(data);
  if (errors.length) {
    console.error(`\n✖ content check failed — ${errors.length} problem(s):\n`);
    for (const e of errors) console.error(`  ${e.path}\n    ${e.message}`);
    console.error("\nSee docs/content-guide.md for the rules.\n");
    process.exit(1);
  }
  console.log(
    `✔ content ok — ${count} files · ${a.counts.entries} entries, ${a.counts.plates} plates, ` +
      `${a.counts.events} events, ${a.counts.collections} collections, ${a.counts.sources} sources`,
  );
}

#!/usr/bin/env node
// Validates every record in content/archive. Exits non-zero on any problem
// so a bad record fails the build instead of silently disappearing.
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { buildDataset } from "../src/content/validate.mjs";
import { createArchive } from "../src/content/queries.mjs";
import { gateFiles, isProductionBuild } from "./archive-content-gate.mjs";

const root = resolve(import.meta.dirname, "..");
const contentDir = join(root, "content/archive");

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : p.endsWith(".json") ? [p] : [];
  });
}

export function checkContent({ production = isProductionBuild() } = {}) {
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
  // Everything is validated, drafts included, so a held record cannot rot unnoticed.
  const all = buildDataset(files);
  errors.push(...all.errors);
  // On a production build also validate exactly what will ship: published and placeholder
  // records only. A published record leaning on one still in review fails here.
  let result = all;
  if (production) {
    const shipped = buildDataset(gateFiles(files, true));
    const seen = new Set(errors.map((e) => `${e.path}|${e.message}`));
    for (const e of shipped.errors) if (!seen.has(`${e.path}|${e.message}`)) errors.push(e);
    result = shipped;
  }

  // Image files must exist under /public.
  for (const plate of result.data.plates) {
    if (plate.image && !existsSync(join(root, "public", plate.image.src))) {
      errors.push({ path: `plates/${plate.id}.json`, message: `image file not found: public${plate.image.src}` });
    }
  }
  // Self-hosted images: every file a plate points at must exist, and none may hotlink Commons.
  for (const plate of all.data.plates) {
    for (const f of [plate.image, ...(plate.image?.variants ?? [])].filter(Boolean)) {
      if (/^https?:/.test(f.src)) errors.push({ path: `plates/${plate.id}.json`, message: `image must be self-hosted, not hotlinked: ${f.src}` });
    }
  }
  const by = (st) => Object.values(all.data).flat().filter((r) => r.status === st).length;
  return { errors, data: result.data, count: Object.keys(files).length, production, held: by("draft"), review: by("review") };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { errors, data, count, production, held, review } = checkContent();
  const a = createArchive(data);
  if (errors.length) {
    console.error(`\n✖ content check failed — ${errors.length} problem(s):\n`);
    for (const e of errors) console.error(`  ${e.path}\n    ${e.message}`);
    console.error("\nSee docs/content-guide.md for the rules.\n");
    process.exit(1);
  }
  console.log(
    `✔ content ok — ${count} files · ${a.counts.entries} entries, ${a.counts.plates} plates, ` +
      `${a.counts.events} events, ${a.counts.collections} collections, ${a.counts.sources} sources` +
      ` · ${production ? "PRODUCTION: review/draft records stripped" : `${review} in review (preview only)`} · ${held} held as draft`,
  );
}

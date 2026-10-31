#!/usr/bin/env node
// Post-build guard. Fails when the built site contains something that must never ship:
//   - an unverified marker ([VERIFY / [CONFIRM / [UPGRADE) in archive content;
//   - a hotlinked Wikimedia image host;
//   - the id of an image that is held, or marked do-not-use.
// Scans .output/ and .vercel/output/ (whichever the build produced) and dist/.
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { UNVERIFIED_MARKER } from "../src/content/schema.mjs";

const root = resolve(import.meta.dirname, "..");
const dirs = [".output", ".vercel/output", "dist"].map((d) => join(root, d)).filter(existsSync);
const TEXT = /\.(js|mjs|cjs|html|json|css|xml|txt|map)$/;
const HOTLINK = /(?:upload|thumb)\.wikimedia\.org/;

// Held plates: any plate record still marked draft, by id.
const plateDir = join(root, "content/archive/plates");
const held = existsSync(plateDir)
  ? readdirSync(plateDir).map((f) => JSON.parse(readFileSync(join(plateDir, f), "utf8"))).filter((p) => p.status === "draft").map((p) => p.id)
  : [];

function* walk(d) {
  for (const n of readdirSync(d)) {
    const p = join(d, n);
    const s = statSync(p);
    if (s.isDirectory()) yield* walk(p);
    else if (TEXT.test(n) && s.size < 20_000_000) yield p;
  }
}

if (dirs.length === 0) {
  console.log("scan-build-output: no build output found, nothing to scan");
  process.exit(0);
}
const problems = [];
let files = 0;
for (const d of dirs) {
  for (const f of walk(d)) {
    files++;
    const t = readFileSync(f, "utf8");
    const rel = f.slice(root.length + 1);
    const m = UNVERIFIED_MARKER.exec(t);
    if (m) problems.push(`${rel}: unverified marker "${t.slice(m.index, m.index + 40)}…"`);
    if (HOTLINK.test(t)) problems.push(`${rel}: hotlinked Wikimedia image host`);
    // The record itself (its id as a property value) or its image file. The bundler's glob map still
    // lists the file path of a gated record, mapped to null; that is not content and is ignored.
    for (const id of held) {
      if (t.includes(`id:"${id}"`) || t.includes(`"id":"${id}"`) || new RegExp(`/archive/plates/${id}[-.](?!json)`).test(t) || new RegExp(`/archive/plates/${id}\\.(?:jpe?g|png|webp)`).test(t))
        problems.push(`${rel}: held image "${id}"`);
    }
  }
}
if (problems.length) {
  console.error(`\n✖ build scan failed (${problems.length}):\n` + [...new Set(problems)].slice(0, 40).map((p) => "  " + p).join("\n"));
  process.exit(1);
}
console.log(`✔ build scan clean — ${files} files in ${dirs.map((d) => d.slice(root.length + 1)).join(", ")}`);

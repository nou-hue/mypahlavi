#!/usr/bin/env node
// Writes public/sitemap.xml and the Sitemap line of public/robots.txt from SITE_URL,
// the static pages below, and every PUBLISHED archive record (with its real lastmod).
// Review and draft records are never listed. Runs as part of `npm run build`.
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { SITE_URL } from "../src/lib/site-config.mjs";

const root = resolve(import.meta.dirname, "..");
const STATIC = [
  ["/", "weekly", "1.0"], ["/gallery", "weekly", "0.9"], ["/lineage", "monthly", "0.8"], ["/library", "weekly", "0.8"],
  ["/editions", "weekly", "0.7"], ["/vault", "monthly", "0.6"], ["/about", "monthly", "0.5"], ["/patronage", "monthly", "0.4"],
];
const read = (dir) => {
  const d = join(root, "content/archive", dir);
  return existsSync(d) ? readdirSync(d).filter((f) => f.endsWith(".json")).map((f) => JSON.parse(readFileSync(join(d, f), "utf8"))) : [];
};
const pub = (l) => l.filter((r) => r.status === "published");
const [articles, plates, sources, events, collections] = ["articles", "plates", "sources", "events", "collections"].map((d) => pub(read(d)));
// A hub page is listed only when it has something published to show.
const archive = [
  ...(articles.length ? [["/archive", null], ["/archive/entries", null]] : []),
  ...(collections.length ? [["/archive/collections", null]] : []),
  ...(events.length ? [["/archive/timeline", null]] : []),
  ...(plates.length ? [["/archive/plates", null]] : []),
  ...(sources.length ? [["/archive/sources", null]] : []),
  ...articles.map((a) => [`/archive/entries/${a.slug}`, a.updated ?? a.reviewedOn]),
  ...collections.map((c) => [`/archive/collections/${c.slug}`, c.updated]),
  ...plates.map((p) => [`/archive/plates/${p.id}`, p.reviewedOn ?? p.credit?.checkedOn ?? p.rights?.checkedOn]),
];
// Only list the archive hub pages once something is published there.
const anyPublished = archive.length > 0;
const entries = [
  ...STATIC.map(([p, f, pr]) => ({ p, f, pr })),
  ...(anyPublished ? archive.map(([p, lastmod]) => ({ p, f: "monthly", pr: "0.6", lastmod })) : []),
];
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
  .map(
    (e) => `  <url>
    <loc>${SITE_URL}${e.p === "/" ? "/" : e.p}</loc>${e.lastmod ? `\n    <lastmod>${e.lastmod}</lastmod>` : ""}
    <changefreq>${e.f}</changefreq>
    <priority>${e.pr}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>
`;
writeFileSync(join(root, "public/sitemap.xml"), xml);
const robots = join(root, "public/robots.txt");
let r = readFileSync(robots, "utf8");
r = r.replace(/^# https?:\/\/\S+\/robots\.txt/m, `# ${SITE_URL}/robots.txt`).replace(/^Sitemap: .*$/m, `Sitemap: ${SITE_URL}/sitemap.xml`);
writeFileSync(robots, r);
console.log(`sitemap: ${entries.length} URLs (${anyPublished ? "archive pages included" : "no published archive records yet"}) on ${SITE_URL}`);

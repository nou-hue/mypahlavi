/**
 * Production gate for archive content.
 *
 *  - `draft` records are never bundled, in any environment (they may carry
 *    unverified markers or withheld rights).
 *  - `review` records are bundled for previews and local builds only. On a
 *    production build (VERCEL_ENV=production) they are stripped, so nothing
 *    awaiting sign-off can reach the live site.
 *
 * The loader (src/content/load.ts) tolerates the `null` this leaves behind.
 */
export const isProductionBuild = (env = process.env) => env.VERCEL_ENV === "production";

/** Returns the record, or `null` when it must not ship in this environment. */
export function gateRecord(record, production = isProductionBuild()) {
  if (!record || typeof record !== "object") return record;
  if (record.status === "draft") return null;
  if (production && record.status === "review") return null;
  return record;
}

/** Applies the gate to a `{ path: json }` map. */
export function gateFiles(files, production = isProductionBuild()) {
  return Object.fromEntries(Object.entries(files).map(([p, j]) => [p, gateRecord(j, production)]));
}

/** Vite plugin: replaces gated JSON records with `null` at transform time. */
export function archiveContentGate() {
  return {
    name: "mypahlavi:archive-content-gate",
    enforce: "pre",
    transform(code, id) {
      if (!/\/content\/archive\/.+\.json$/.test(id.split("?")[0])) return null;
      let json;
      try {
        json = JSON.parse(code);
      } catch {
        return null; // let Vite report the syntax error
      }
      return gateRecord(json) === null ? { code: "null", map: null } : null;
    },
  };
}

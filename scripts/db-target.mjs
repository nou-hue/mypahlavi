/**
 * Which database the shop talks to, and whether the build may migrate it.
 *
 * The shop is being moved off the Neon project it currently shares with CRD
 * (clinical data). Until that cut-over, nothing here changes production:
 *
 *   1. `SHOP_DATABASE_URL` (and `SHOP_DATABASE_URL_UNPOOLED` for DDL) is the
 *      dedicated shop database. When it is set it always wins.
 *   2. When it is NOT set, production falls back to the existing generic names
 *      (`DATABASE_URL`, `POSTGRES_URL`, ...) exactly as before.
 *   3. Non-production Vercel builds (preview/development) never migrate and
 *      never use the generic names: those are injected by the Neon integration
 *      and point at a copy of the shared production database. A preview only
 *      gets a real database through an explicit `SHOP_DATABASE_URL`, and only
 *      migrates it with `SHOP_ALLOW_PREVIEW_MIGRATIONS=true`.
 *
 * Pure functions over an env object so they can be unit-tested.
 */

export const SHOP_RUNTIME_KEYS = ["SHOP_DATABASE_URL"];
export const SHOP_MIGRATION_KEYS = ["SHOP_DATABASE_URL_UNPOOLED", "SHOP_DATABASE_URL"];

/** Legacy names, in the order the migrator used before (non-pooling first). */
export const LEGACY_MIGRATION_KEYS = [
  "DATABASE_URL_UNPOOLED",
  "POSTGRES_URL_NON_POOLING",
  "DATABASE_URL",
  "POSTGRES_URL",
  "POSTGRES_PRISMA_URL",
  "NEON_DATABASE_URL",
];

function read(env, key) {
  const v = env?.[key];
  if (typeof v !== "string") return undefined;
  const t = v.trim();
  return t ? t : undefined;
}

/**
 * The Vercel environment of this build/runtime, or undefined when not on
 * Vercel (local dev, CI). Returns "unknown" on Vercel when neither system var
 * is exposed, which callers treat as non-production (fail closed).
 */
export function vercelEnvOf(env) {
  const target = read(env, "VERCEL_TARGET_ENV") ?? read(env, "VERCEL_ENV");
  if (target) return target;
  if (read(env, "VERCEL") === "1") return "unknown";
  return undefined;
}

export function isNonProductionVercel(env) {
  const v = vercelEnvOf(env);
  return v !== undefined && v !== "production";
}

/**
 * Decide the migration target for `npm run db:migrate`.
 * @returns {{ skip: true, reason: string } | { skip: false, key: string, url: string }}
 */
export function resolveMigrationTarget(env) {
  const nonProd = isNonProductionVercel(env);
  const vercelEnv = vercelEnvOf(env);

  for (const key of SHOP_MIGRATION_KEYS) {
    const url = read(env, key);
    if (!url) continue;
    if (nonProd && read(env, "SHOP_ALLOW_PREVIEW_MIGRATIONS") !== "true") {
      return {
        skip: true,
        reason:
          `VERCEL_ENV=${vercelEnv}: migrations are skipped on non-production builds. ` +
          "To migrate a preview-only shop database, set SHOP_DATABASE_URL for Preview " +
          "and SHOP_ALLOW_PREVIEW_MIGRATIONS=true.",
      };
    }
    return { skip: false, key, url };
  }

  if (nonProd) {
    return {
      skip: true,
      reason:
        `VERCEL_ENV=${vercelEnv}: migrations never run on non-production builds ` +
        "against the integration-injected database (it is a copy of shared production data).",
    };
  }

  for (const key of LEGACY_MIGRATION_KEYS) {
    const url = read(env, key);
    if (url) return { skip: false, key, url };
  }
  return {
    skip: true,
    reason: "DATABASE_URL not set — skipping (PGLite fallback migrates at runtime).",
  };
}

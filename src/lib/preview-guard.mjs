/**
 * Preview isolation.
 *
 * On this Vercel project the production database, Stripe and Printify
 * variables are scoped to Preview as well as Production. A preview build or
 * request must never touch them, so on `VERCEL_ENV=preview` we remove the
 * production-only credentials from `process.env` before anything reads them.
 *
 *  - Database / Neon / auth credentials are always removed. To give previews a
 *    database of their own, set `PREVIEW_DATABASE_URL` (scoped to Preview only);
 *    it is promoted to `DATABASE_URL`.
 *  - Stripe keys are kept only when the secret key is a TEST key (`sk_test_…`);
 *    a live key and its webhook secret are removed.
 *  - Printify has no test mode, so its credentials are always removed.
 *
 * Production, local development and CI are untouched (VERCEL_ENV !== "preview").
 */
const DB_AUTH_KEYS = /^(POSTGRES_|PG[A-Z0-9_]*$|DATABASE_URL|NEON_|VITE_NEON_|SHOP_ADMIN_SECRET$)/;
const STRIPE_KEYS = /^(STRIPE_|VITE_STRIPE_)/;
const PRINTIFY_KEYS = /^PRINTIFY_/;

export function scrubProductionSecrets(env = process.env) {
  if (env.VERCEL_ENV !== "preview") return { scrubbed: [], active: false };
  const scrubbed = [];
  const drop = (k) => {
    delete env[k];
    scrubbed.push(k);
  };
  const previewDb = env.PREVIEW_DATABASE_URL?.trim();
  for (const k of Object.keys(env)) {
    if (DB_AUTH_KEYS.test(k) || PRINTIFY_KEYS.test(k)) drop(k);
  }
  if (previewDb) env.DATABASE_URL = previewDb;

  // Stripe: keep only a complete test-mode set (sk_test_ secret, pk_test_ publishable).
  const stripeIsTest = /^sk_test_/.test(env.STRIPE_SECRET_KEY?.trim() ?? "");
  for (const k of Object.keys(env)) {
    if (!STRIPE_KEYS.test(k)) continue;
    const isPublishable = /PUBLISHABLE/.test(k);
    const keep = stripeIsTest && (isPublishable ? /^pk_test_/.test(env[k] ?? "") : true);
    if (!keep) drop(k);
  }
  return { scrubbed, active: true };
}

// Side effect on import, so `import "@/lib/preview-guard"` is all a module needs.
scrubProductionSecrets();

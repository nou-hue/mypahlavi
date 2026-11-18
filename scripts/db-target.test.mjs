import test from "node:test";
import assert from "node:assert/strict";
import {
  resolveMigrationTarget,
  vercelEnvOf,
  isNonProductionVercel,
} from "./db-target.mjs";

const PROD = "postgresql://u:p@ep-prod.example.neon.tech/db";
const PROD_DIRECT = "postgresql://u:p@ep-prod-direct.example.neon.tech/db";
const SHOP = "postgresql://u:p@ep-shop.example.neon.tech/shop";
const SHOP_DIRECT = "postgresql://u:p@ep-shop-direct.example.neon.tech/shop";

test("production without SHOP_DATABASE_URL behaves exactly as before", () => {
  const r = resolveMigrationTarget({
    VERCEL: "1",
    VERCEL_ENV: "production",
    DATABASE_URL: PROD,
    DATABASE_URL_UNPOOLED: PROD_DIRECT,
  });
  assert.deepEqual(r, { skip: false, key: "DATABASE_URL_UNPOOLED", url: PROD_DIRECT });
});

test("local (not on Vercel) keeps the legacy fallback", () => {
  const r = resolveMigrationTarget({ DATABASE_URL: PROD });
  assert.deepEqual(r, { skip: false, key: "DATABASE_URL", url: PROD });
});

test("SHOP_DATABASE_URL wins over the shared database in production", () => {
  const r = resolveMigrationTarget({
    VERCEL_ENV: "production",
    DATABASE_URL: PROD,
    SHOP_DATABASE_URL: SHOP,
  });
  assert.deepEqual(r, { skip: false, key: "SHOP_DATABASE_URL", url: SHOP });
});

test("SHOP_DATABASE_URL_UNPOOLED is preferred for DDL", () => {
  const r = resolveMigrationTarget({
    VERCEL_ENV: "production",
    SHOP_DATABASE_URL: SHOP,
    SHOP_DATABASE_URL_UNPOOLED: SHOP_DIRECT,
  });
  assert.equal(r.skip, false);
  assert.equal(r.url, SHOP_DIRECT);
});

for (const VERCEL_ENV of ["preview", "development"]) {
  test(`${VERCEL_ENV} build never migrates the integration database`, () => {
    const r = resolveMigrationTarget({
      VERCEL: "1",
      VERCEL_ENV,
      DATABASE_URL: PROD,
      POSTGRES_URL_NON_POOLING: PROD_DIRECT,
    });
    assert.equal(r.skip, true);
    assert.match(r.reason, /non-production/);
  });

  test(`${VERCEL_ENV} build skips even with SHOP_DATABASE_URL unless opted in`, () => {
    const r = resolveMigrationTarget({ VERCEL_ENV, SHOP_DATABASE_URL: SHOP });
    assert.equal(r.skip, true);
  });
}

test("preview may migrate a dedicated shop DB only with explicit opt-in", () => {
  const r = resolveMigrationTarget({
    VERCEL_ENV: "preview",
    DATABASE_URL: PROD,
    SHOP_DATABASE_URL: SHOP,
    SHOP_ALLOW_PREVIEW_MIGRATIONS: "true",
  });
  assert.deepEqual(r, { skip: false, key: "SHOP_DATABASE_URL", url: SHOP });
});

test("on Vercel with no environment exposed, fail closed (skip)", () => {
  assert.equal(vercelEnvOf({ VERCEL: "1" }), "unknown");
  assert.equal(isNonProductionVercel({ VERCEL: "1" }), true);
  const r = resolveMigrationTarget({ VERCEL: "1", DATABASE_URL: PROD });
  assert.equal(r.skip, true);
});

test("VERCEL_TARGET_ENV takes precedence over VERCEL_ENV", () => {
  assert.equal(vercelEnvOf({ VERCEL_TARGET_ENV: "preview", VERCEL_ENV: "production" }), "preview");
});

test("blank values are treated as unset", () => {
  const r = resolveMigrationTarget({ VERCEL_ENV: "production", SHOP_DATABASE_URL: "  ", DATABASE_URL: PROD });
  assert.equal(r.key, "DATABASE_URL");
});

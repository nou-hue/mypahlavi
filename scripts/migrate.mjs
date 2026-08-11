#!/usr/bin/env node
/**
 * Deploy-time database migrator (node-postgres, `pg`).
 *
 * Runs during `npm run build` on Vercel. Applies pending files in ../migrations.
 * Prefers Neon direct (non-pooling) URL for DDL.
 *
 * Connection failures are non-fatal so a bad/missing DB does not brick the
 * frontend deploy — SQL errors after a successful connect still fail the build.
 */
import { readdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import pg from "pg";

function resolveDatabaseUrl() {
  // Prefer non-pooling for migrations (Neon pooler can break multi-statement DDL)
  for (const key of [
    "DATABASE_URL_UNPOOLED",
    "POSTGRES_URL_NON_POOLING",
    "DATABASE_URL",
    "POSTGRES_URL",
    "POSTGRES_PRISMA_URL",
    "NEON_DATABASE_URL",
  ]) {
    const v = process.env[key]?.trim();
    if (v) return { key, url: v };
  }
  return undefined;
}

const resolved = resolveDatabaseUrl();
if (!resolved) {
  console.log(
    "[migrate] DATABASE_URL not set — skipping (PGLite fallback migrates at runtime).",
  );
  process.exit(0);
}

const { key: urlKey, url: databaseUrl } = resolved;
const migrationsDir = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "migrations",
);

function isConnectionError(err) {
  const code = err?.code || "";
  const msg = String(err?.message || err || "");
  return (
    [
      "ECONNREFUSED",
      "ENOTFOUND",
      "ETIMEDOUT",
      "ECONNRESET",
      "EAI_AGAIN",
      "57P01",
      "28P01", // invalid password
      "28000",
      "3D000", // database does not exist
    ].includes(code) ||
    /password authentication failed/i.test(msg) ||
    /getaddrinfo/i.test(msg) ||
    /timeout/i.test(msg) ||
    /SSL/i.test(msg) ||
    /certificate/i.test(msg) ||
    /does not exist/i.test(msg) ||
    /Tenant or user not found/i.test(msg) ||
    /Can't reach database/i.test(msg)
  );
}

async function main() {
  const isNeon =
    /neon\.tech/i.test(databaseUrl) ||
    /@ep-/.test(databaseUrl) ||
    /neon/i.test(urlKey);

  console.log(`[migrate] using ${urlKey} (neon=${isNeon})`);

  const pool = new pg.Pool({
    connectionString: databaseUrl,
    max: 1,
    connectionTimeoutMillis: 15_000,
    // Neon + most cloud Postgres require TLS
    ssl:
      isNeon || /sslmode=require/i.test(databaseUrl) || /vercel/i.test(databaseUrl)
        ? { rejectUnauthorized: false }
        : undefined,
  });

  let client;
  try {
    client = await pool.connect();
  } catch (err) {
    console.error("[migrate] could not connect — skipping so deploy can proceed");
    console.error("[migrate] ", err?.message || err);
    console.error(
      "[migrate] Fix DATABASE_URL on Vercel (use Neon “connection string” with ?sslmode=require).",
    );
    console.error(
      "[migrate] Prefer the direct host (…-pooler… removed) or POSTGRES_URL_NON_POOLING for migrations.",
    );
    await pool.end().catch(() => {});
    // Non-fatal: site ships; DB features stay in memory until URL is fixed
    process.exit(0);
  }

  try {
    await client.query(
      "CREATE TABLE IF NOT EXISTS _migrations (name TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT now())",
    );
    const applied = new Set(
      (await client.query("SELECT name FROM _migrations")).rows.map(
        (r) => r.name,
      ),
    );

    let files;
    try {
      files = (await readdir(migrationsDir))
        .filter((f) => f.endsWith(".sql"))
        .sort();
    } catch {
      console.log("[migrate] no migrations/ directory — nothing to do.");
      return;
    }

    let count = 0;
    for (const name of files) {
      if (applied.has(name)) continue;
      const text = await readFile(join(migrationsDir, name), "utf8");
      try {
        await client.query("BEGIN");
        await client.query(text);
        await client.query("INSERT INTO _migrations (name) VALUES ($1)", [name]);
        await client.query("COMMIT");
      } catch (err) {
        console.error(`[migrate] error applying ${name}`);
        try {
          await client.query("ROLLBACK");
        } catch {
          /* keep original */
        }
        throw err;
      }
      console.log(`[migrate] applied ${name}`);
      count += 1;
    }
    console.log(
      count
        ? `[migrate] done — ${count} migration(s) applied.`
        : "[migrate] up to date.",
    );
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error("[migrate] failed:", err?.message || err);
  for (const key of ["code", "detail", "hint", "position", "where"]) {
    if (err?.[key] != null) console.error(`[migrate]   ${key}: ${err[key]}`);
  }
  if (isConnectionError(err)) {
    console.error(
      "[migrate] Connection/auth problem — deploy continues; fix DATABASE_URL and redeploy.",
    );
    process.exit(0);
  }
  process.exit(1);
});

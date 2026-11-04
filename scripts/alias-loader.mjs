// Test-only resolver: maps "@/x" to src/x(.ts|.tsx|/index.ts) so node:test can
// import app modules. Registered by scripts/alias-register.mjs.
import { existsSync, statSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { join } from "node:path";

const SRC = fileURLToPath(new URL("../src/", import.meta.url));
const isFile = (p) => existsSync(p) && statSync(p).isFile();

export async function resolve(specifier, context, next) {
  if (specifier.startsWith("@/")) {
    const base = join(SRC, specifier.slice(2));
    const hit = [base, `${base}.ts`, `${base}.tsx`, join(base, "index.ts")].find(isFile);
    if (hit) return next(pathToFileURL(hit).href, context);
  }
  return next(specifier, context);
}

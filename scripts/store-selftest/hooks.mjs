// Module-resolution hooks for scripts/store-selftest.mjs. They let plain Node
// load the app's TypeScript the way Next.js does, and swap the database
// driver for an in-memory Postgres. Nothing here runs in the real site.
import { existsSync, statSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = new URL("../../", import.meta.url);
const POSTGRES_SHIM = new URL("./postgres-shim.mjs", import.meta.url).href;

function firstExisting(baseUrl) {
  const base = fileURLToPath(baseUrl);
  for (const candidate of [base, `${base}.ts`, `${base}.tsx`, `${base}/index.ts`]) {
    if (existsSync(candidate) && statSync(candidate).isFile()) {
      return pathToFileURL(candidate).href;
    }
  }
  return null;
}

export async function resolve(specifier, context, nextResolve) {
  // The app talks to Postgres through @vercel/postgres — give it the shim.
  if (specifier === "@vercel/postgres") {
    return { url: POSTGRES_SHIM, shortCircuit: true };
  }

  // "@/x" is the repo root (tsconfig paths); relative imports omit ".ts".
  const fromApp = context.parentURL && !context.parentURL.includes("/node_modules/");
  if (specifier.startsWith("@/")) {
    const url = firstExisting(new URL(specifier.slice(2), ROOT));
    if (url) return { url, shortCircuit: true };
  } else if (fromApp && (specifier.startsWith("./") || specifier.startsWith("../"))) {
    const url = firstExisting(new URL(specifier, context.parentURL));
    if (url) return { url, shortCircuit: true };
  }

  try {
    return await nextResolve(specifier, context);
  } catch (err) {
    // Bare subpaths like "next/server" need their ".js" spelled out in ESM.
    if (err?.code === "ERR_MODULE_NOT_FOUND" && /^[a-z@]/i.test(specifier)) {
      return nextResolve(`${specifier}.js`, context);
    }
    throw err;
  }
}

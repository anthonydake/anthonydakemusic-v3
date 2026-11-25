import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // The site's own browser scripts are plain ES5-style files, packed by
    // site/build.mjs and checked by the browser tests, not by this linter.
    "site/js/**",
    "public/site/**",
  ]),
]);

export default eslintConfig;

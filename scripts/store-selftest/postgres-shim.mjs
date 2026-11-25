// Stand-in for @vercel/postgres during scripts/store-selftest.mjs: the same
// `sql` tagged template, backed by PGlite (real Postgres compiled to run
// in-process, in memory). The site's SQL runs unchanged and no real database
// is touched.
let PGlite;
try {
  ({ PGlite } = await import("@electric-sql/pglite"));
} catch {
  console.error(
    "The self-test needs PGlite, which is not a project dependency.\n" +
      "Install it for this run only:  npm install --no-save @electric-sql/pglite"
  );
  process.exit(2);
}

export const db = new PGlite();

export async function sql(strings, ...values) {
  let text = strings[0];
  for (let i = 0; i < values.length; i += 1) {
    text += `$${i + 1}${strings[i + 1]}`;
  }
  const result = await db.query(text, values);
  return { rows: result.rows, rowCount: result.affectedRows ?? result.rows.length };
}

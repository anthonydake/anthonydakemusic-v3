import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const CONTENT_DIR = path.join(ROOT, "content", "projects");
const OUT_FILE = path.join(ROOT, "lib", "projects.generated.ts");

function fail(msg) {
  throw new Error(`[generate-projects] ${msg}`);
}

function isObject(v) {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function isString(v) {
  return typeof v === "string";
}

function isNonEmptyString(v) {
  return isString(v) && v.trim().length > 0;
}

function isNumber(v) {
  return typeof v === "number" && Number.isFinite(v);
}

function isStringArray(v) {
  return Array.isArray(v) && v.every(isNonEmptyString);
}

function assert(condition, msg) {
  if (!condition) fail(msg);
}

function validateMedia(m, ctx) {
  assert(isObject(m), `${ctx}: media item must be an object`);
  assert(isNonEmptyString(m.kind), `${ctx}: media.kind must be a string`);

  if (m.kind === "video") {
    assert(m.provider === "youtube" || m.provider === "vimeo", `${ctx}: video.provider must be youtube|vimeo`);
    assert(isNonEmptyString(m.id), `${ctx}: video.id must be a non-empty string`);
    if (m.title != null) assert(isNonEmptyString(m.title), `${ctx}: video.title must be a non-empty string if present`);
    return;
  }

  if (m.kind === "audio") {
    assert(
      m.provider === "spotify" || m.provider === "soundcloud" || m.provider === "apple_music",
      `${ctx}: audio.provider must be spotify|soundcloud|apple_music`
    );
    assert(isNonEmptyString(m.url), `${ctx}: audio.url must be a non-empty string`);
    if (m.title != null) assert(isNonEmptyString(m.title), `${ctx}: audio.title must be a non-empty string if present`);
    if (m.height != null) assert(isNumber(m.height), `${ctx}: audio.height must be a number if present`);
    return;
  }

  if (m.kind === "image") {
    assert(isNonEmptyString(m.src), `${ctx}: image.src must be a non-empty string`);
    assert(isNonEmptyString(m.alt), `${ctx}: image.alt must be a non-empty string`);
    if (m.title != null) assert(isNonEmptyString(m.title), `${ctx}: image.title must be a non-empty string if present`);
    return;
  }

  fail(`${ctx}: unknown media.kind "${m.kind}"`);
}

function normalizeProject(p) {
  return {
    slug: p.slug,
    title: p.title,
    subtitle: p.subtitle,
    year: p.year,
    role: p.role,
    tags: [...p.tags].sort((a, b) => a.localeCompare(b)),
    blurb: p.blurb,
    tone: p.tone,
    deliverables: p.deliverables,
    credits: p.credits,
    narrative: p.narrative,
    links: p.links,
    media: p.media,
  };
}

async function main() {
  const entries = await fs.readdir(CONTENT_DIR, { withFileTypes: true });
  const jsonFiles = entries
    .filter((e) => e.isFile() && e.name.endsWith(".json"))
    .map((e) => e.name)
    .sort((a, b) => a.localeCompare(b));

  assert(jsonFiles.length > 0, `No JSON files found in ${CONTENT_DIR}`);

  const seenSlugs = new Set();
  const projects = [];

  for (const filename of jsonFiles) {
    const filePath = path.join(CONTENT_DIR, filename);
    const raw = await fs.readFile(filePath, "utf8");

    let data;
    try {
      data = JSON.parse(raw);
    } catch (err) {
      fail(`${filename}: invalid JSON (${err?.message || err})`);
    }

    assert(isObject(data), `${filename}: root must be an object`);

    const base = path.basename(filename, ".json");
    assert(data.slug === base, `${filename}: slug must match filename (${base})`);
    assert(isNonEmptyString(data.slug), `${filename}: slug must be a non-empty string`);
    assert(!seenSlugs.has(data.slug), `${filename}: duplicate slug "${data.slug}"`);
    seenSlugs.add(data.slug);

    assert(isNonEmptyString(data.title), `${filename}: title must be a non-empty string`);
    assert(isNonEmptyString(data.subtitle), `${filename}: subtitle must be a non-empty string`);
    assert(isNumber(data.year), `${filename}: year must be a number`);
    assert(isNonEmptyString(data.role), `${filename}: role must be a non-empty string`);

    assert(isStringArray(data.tags), `${filename}: tags must be a non-empty string[]`);
    assert(isNonEmptyString(data.blurb), `${filename}: blurb must be a non-empty string`);

    assert(Array.isArray(data.tone) && data.tone.length === 2 && data.tone.every(isNonEmptyString), `${filename}: tone must be [string, string]`);
    assert(isStringArray(data.deliverables), `${filename}: deliverables must be a non-empty string[]`);
    assert(isStringArray(data.credits), `${filename}: credits must be a non-empty string[]`);
    assert(isStringArray(data.narrative), `${filename}: narrative must be a non-empty string[]`);

    assert(Array.isArray(data.links) && data.links.length > 0, `${filename}: links must be a non-empty array`);
    data.links.forEach((l, idx) => {
      const ctx = `${filename}: links[${idx}]`;
      assert(isObject(l), `${ctx} must be an object`);
      assert(isNonEmptyString(l.label), `${ctx}.label must be a non-empty string`);
      assert(isNonEmptyString(l.href), `${ctx}.href must be a non-empty string`);
    });

    assert(Array.isArray(data.media), `${filename}: media must be an array`);
    data.media.forEach((m, idx) => validateMedia(m, `${filename}: media[${idx}]`));

    projects.push(normalizeProject(data));
  }

  projects.sort((a, b) => (b.year - a.year) || String(a.title).localeCompare(String(b.title)));

  const out = `/* This file is generated by scripts/generate-projects.mjs. Do not edit by hand. */\n` +
    `import type { Project } from "./projects";\n\n` +
    `export const projects: Project[] = ${JSON.stringify(projects, null, 2)};\n`;

  await fs.writeFile(OUT_FILE, out, "utf8");
  console.log(`[generate-projects] Wrote ${path.relative(ROOT, OUT_FILE)} (${projects.length} projects)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

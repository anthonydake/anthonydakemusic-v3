import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const CONTENT_FILE = path.join(ROOT, "content", "projects.json");
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
  const raw = await fs.readFile(CONTENT_FILE, "utf8");
  let data;
  try {
    data = JSON.parse(raw);
  } catch (err) {
    fail(`projects.json: invalid JSON (${err?.message || err})`);
  }

  assert(Array.isArray(data), "projects.json: root must be an array");
  assert(data.length > 0, "projects.json: must contain at least one project");

  const seenSlugs = new Set();
  const projects = [];

  data.forEach((project, idx) => {
    const ctx = `projects[${idx}]`;
    assert(isObject(project), `${ctx}: must be an object`);
    assert(isNonEmptyString(project.slug), `${ctx}: slug must be a non-empty string`);
    assert(!seenSlugs.has(project.slug), `${ctx}: duplicate slug "${project.slug}"`);
    seenSlugs.add(project.slug);

    assert(isNonEmptyString(project.title), `${ctx}: title must be a non-empty string`);
    assert(isNonEmptyString(project.subtitle), `${ctx}: subtitle must be a non-empty string`);
    assert(isNumber(project.year), `${ctx}: year must be a number`);
    assert(isNonEmptyString(project.role), `${ctx}: role must be a non-empty string`);

    assert(isStringArray(project.tags), `${ctx}: tags must be a non-empty string[]`);
    assert(isNonEmptyString(project.blurb), `${ctx}: blurb must be a non-empty string`);

    assert(
      Array.isArray(project.tone) && project.tone.length === 2 && project.tone.every(isNonEmptyString),
      `${ctx}: tone must be [string, string]`
    );
    assert(isStringArray(project.deliverables), `${ctx}: deliverables must be a non-empty string[]`);
    assert(isStringArray(project.credits), `${ctx}: credits must be a non-empty string[]`);
    assert(isStringArray(project.narrative), `${ctx}: narrative must be a non-empty string[]`);

    assert(Array.isArray(project.links) && project.links.length > 0, `${ctx}: links must be a non-empty array`);
    project.links.forEach((l, linkIdx) => {
      const linkCtx = `${ctx}: links[${linkIdx}]`;
      assert(isObject(l), `${linkCtx} must be an object`);
      assert(isNonEmptyString(l.label), `${linkCtx}.label must be a non-empty string`);
      assert(isNonEmptyString(l.href), `${linkCtx}.href must be a non-empty string`);
    });

    assert(Array.isArray(project.media), `${ctx}: media must be an array`);
    project.media.forEach((m, mediaIdx) => validateMedia(m, `${ctx}: media[${mediaIdx}]`));

    projects.push(normalizeProject(project));
  });

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

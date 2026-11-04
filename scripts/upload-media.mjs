#!/usr/bin/env node
// Upload one file to Vercel Blob with public access.
// Usage: node scripts/upload-media.mjs <local-file> <blob-path>
// e.g.:  node scripts/upload-media.mjs ./media/hero.mp4 hero/reel.mp4

import { readFile } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { put } from "@vercel/blob";

const EXT_TO_CONTENT_TYPE = {
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
  ".mp3": "audio/mpeg",
  ".m4a": "audio/mp4",
  ".wav": "audio/wav",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

function loadEnvLocal() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (!existsSync(envPath)) return;
  const raw = readFileSync(envPath, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

async function main() {
  const [, , localFile, blobPath] = process.argv;
  if (!localFile || !blobPath) {
    console.error("Usage: node scripts/upload-media.mjs <local-file> <blob-path>");
    console.error("Example: node scripts/upload-media.mjs ./media/reel.mp4 hero/reel.mp4");
    process.exit(1);
  }

  if (!existsSync(localFile)) {
    console.error(`File not found: ${localFile}`);
    process.exit(1);
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    loadEnvLocal();
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error("BLOB_READ_WRITE_TOKEN is not set.");
    console.error("Run: npx vercel env pull .env.local");
    process.exit(1);
  }

  const ext = path.extname(localFile).toLowerCase();
  const contentType = EXT_TO_CONTENT_TYPE[ext] || "application/octet-stream";

  const buffer = await readFile(localFile);
  const blob = await put(blobPath, buffer, {
    access: "public",
    contentType,
    addRandomSuffix: false,
    allowOverwrite: true,
  });

  console.log("");
  console.log(`Uploaded: ${localFile} → ${blob.pathname}`);
  console.log(`Public URL: ${blob.url}`);
  console.log("");

  const normalized = blobPath.replace(/\\/g, "/");
  if (normalized.startsWith("hero/") && (ext === ".mp4" || ext === ".webm")) {
    console.log("Paste into app/components/HomeClient.tsx:");
    console.log(`  const HERO_VIDEO_URL: string | null = "${blob.url}";`);
  } else if (normalized.startsWith("audio/") && (ext === ".mp3" || ext === ".m4a" || ext === ".wav")) {
    const id = path.basename(blobPath, ext).toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const label = id
      .split("-")
      .filter(Boolean)
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
      .join(" ");
    console.log("Paste into app/components/AudioShowcase.tsx → AUDIO_CLIPS:");
    console.log(`  { id: "${id}", label: "${label}", src: "${blob.url}" },`);
  } else {
    console.log("Use the Public URL above wherever you need it.");
  }
  console.log("");
}

main().catch((err) => {
  console.error(err?.message || err);
  process.exit(1);
});

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const timeoutMs = 15000;
const concurrency = 6;

const httpRegex = /https?:\/\/[^\s"')]+/g;

function uniq(list) {
  return [...new Set(list)];
}

function loadProjects() {
  const jsonPath = path.join(root, "content", "projects.json");
  const projects = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
  const urls = [];
  for (const p of projects) {
    for (const link of p.links ?? []) {
      if (typeof link?.href === "string" && link.href.startsWith("http")) urls.push(link.href);
    }
    for (const media of p.media ?? []) {
      if (typeof media?.url === "string" && media.url.startsWith("http")) urls.push(media.url);
    }
  }
  return urls;
}

function loadPerformance() {
  const dataPath = path.join(root, "data", "performance.data.ts");
  const text = fs.readFileSync(dataPath, "utf8");
  const urls = text.match(httpRegex) ?? [];
  return urls.map((u) => u.replace(/[).,;]+$/, ""));
}

function withTimeout(promise, ms) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return Promise.race([
    promise(controller.signal).finally(() => clearTimeout(timer)),
    new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), ms + 50)),
  ]);
}

async function checkUrl(url) {
  const start = Date.now();
  try {
    const res = await withTimeout((signal) => fetch(url, { method: "HEAD", redirect: "follow", signal }), timeoutMs);
    return { url, status: res.status, ok: res.status < 400, ms: Date.now() - start };
  } catch {
    try {
      const res = await withTimeout((signal) => fetch(url, { method: "GET", redirect: "follow", signal }), timeoutMs);
      return { url, status: res.status, ok: res.status < 400, ms: Date.now() - start };
    } catch (inner) {
      return { url, status: null, ok: false, error: inner?.message || "error", ms: Date.now() - start };
    }
  }
}

async function run() {
  const urls = uniq([...loadProjects(), ...loadPerformance()]);
  const queue = urls.slice();
  const results = [];

  const workers = Array.from({ length: concurrency }, async () => {
    while (queue.length) {
      const url = queue.shift();
      if (!url) return;
      const result = await checkUrl(url);
      results.push(result);
      const status = result.status ?? "ERR";
      const ok = result.ok ? "OK" : "FAIL";
      console.log(`${ok} ${status} ${url}`);
    }
  });

  await Promise.all(workers);

  const failures = results.filter((r) => !r.ok);
  const summary = {
    total: results.length,
    ok: results.length - failures.length,
    failed: failures.length,
    failures,
  };

  fs.writeFileSync(path.join(root, "reports", "external-links.json"), JSON.stringify(summary, null, 2));
  if (failures.length) process.exitCode = 1;
}

const reportsDir = path.join(root, "reports");
if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

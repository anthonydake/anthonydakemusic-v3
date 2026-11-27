#!/usr/bin/env node
// THE WHOLE SITE ON THIS MACHINE, WITH NOTHING REAL BEHIND IT.
//
//   npm install --no-save @electric-sql/pglite     (once; not a project dependency)
//   node scripts/local-site.mjs [port]             (default 4010)
//
// It serves every page and every /api route by calling the site's real route
// handlers, so a browser can walk the full path: Products -> Buy -> a stand-in
// for Square's checkout page -> the order page -> Download, and the booking
// form. Square is a local mock, Postgres is in memory (PGlite), emails are
// printed instead of sent, and any other network call is refused. No account,
// no real database, no money.
//
// What it is not: Next.js. Redirects from next.config.ts, caching and the
// static/dynamic split are Next's own and are checked with `npm run build`
// and `npm run start`. scripts/site-check.mjs drives a browser through this.
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import http from "node:http";
import { register } from "node:module";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const asked = Number(process.argv[2]);       // a port on the command line counts only when this file is the one being run
const direct = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
const PORT = direct && Number.isInteger(asked) && asked > 0 ? asked : Number(process.env.PORT || 4010);
const SITE = `http://localhost:${PORT}`;
const quiet = process.env.LOCAL_SITE_QUIET === "1";
const log = (...a) => { if (!quiet) console.log(...a); };

// The pages need public/site and lib/site/manifest.generated.ts.
execFileSync(process.execPath, [path.join(ROOT, "site", "build.mjs")], { stdio: quiet ? "ignore" : "inherit" });

// ---------------------------------------------------------------- mock Square
// Each payment link the site asks for becomes a page here with two buttons.
const mock = { links: [], paid: new Set() };

// The site's checkout now sends a full Square Order (line items, applied
// taxes). Compute what the buyer owes the same way Square does: sum the
// lines, sum the service charges, add tax where the line/charge has an
// applied_tax, round the tax amount per line to whole cents.
function computeOrderTotals(order) {
  const taxPct = Number((order?.taxes ?? [])[0]?.percentage ?? 0) / 100;
  let subtotal = 0;
  let taxCents = 0;
  for (const li of order?.line_items ?? []) {
    const amount = (li.base_price_money?.amount ?? 0) * Number(li.quantity ?? "1");
    subtotal += amount;
    if ((li.applied_taxes ?? []).length > 0) taxCents += Math.round(amount * taxPct);
  }
  for (const sc of order?.service_charges ?? []) {
    const amount = sc.amount_money?.amount ?? 0;
    subtotal += amount;
    if ((sc.applied_taxes ?? []).length > 0) taxCents += Math.round(amount * taxPct);
  }
  return { subtotalCents: subtotal, taxCents, totalCents: subtotal + taxCents };
}

const payment = (squareOrderId) => ({
  id: `PAY_${squareOrderId}`,
  status: "COMPLETED",
  order_id: squareOrderId,
  amount_money: { amount: mock.links.find((l) => l.orderId === squareOrderId)?.amount ?? 100, currency: "USD" },
  buyer_email_address: "local-buyer@example.com",
  receipt_number: "LoCl",
  source_type: "CARD",
  card_details: { card: { card_brand: "VISA", last_4: "1111" } },
});

const squareApi = http.createServer(async (req, res) => {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const body = Buffer.concat(chunks).toString("utf8");
  const send = (status, json) => { res.writeHead(status, { "Content-Type": "application/json" }); res.end(JSON.stringify(json)); };
  const { pathname } = new URL(req.url, "http://127.0.0.1");
  if (process.env.LOCAL_SQUARE_DOWN === "1") return send(503, { errors: [{ category: "API_ERROR", code: "SERVICE_UNAVAILABLE" }] });
  if (req.method === "POST" && pathname === "/v2/online-checkout/payment-links") {
    const request = JSON.parse(body);
    const totals = computeOrderTotals(request?.order ?? {});
    const orderId = `LOCALORDER${crypto.randomBytes(6).toString("hex")}`;
    mock.links.push({
      orderId,
      request,
      // The fake Square charges the full total (line items + tax), matching
      // what the site's checkout stored on the order row (amount_cents).
      amount: totals.totalCents,
      subtotalCents: totals.subtotalCents,
      taxCents: totals.taxCents,
      name: request?.order?.line_items?.[0]?.name ?? "Item",
      taxLabel: (request?.order?.taxes ?? [])[0]?.name ?? "",
      redirect: request?.checkout_options?.redirect_url ?? `${SITE}/`,
    });
    return send(200, { payment_link: { id: `LOCALLINK${mock.links.length}`, version: 1, order_id: orderId, url: `${SITE}/__square/${orderId}` } });
  }
  if (req.method === "POST" && pathname === "/v2/orders/calculate") {
    // Preview totals — the cart's step-2 page calls this so the displayed
    // tax matches what the fake Square will charge. Same math as above.
    const totals = computeOrderTotals(JSON.parse(body)?.order ?? {});
    return send(200, {
      order: {
        total_money: { amount: totals.totalCents, currency: "USD" },
        total_tax_money: { amount: totals.taxCents, currency: "USD" },
      },
    });
  }
  let match = pathname.match(/^\/v2\/orders\/([^/]+)$/);
  if (req.method === "GET" && match) {
    const paid = mock.paid.has(match[1]);
    return send(200, { order: { id: match[1], state: paid ? "OPEN" : "DRAFT", ...(paid ? { tenders: [{ id: `PAY_${match[1]}` }] } : {}) } });
  }
  match = pathname.match(/^\/v2\/payments\/PAY_(.+)$/);
  if (req.method === "GET" && match) return send(200, { payment: payment(match[1]) });
  return send(404, { errors: [{ category: "INVALID_REQUEST_ERROR", code: "NOT_FOUND" }] });
});
await new Promise((resolve) => squareApi.listen(0, "127.0.0.1", resolve));
const MOCK = `http://127.0.0.1:${squareApi.address().port}`;

// ------------------------------------------------- environment + network guard
process.env.NODE_ENV = "development";
Object.assign(process.env, {
  SQUARE_ENVIRONMENT: "sandbox",
  SQUARE_ACCESS_TOKEN: "local-token",
  SQUARE_LOCATION_ID: "LOCALLOC",
  SQUARE_WEBHOOK_SIGNATURE_KEY: "local-signature-key",
  SQUARE_API_BASE: MOCK,
  RESEND_API_KEY: "local-resend-key",
});
if (process.env.LOCAL_STORE_CLOSED === "1") { delete process.env.SQUARE_ACCESS_TOKEN; delete process.env.SQUARE_LOCATION_ID; }

export const emails = [];
const realFetch = globalThis.fetch;
globalThis.fetch = async (input, init) => {
  const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
  if (url.startsWith("https://api.resend.com/")) {
    const mail = JSON.parse(init?.body ?? "{}");
    emails.push(mail);
    log(`  [email not sent] to ${mail.to}: ${mail.subject}`);
    return Response.json({ id: "local" });
  }
  // the mock Square, and this site itself (a check running in this process asks it for pages)
  if (!url.startsWith(`${MOCK}/`) && !url.startsWith(`${SITE}/`)) throw new Error(`local-site refused a network call: ${url}`);
  return realFetch(input, init);
};

// ------------------------------------------------------------ load the app code
register("./store-selftest/hooks.mjs", import.meta.url);
const route = (file) => import(pathToFileURL(path.join(ROOT, "app", file)).href);
const pages = {
  "/": await route("route.ts"),
  "/production": await route("production/route.ts"),
  "/production/sent": await route("production/sent/route.ts"),
  "/production/not-sent": await route("production/not-sent/route.ts"),
  "/about": await route("about/route.ts"),
  "/press-kit": await route("press-kit/route.ts"),
  "/products": await route("products/route.ts"),
  "/llms.txt": await route("llms.txt/route.ts"),
};
const orderPage = await route("products/thanks/[order]/route.ts");
const buyPage = await route("products/buy/[productId]/route.ts");
const missing = await route("[...missing]/route.ts");
const api = {
  "POST /api/book": (await route("api/book/route.ts")).POST,
  "POST /api/store/checkout": (await route("api/store/checkout/route.ts")).POST,
  "GET /api/store/download": (await route("api/store/download/route.ts")).GET,
  "POST /api/square/webhook": (await route("api/square/webhook/route.ts")).POST,
};
const { sql } = await import("./store-selftest/postgres-shim.mjs");

const TYPES = { ".css": "text/css; charset=utf-8", ".js": "application/javascript; charset=utf-8", ".woff2": "font/woff2", ".woff": "font/woff", ".jpg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".svg": "image/svg+xml", ".ico": "image/x-icon", ".pdf": "application/pdf", ".txt": "text/plain; charset=utf-8" };

// The stand-in for Square's checkout page. Shows the breakdown the site sent
// us (subtotal + tax + total), so a walk-through sees the tax number from end
// to end.
function squarePage(link) {
  const safe = (s) => String(s ?? "").replace(/[<&]/g, "");
  const dollars = (c) => `$${(c / 100).toFixed(2)}`;
  const taxRow = link.taxCents > 0
    ? `<tr><th style="text-align:left;font-weight:400;padding:4px 16px 4px 0;color:#555">${safe(link.taxLabel || "Sales tax")}</th><td style="text-align:right">${dollars(link.taxCents)}</td></tr>`
    : "";
  return `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Stand-in for Square checkout</title>
<body style="font:16px/1.5 system-ui;max-width:28rem;margin:4rem auto;padding:0 1rem">
<h1 style="font-size:1.25rem">Stand-in for Square's checkout page</h1>
<p>${safe(link.name)}</p>
<table style="width:100%;border-collapse:collapse;margin:1rem 0">
  <tr><th style="text-align:left;font-weight:400;padding:4px 16px 4px 0;color:#555">Subtotal</th><td style="text-align:right">${dollars(link.subtotalCents)}</td></tr>
  ${taxRow}
  <tr><th style="text-align:left;font-weight:600;padding:8px 16px 4px 0;border-top:1px solid #ccc">Total</th><td style="text-align:right;font-weight:600;padding-top:8px;border-top:1px solid #ccc">${dollars(link.amount)}</td></tr>
</table>
<p style="color:#555">Nothing real happens here. This page only exists in scripts/local-site.mjs.</p>
<form method="post" action="/__square/${link.orderId}/pay"><button id="pay" style="font:inherit;padding:.6rem 1.2rem">Pay (pretend)</button></form>
<p><a id="leave" href="${link.redirect}">Go back without paying</a></p></body>`;
}

async function handle(req, res) {
  const url = new URL(req.url, SITE);
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const body = Buffer.concat(chunks);
  const headers = new Headers();
  for (const [k, v] of Object.entries(req.headers)) if (typeof v === "string") headers.set(k, v);
  const request = new Request(url, { method: req.method, headers, body: req.method === "GET" || req.method === "HEAD" ? undefined : body, redirect: "manual" });

  let response;
  const square = url.pathname.match(/^\/__square\/([^/]+)(\/pay)?$/);
  if (square) {
    const link = mock.links.find((l) => l.orderId === square[1]);
    if (!link) response = new Response("No such payment link.", { status: 404 });
    else if (square[2] && req.method === "POST") { mock.paid.add(link.orderId); response = new Response(null, { status: 303, headers: { Location: link.redirect } }); }
    else response = new Response(squarePage(link), { headers: { "Content-Type": "text/html; charset=utf-8" } });
  } else if (api[`${req.method} ${url.pathname}`]) {
    response = await api[`${req.method} ${url.pathname}`](request);
  } else if (req.method === "GET" || req.method === "HEAD") {
    const order = url.pathname.match(/^\/products\/thanks\/([^/]+)$/);
    const buy = url.pathname.match(/^\/products\/buy\/([^/]+)$/);
    const file = path.join(ROOT, "public", decodeURIComponent(url.pathname));
    if (pages[url.pathname.replace(/(.)\/$/, "$1")]) response = await pages[url.pathname.replace(/(.)\/$/, "$1")].GET(request);
    else if (buy) response = await buyPage.GET(request, { params: Promise.resolve({ productId: decodeURIComponent(buy[1]) }) });
    else if (order) response = await orderPage.GET(request, { params: Promise.resolve({ order: order[1] }) });
    else if (file.startsWith(path.join(ROOT, "public") + path.sep) && fs.existsSync(file) && fs.statSync(file).isFile()) {
      response = new Response(fs.readFileSync(file), { headers: { "Content-Type": TYPES[path.extname(file).toLowerCase()] ?? "application/octet-stream" } });
    } else response = await missing.GET(request);
  } else response = new Response("Method not allowed.", { status: 405 });

  const out = {};
  response.headers.forEach((v, k) => { out[k] = v; });
  res.writeHead(response.status, out);
  res.end(req.method === "HEAD" ? undefined : Buffer.from(await response.arrayBuffer()));
  log(`${req.method} ${url.pathname}${url.search} -> ${response.status}`);
}

export const server = http.createServer((req, res) => {
  handle(req, res).catch((err) => { console.error(err); res.writeHead(500); res.end("local-site error"); });
});
await new Promise((resolve) => server.listen(PORT, "127.0.0.1", resolve));

// Handles for a test that imports this file: the database, the mock, a way to stop.
export const local = {
  url: SITE,
  sql,
  mock,
  emails,
  close: () => { server.close(); squareApi.close(); },
};
log(`\nThe site is at ${SITE}  (Square: mock, database: in memory, email: printed here). Ctrl-C to stop.\n`);

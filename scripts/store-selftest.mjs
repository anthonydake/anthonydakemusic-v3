#!/usr/bin/env node
// Self-test for the store: checkout → payment confirmation → delivery →
// refund, run against the real route handlers.
//
//   npm install --no-save @electric-sql/pglite   (once; not a project dependency)
//   node scripts/store-selftest.mjs
//
// It is safe to run anywhere. Square is a local mock, Postgres is in-memory
// (PGlite), emails are captured instead of sent, and any other network call
// fails the run. No Square account, no real database, no money.
//
// Not covered here: the two page components (/store and /store/thanks/[order])
// — `npm run build` compiles them — and Square's real payload shapes, which
// only a sandbox payment proves.

import crypto from "node:crypto";
import http from "node:http";
import { register } from "node:module";

const SITE = "https://store.selftest";
const SIGNATURE_KEY = "selftest-signature-key";
const PRICE_CENTS = 100;
const BUYER = "selftest-buyer@example.com";
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// ---------------------------------------------------------------- mock Square
const mock = { links: [], paid: new Set() };

function paymentFor(squareOrderId, overrides = {}) {
  return {
    id: `PAY_${squareOrderId}`,
    status: "COMPLETED",
    order_id: squareOrderId,
    amount_money: { amount: PRICE_CENTS, currency: "USD" },
    buyer_email_address: BUYER,
    ...overrides,
  };
}

const mockServer = http.createServer(async (req, res) => {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const body = Buffer.concat(chunks).toString("utf8");
  const send = (status, json) => {
    res.writeHead(status, { "Content-Type": "application/json" });
    res.end(JSON.stringify(json));
  };
  const { pathname } = new URL(req.url, "http://127.0.0.1");

  if (req.headers.authorization !== "Bearer selftest-token" && !pathname.startsWith("/files/")) {
    return send(401, { errors: [{ category: "AUTHENTICATION_ERROR", code: "UNAUTHORIZED" }] });
  }
  if (req.method === "POST" && pathname === "/v2/online-checkout/payment-links") {
    const orderId = `MOCKORDER${crypto.randomBytes(6).toString("hex")}`;
    mock.links.push({ request: JSON.parse(body), orderId });
    return send(200, {
      payment_link: {
        id: `MOCKLINK${mock.links.length}`,
        version: 1,
        order_id: orderId,
        url: `https://sandbox.square.link/u/mock${mock.links.length}`,
      },
    });
  }
  let match = pathname.match(/^\/v2\/orders\/([^/]+)$/);
  if (req.method === "GET" && match) {
    const paid = mock.paid.has(match[1]);
    return send(200, {
      order: {
        id: match[1],
        state: paid ? "OPEN" : "DRAFT",
        ...(paid ? { tenders: [{ id: `PAY_${match[1]}` }] } : {}),
      },
    });
  }
  match = pathname.match(/^\/v2\/payments\/PAY_(.+)$/);
  if (req.method === "GET" && match) return send(200, { payment: paymentFor(match[1]) });
  if (req.method === "GET" && pathname === "/files/groove%20pack.zip") {
    res.writeHead(200, { "Content-Type": "application/zip", "Content-Length": "12" });
    return res.end("ZIP-CONTENTS");
  }
  return send(404, { errors: [{ category: "INVALID_REQUEST_ERROR", code: "NOT_FOUND" }] });
});

await new Promise((resolve) => mockServer.listen(0, "127.0.0.1", resolve));
const MOCK = `http://127.0.0.1:${mockServer.address().port}`;

// ------------------------------------------------- environment + network guard
process.env.NODE_ENV = "development";
Object.assign(process.env, {
  SQUARE_ENVIRONMENT: "sandbox",
  SQUARE_ACCESS_TOKEN: "selftest-token",
  SQUARE_LOCATION_ID: "SELFTESTLOC",
  SQUARE_WEBHOOK_SIGNATURE_KEY: SIGNATURE_KEY,
  SQUARE_API_BASE: MOCK,
  RESEND_API_KEY: "selftest-resend-key",
});
for (const name of ["SQUARE_WEBHOOK_URL", "STORE_EMAIL_FROM", "BOOKING_NOTIFY_FROM", "BOOKING_NOTIFY_EMAIL"]) {
  delete process.env[name];
}

const emails = [];
let resendFails = false;
const realFetch = globalThis.fetch;
globalThis.fetch = async (input, init) => {
  const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
  if (url.startsWith("https://api.resend.com/")) {
    emails.push(JSON.parse(init?.body ?? "{}"));
    return resendFails
      ? new Response('{"message":"blocked"}', { status: 403 })
      : Response.json({ id: "selftest" });
  }
  if (!url.startsWith(`${MOCK}/`)) {
    throw new Error(`self-test blocked an unexpected network call: ${url}`);
  }
  return realFetch(input, init);
};

// ------------------------------------------------------------ load the app code
register("./store-selftest/hooks.mjs", import.meta.url);
const { sql } = await import("./store-selftest/postgres-shim.mjs");
const checkoutRoute = await import("../app/api/store/checkout/route.ts");
const webhookRoute = await import("../app/api/square/webhook/route.ts");
const downloadRoute = await import("../app/api/store/download/route.ts");
const { confirmWithSquare } = await import("../lib/store/fulfill.ts");
const { listProducts } = await import("../lib/store/catalog.ts");
const { ensureStoreSchema, getOrderById, downloadIsOpen, orderPageState } = await import(
  "../lib/store/orders.ts"
);

// ------------------------------------------------------------------- helpers
const results = [];
function check(name, ok, detail = "") {
  results.push({ name, ok: Boolean(ok) });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${ok || !detail ? "" : `  — ${detail}`}`);
}

async function checkout(product = "test-download", origin = SITE) {
  const before = mock.links.length;
  const res = await checkoutRoute.POST(
    new Request(`${SITE}/api/store/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded", Origin: origin },
      body: `product=${encodeURIComponent(product)}`,
    })
  );
  const link = mock.links.length > before ? mock.links.at(-1) : null;
  const ourId = link?.request?.checkout_options?.redirect_url?.split("/").pop() ?? "";
  return { res, link, ourId, location: res.headers.get("location") ?? "" };
}

function webhook(event, { key = SIGNATURE_KEY, signedUrl = `${SITE}/api/square/webhook` } = {}) {
  const body = JSON.stringify(event);
  const signature = crypto.createHmac("sha256", key).update(signedUrl + body).digest("base64");
  return webhookRoute.POST(
    new Request(`${SITE}/api/square/webhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-square-hmacsha256-signature": signature },
      body,
    })
  );
}

function paymentEvent(squareOrderId, overrides = {}, type = "payment.updated") {
  return {
    merchant_id: "SELFTEST",
    type,
    event_id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
    data: { type: "payment", id: `PAY_${squareOrderId}`, object: { payment: paymentFor(squareOrderId, overrides) } },
  };
}

const download = (token) =>
  downloadRoute.GET(new Request(`${SITE}/api/store/download?token=${encodeURIComponent(token)}`));

// --------------------------------------------------------------------- checks
let failed = false;
try {
  // --- catalog gating
  check("sandbox lists the placeholder product", listProducts().some((p) => p.id === "test-download"));
  process.env.SQUARE_ENVIRONMENT = "production";
  check("live mode hides the placeholder product", listProducts().length === 0);
  let attempt = await checkout();
  check(
    "live mode refuses to sell the placeholder",
    attempt.res.status === 303 && attempt.location.endsWith("/store?error=unavailable") && !attempt.link
  );
  process.env.SQUARE_ENVIRONMENT = "sandbox";

  // --- checkout
  const first = await checkout();
  const sent = first.link?.request;
  check(
    "checkout redirects the buyer to Square",
    first.res.status === 303 && first.location.startsWith("https://sandbox.square.link/"),
    `${first.res.status} ${first.location}`
  );
  check(
    "Square receives the item, price, location and return URL",
    sent?.quick_pay?.name === "Test download" &&
      sent?.quick_pay?.price_money?.amount === PRICE_CENTS &&
      sent?.quick_pay?.price_money?.currency === "USD" &&
      sent?.quick_pay?.location_id === "SELFTESTLOC" &&
      UUID_RE.test(first.ourId) &&
      sent?.idempotency_key === first.ourId &&
      sent?.checkout_options?.redirect_url === `${SITE}/store/thanks/${first.ourId}`,
    JSON.stringify(sent)
  );
  let order = await getOrderById(first.ourId);
  check(
    "a pending order is saved, tagged sandbox",
    order?.status === "pending" &&
      order.environment === "sandbox" &&
      order.square_order_id === first.link.orderId &&
      order.amount_cents === PRICE_CENTS &&
      order.download_token.length >= 40
  );

  attempt = await checkout("test-download", "https://evil.example");
  check("a cross-site checkout post is refused", attempt.res.status === 403 && !attempt.link);
  attempt = await checkout("no-such-product");
  check("an unknown product is sent back to the store", attempt.location.endsWith("/store?error=unavailable") && !attempt.link);

  const token = process.env.SQUARE_ACCESS_TOKEN;
  delete process.env.SQUARE_ACCESS_TOKEN;
  attempt = await checkout();
  check("with no Square keys, checkout is unavailable", attempt.location.endsWith("/store?error=unavailable") && !attempt.link);
  process.env.SQUARE_ACCESS_TOKEN = "wrong-token";
  attempt = await checkout();
  check("a Square error sends the buyer back unharmed", attempt.location.endsWith("/store?error=checkout"));
  process.env.SQUARE_ACCESS_TOKEN = token;

  // --- before payment
  check("an unpaid order cannot be downloaded", (await download(order.download_token)).status === 409);
  order = await confirmWithSquare(order, SITE);
  check("asking Square about an unpaid order leaves it pending", order.status === "pending");
  check(
    "the order page waits, then stops re-checking after 12 tries",
    orderPageState(order, 0) === "pending" && orderPageState(order, 11) === "pending" && orderPageState(order, 12) === "stalled"
  );

  // --- webhook: things that must not unlock the order
  let res = await webhook(paymentEvent(first.link.orderId), { key: "wrong-key" });
  check("a webhook with a bad signature is rejected", res.status === 403);
  res = await webhookRoute.POST(new Request(`${SITE}/api/square/webhook`, { method: "POST", body: "{}" }));
  check("a webhook with no signature is rejected", res.status === 403);
  res = await webhook(paymentEvent("SOME_OTHER_SQUARE_ORDER"));
  check("a payment for something outside the store is acknowledged and ignored", res.status === 200);
  res = await webhook(paymentEvent(first.link.orderId, { amount_money: { amount: 50, currency: "USD" } }));
  check("an underpayment does not unlock the order", res.status === 200 && (await getOrderById(first.ourId)).status === "pending");
  res = await webhook(paymentEvent(first.link.orderId, { amount_money: { amount: PRICE_CENTS, currency: "CAD" } }));
  check("a payment in the wrong currency does not unlock the order", (await getOrderById(first.ourId)).status === "pending");
  res = await webhook(paymentEvent(first.link.orderId, { status: "APPROVED" }));
  check("an unfinished payment does not unlock the order", (await getOrderById(first.ourId)).status === "pending");
  check("nothing was emailed before payment", emails.length === 0);

  // --- webhook: the real thing
  res = await webhook(paymentEvent(first.link.orderId));
  order = await getOrderById(first.ourId);
  check(
    "a signed payment.updated marks the order paid",
    res.status === 200 &&
      order.status === "paid" &&
      order.square_payment_id === `PAY_${first.link.orderId}` &&
      order.buyer_email === BUYER &&
      order.paid_at instanceof Date
  );
  const notice = emails.find((e) => e.subject?.includes("New sale"));
  const delivery = emails.find((e) => e.to === BUYER);
  check("Anthony gets a sale notice, marked as a test", notice?.to === "adakemusic@gmail.com" && notice.subject.startsWith("[TEST] "));
  check(
    "the buyer is emailed a link to their order page",
    delivery?.text?.includes(`${SITE}/store/thanks/${first.ourId}`) && order.email_sent_at instanceof Date
  );

  const paidAt = order.paid_at.getTime();
  const emailCount = emails.length;
  res = await webhook(paymentEvent(first.link.orderId));
  res = await webhook(paymentEvent(first.link.orderId, {}, "payment.created"));
  order = await getOrderById(first.ourId);
  check(
    "repeat webhooks change nothing and send nothing",
    res.status === 200 && order.paid_at.getTime() === paidAt && emails.length === emailCount
  );

  // --- download
  res = await download(order.download_token);
  let body = await res.text();
  check(
    "the download is delivered as a file",
    res.status === 200 &&
      (res.headers.get("content-disposition") ?? "").includes('attachment; filename="anthony-dake-test-download.txt"') &&
      body.includes(first.ourId)
  );
  check("the download is counted", (await getOrderById(first.ourId)).download_count === 1);
  check("the order page shows the download once paid", orderPageState(await getOrderById(first.ourId), 0) === "ready");
  check("a made-up download token is not found", (await download("x".repeat(43))).status === 404);
  check("a malformed download token is not found", (await download("../../etc/passwd")).status === 404);

  // --- refund
  res = await webhook({
    type: "refund.updated",
    data: { type: "refund", object: { refund: { id: "REF1", payment_id: `PAY_${first.link.orderId}`, status: "COMPLETED" } } },
  });
  order = await getOrderById(first.ourId);
  check("a refund closes the download", res.status === 200 && order.status === "refunded" && (await download(order.download_token)).status === 403);
  check("the order page says the order was refunded", orderPageState(order, 0) === "refunded");
  res = await webhook(paymentEvent(first.link.orderId));
  check("a refunded order cannot be re-opened by a late webhook", (await getOrderById(first.ourId)).status === "refunded");

  // --- no webhook at all: the order page asks Square itself
  const second = await checkout();
  mock.paid.add(second.link.orderId);
  order = await confirmWithSquare(await getOrderById(second.ourId), SITE);
  check("with no webhook, asking Square directly marks the order paid", order.status === "paid" && downloadIsOpen(order));

  // --- limits
  await sql`UPDATE store_orders SET download_count = 10 WHERE id = ${second.ourId}`;
  order = await getOrderById(second.ourId);
  check("the download closes after 10 uses", !downloadIsOpen(order) && (await download(order.download_token)).status === 410);
  await sql`UPDATE store_orders SET download_count = 0, paid_at = NOW() - INTERVAL '31 days' WHERE id = ${second.ourId}`;
  order = await getOrderById(second.ourId);
  check("the download closes after 30 days", !downloadIsOpen(order) && (await download(order.download_token)).status === 410);
  check("the order page says the link expired", orderPageState(order, 0) === "expired");

  // --- email failure never blocks an order, and is retried
  const third = await checkout();
  resendFails = true;
  res = await webhook(paymentEvent(third.link.orderId));
  order = await getOrderById(third.ourId);
  check("a failed email still leaves the order paid", res.status === 200 && order.status === "paid" && order.email_sent_at === null);
  resendFails = false;
  res = await webhook(paymentEvent(third.link.orderId));
  order = await getOrderById(third.ourId);
  check("the next event retries the email", order.email_sent_at instanceof Date);

  // --- webhook URL + configuration
  const fourth = await checkout();
  process.env.SQUARE_WEBHOOK_URL = "https://www.anthonydakemusic.com/api/square/webhook";
  res = await webhook(paymentEvent(fourth.link.orderId), { signedUrl: process.env.SQUARE_WEBHOOK_URL });
  check("a signature made for SQUARE_WEBHOOK_URL is accepted", res.status === 200 && (await getOrderById(fourth.ourId)).status === "paid");
  delete process.env.SQUARE_WEBHOOK_URL;
  delete process.env.SQUARE_WEBHOOK_SIGNATURE_KEY;
  res = await webhook(paymentEvent(fourth.link.orderId));
  check("with no signature key, the webhook refuses everything", res.status === 503);
  process.env.SQUARE_WEBHOOK_SIGNATURE_KEY = SIGNATURE_KEY;

  // --- an order made in one mode is never confirmed with the other mode's keys
  const fifth = await checkout();
  mock.paid.add(fifth.link.orderId);
  process.env.SQUARE_ENVIRONMENT = "production";
  order = await confirmWithSquare(await getOrderById(fifth.ourId), SITE);
  check("a sandbox order is not confirmed with live keys", order.status === "pending");
  process.env.SQUARE_ENVIRONMENT = "sandbox";

  // --- a real product's file: location comes from an env var, streamed to the buyer
  await ensureStoreSchema();
  const remoteToken = crypto.randomBytes(32).toString("base64url");
  await sql`
    INSERT INTO store_orders (id, product_id, amount_cents, environment, status, paid_at, download_token)
    VALUES (${crypto.randomUUID()}, 'groove-pack-1', 1500, 'sandbox', 'paid', NOW(), ${remoteToken})
  `;
  check("a product with no file configured cannot be downloaded", (await download(remoteToken)).status === 503);
  process.env.STORE_FILE_GROOVE_PACK_1 = `${MOCK}/files/groove%20pack.zip`;
  res = await download(remoteToken);
  body = await res.text();
  check(
    "a configured file is streamed without exposing its location",
    res.status === 200 &&
      body === "ZIP-CONTENTS" &&
      res.headers.get("content-type") === "application/zip" &&
      (res.headers.get("content-disposition") ?? "").includes('filename="groove pack.zip"') &&
      !res.headers.has("location")
  );
  delete process.env.STORE_FILE_GROOVE_PACK_1;
} catch (err) {
  failed = true;
  console.error("\nThe self-test crashed:", err);
} finally {
  mockServer.close();
}

const bad = results.filter((r) => !r.ok);
console.log(`\n${results.length - bad.length} of ${results.length} checks passed.`);
process.exit(failed || bad.length > 0 ? 1 : 0);

// THE SITE'S DOCUMENTS, ON THE SERVER (lib/site/render.ts).
//
// Every public address answers with one whole HTML document, built here from
// the same templates the browser uses (site/templates.mjs) and the same words
// (site/content.mjs). No React on a public page: the route handlers under
// app/ call renderDocument() and send the string.
//
// What a document carries besides its words:
//   - the stylesheet and the script made by site/build.mjs (public/site/),
//     addressed with a mark of their contents so a browser re-fetches them
//     only when they change (lib/site/manifest.generated.ts, made by the build);
//   - window.__AD, the document's note to the script: where pictures are,
//     what is for sale right now, and whether the store is in test mode.
//
// Server only. Never import this from a "use client" file.
import { MANIFEST } from "./manifest.generated";
import { documentHtml } from "@/site/templates.mjs";
import { PAGES, SITE } from "@/site/content.mjs";
import { listProducts } from "@/lib/store/catalog";
import { getSquareConfig } from "@/lib/store/config";

export type PageName =
  | "home"
  | "production"
  | "about"
  | "press-kit"
  | "products"
  | "buy"
  | "order"
  | "missing";

/** The public part of a product: what a page may show. */
export type ShopProduct = { id: string; title: string; blurb: string; priceCents: number };

export type Storefront = {
  /** True only when Square's keys are set AND there is something to sell. */
  open: boolean;
  /** Square is running in its sandbox: no real charges. */
  sandbox: boolean;
  products: ShopProduct[];
};

/**
 * What is for sale right now. With no Square keys, or nothing sellable, the
 * store is closed: the header shows no Products link and /products is a 404.
 * (A placeholder product is sellable only in sandbox: see lib/store/catalog.ts.)
 */
export function storefront(): Storefront {
  const config = getSquareConfig();
  const products = config
    ? listProducts().map((p) => ({ id: p.id, title: p.title, blurb: p.blurb, priceCents: p.priceCents }))
    : [];
  return {
    open: Boolean(config) && products.length > 0,
    sandbox: config ? config.environment === "sandbox" : false,
    products,
  };
}

const V = MANIFEST.v;
const FONTS: Record<string, string> = MANIFEST.fonts;

/** JSON that is safe to place inside a <script> element. */
function scriptJson(value: unknown): string {
  // "<" so the text can never close the script element; the two line separators (char codes 8232 and 8233) because older script engines read them as line ends inside a string
  const separators = new RegExp("[" + String.fromCharCode(8232, 8233) + "]", "g");
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(separators, (c) => "\\u" + c.charCodeAt(0).toString(16));
}

// Who the site is about, for search engines. Facts only; the page's own words
// are in site/content.mjs.
function jsonLd(): string {
  const person = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": `${SITE.origin}/#person`,
        name: SITE.name,
        alternateName: SITE.moniker,
        url: SITE.origin,
        jobTitle: "Music producer",
        email: SITE.email,
        address: { "@type": "PostalAddress", addressLocality: "Columbus", addressRegion: "OH", addressCountry: "US" },
        sameAs: ["https://www.tiktok.com/@anthony_dake", "https://www.youtube.com/@anthony_dake"],
      },
      {
        "@type": "WebSite",
        "@id": `${SITE.origin}/#website`,
        url: SITE.origin,
        name: SITE.name,
        publisher: { "@id": `${SITE.origin}/#person` },
      },
    ],
  };
  return `<script type="application/ld+json">${scriptJson(person)}</script>\n`;
}

// Vercel Web Analytics, as its own package would inject it (the queue, then
// the script Vercel serves at this address on a deployment). Left out of local
// runs, and out of the order page: that address is a buyer's key and must not
// be reported anywhere.
function analytics(page: PageName): string {
  if (!process.env.VERCEL || page === "order") return "";
  return (
    "<script>window.va=window.va||function(){(window.vaq=window.vaq||[]).push(arguments)};</script>\n" +
    '<script defer src="/_vercel/insights/script.js"></script>\n'
  );
}

function head(page: PageName): string {
  const font = (file: string) =>
    `<link rel="preload" href="/site/fonts/${file}?h=${FONTS[file]}" as="font" type="font/woff2" crossorigin>\n`;
  return (
    // the two faces every screen opens with, asked for before the stylesheet names them
    font("courier-prime-400.woff2") +
    (page === "home" ? font("instrument-serif-400.woff2") : "") +
    `<link rel="stylesheet" href="/site/app.css?v=${V}">\n` +
    `<link rel="icon" href="/favicon.ico" sizes="32x32">\n` +
    `<link rel="icon" type="image/png" sizes="192x192" href="/favicon.png">\n` +
    `<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">\n` +
    `<link rel="me" href="https://www.tiktok.com/@anthony_dake">\n` +
    `<link rel="me" href="https://www.youtube.com/@anthony_dake">\n` +
    (page === "home" || page === "about" ? jsonLd() : "")
  );
}

function tail(page: PageName, shop: Storefront): string {
  const note = {
    mode: "site",
    v: V,
    base: "/site/img/",
    products: shop.open ? shop.products : [],
    sandbox: shop.sandbox,
  };
  return (
    `<script>window.__AD=${scriptJson(note)};</script>\n` +
    `<script defer src="/site/app.js?v=${V}"></script>\n` +
    analytics(page)
  );
}

export type RenderOptions = {
  /** What is for sale. Defaults to asking the store. */
  shop?: Storefront;
  /** Extra tags for the head (the order page's own refresh). */
  headExtra?: string;
  /** A title other than the page's own. */
  title?: string;
  noindex?: boolean;
};

/** One address's whole document. `data` is the page's own state (see site/templates.mjs). */
export function renderDocument(page: PageName, data?: Record<string, unknown> | null, options: RenderOptions = {}): string {
  const shop = options.shop ?? storefront();
  const target = {
    href: (name: string) => (name === "home" ? "/" : (PAGES as Record<string, { path: string | null }>)[name]?.path || "/"),
    asset: (file: string) => `/site/img/${file}?v=${V}`,
    inlineImg: false,
    products: shop.open ? shop.products : null,
    head: head(page),
    tail: tail(page, shop),
    test: "",
  };
  const pageData: Record<string, unknown> = { ...(data ?? {}) };
  if (options.headExtra) pageData.headExtra = options.headExtra;
  if (options.title) pageData.title = options.title;
  if (options.noindex) pageData.noindex = true;
  if (page === "products" && pageData.products === undefined) {
    pageData.products = shop.products;
    pageData.sandbox = shop.sandbox;
  }
  return documentHtml(target, page, pageData);
}

export type HtmlOptions = {
  status?: number;
  /** Cache-Control for this answer. Left unset, Next decides (a prerendered page is cached; a request-time one is not). */
  cache?: string;
  headers?: Record<string, string>;
};

/** Sends a document, with the headers every page of the site carries. */
export function htmlResponse(html: string, options: HtmlOptions = {}): Response {
  const headers: Record<string, string> = {
    "Content-Type": "text/html; charset=utf-8",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    // nobody else's page may put this site in a frame (a Buy button under someone's overlay), or re-point its links
    "Content-Security-Policy": "frame-ancestors 'none'; base-uri 'self'; object-src 'none'",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    ...(options.cache ? { "Cache-Control": options.cache } : {}),
    ...(options.headers ?? {}),
  };
  return new Response(html, { status: options.status ?? 200, headers });
}

/** The site's own "Not found" page, as a 404. */
export function notFoundResponse(): Response {
  return htmlResponse(renderDocument("missing"), { status: 404, cache: "private, no-store" });
}

/** The address a request really arrived at (a preview's own host, not the live one). */
export function requestOrigin(request: Request): string {
  const self = new URL(request.url);
  const host = (request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? "").split(",")[0].trim();
  if (!host) return self.origin;
  const forwarded = (request.headers.get("x-forwarded-proto") ?? "").split(",")[0].trim();
  const proto = forwarded || (host.startsWith("localhost") || host.startsWith("127.0.0.1") ? "http" : "https");
  return `${proto}://${host}`;
}


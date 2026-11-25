import { STORE_PRODUCTS } from "@/data/store.data";
import type { StoreOrder } from "./orders";

// Where each product's file comes from. Server only — never import this from
// a "use client" file.
//
// This repository is public, so a file's location is never written in code.
// A real product reads it from an environment variable set in Vercel:
//
//   STORE_FILE_<PRODUCT_ID>     product "groove-pack-1" → STORE_FILE_GROOVE_PACK_1
//
// The value is the file's URL (a Vercel Blob URL works). The file is fetched
// server-side and streamed to the buyer, so the URL never reaches them. That
// is fine up to roughly 50 MB; for bigger files move to a private Blob store
// and hand out short-lived signed URLs instead of streaming.
export type ProductFile =
  | {
      kind: "generated";
      filename: string;
      contentType: string;
      body: (order: StoreOrder) => string;
    }
  | { kind: "remote"; filename: string; url: string };

type GeneratedFile = Extract<ProductFile, { kind: "generated" }>;

// Small text files built on the fly — only the sandbox placeholder uses this.
const GENERATED: Record<string, GeneratedFile> = {
  "test-download": {
    kind: "generated",
    filename: "anthony-dake-test-download.txt",
    contentType: "text/plain; charset=utf-8",
    body: (order) =>
      `Test download from anthonydakemusic.com\n\n` +
      `If you are reading this, checkout, payment confirmation and delivery all worked.\n\n` +
      `Order: ${order.id}\n` +
      `Mode: ${order.environment}\n`,
  },
};

export function fileEnvName(productId: string): string {
  return `STORE_FILE_${productId.toUpperCase().replace(/[^A-Z0-9]+/g, "_")}`;
}

function safeFilename(name: string): string {
  const cleaned = name.replace(/[^A-Za-z0-9._ -]+/g, "").trim();
  return cleaned || "download";
}

/** Undefined when a product has nothing to deliver yet — it is then not sellable. */
export function getProductFile(productId: string): ProductFile | undefined {
  const generated = GENERATED[productId];
  if (generated) return generated;

  const url = process.env[fileEnvName(productId)]?.trim();
  if (!url) return undefined;

  let nameFromUrl: string;
  try {
    nameFromUrl = decodeURIComponent(new URL(url).pathname.split("/").pop() ?? "");
  } catch {
    return undefined; // not a URL — treat as not configured
  }

  const product = STORE_PRODUCTS.find((p) => p.id === productId);
  return {
    kind: "remote",
    filename: safeFilename(product?.downloadName ?? nameFromUrl),
    url,
  };
}

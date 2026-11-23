import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import ThanksClient from "./page.client";
import { getProduct } from "@/lib/store/catalog";
import { SITE_URL } from "@/lib/store/config";
import { confirmWithSquare } from "@/lib/store/fulfill";
import { ensureStoreSchema, getOrderById, orderPageState } from "@/lib/store/orders";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your order",
  robots: { index: false, follow: false },
  // The URL is the buyer's key to the download — never pass it on in a Referer.
  referrer: "no-referrer",
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type Props = {
  params: Promise<{ order: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

async function requestOrigin(): Promise<string> {
  const h = await headers();
  const host = (h.get("x-forwarded-host") ?? h.get("host") ?? "").split(",")[0].trim();
  if (!host) return SITE_URL;
  const forwarded = (h.get("x-forwarded-proto") ?? "").split(",")[0].trim();
  const proto = forwarded || (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

// Where Square sends the buyer after paying, and the page the delivery email
// links to. The order id in the URL is the buyer's key to the download.
export default async function ThanksPage({ params, searchParams }: Props) {
  const { order: orderId } = await params;
  if (!UUID_RE.test(orderId)) notFound();

  await ensureStoreSchema();
  let order = await getOrderById(orderId);
  if (!order) notFound();

  // The redirect usually beats the webhook, so ask Square directly.
  if (order.status === "pending") {
    order = await confirmWithSquare(order, await requestOrigin());
  }

  // While a payment is unconfirmed the page re-checks itself every few
  // seconds (?n counts the tries), then stops and tells the buyer what to do.
  const sp = await searchParams;
  const checks = Math.max(0, Number.parseInt(typeof sp.n === "string" ? sp.n : "0", 10) || 0);
  const state = orderPageState(order, checks);

  const page = `/store/thanks/${order.id}`;

  return (
    <>
      {state === "pending" && (
        <meta httpEquiv="refresh" content={`4;url=${page}?n=${checks + 1}`} />
      )}
      <ThanksClient
        state={state}
        title={getProduct(order.product_id)?.title ?? "Your download"}
        downloadHref={
          state === "ready" ? `/api/store/download?token=${order.download_token}` : null
        }
        retryHref={page}
        sandbox={order.environment !== "production"}
      />
    </>
  );
}

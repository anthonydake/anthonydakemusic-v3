import { htmlResponse, notFoundResponse, renderDocument, requestOrigin } from "@/lib/site/render";
import { getProduct } from "@/lib/store/catalog";
import { confirmWithSquare } from "@/lib/store/fulfill";
import { ensureStoreSchema, getOrderById, orderPageState, type OrderPageState } from "@/lib/store/orders";

export const dynamic = "force-dynamic";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// The order page: where Square sends the buyer after paying, and the page the
// receipt email links to. The order id in the address is the buyer's key to
// the download, so this answer is never cached, never indexed, and never
// passed on in a Referer.
const PRIVATE = { cache: "private, no-store", headers: { "Referrer-Policy": "no-referrer", "X-Robots-Tag": "noindex, nofollow" } };

function page(
  state: OrderPageState,
  input: {
    id: string;
    title: string;
    token: string | null;
    sandbox: boolean;
    checks: number;
    totals?: {
      subtotalCents: number;
      shippingCents: number;
      taxCents: number;
      totalCents: number;
    } | null;
  },
  status = 200
): Response {
  const address = `/products/thanks/${input.id}`;
  // While a payment is unconfirmed the page re-checks itself every few
  // seconds (?n counts the tries), then stops and tells the buyer what to do.
  const refresh =
    state === "pending" ? `<meta http-equiv="refresh" content="4;url=${address}?n=${input.checks + 1}">\n` : "";
  const html = renderDocument(
    "order",
    {
      state,
      title: input.title,
      downloadHref: state === "ready" && input.token ? `/api/store/download?token=${input.token}` : null,
      retryHref: address,
      sandbox: input.sandbox,
      totals: input.totals ?? null,
    },
    { headExtra: refresh }
  );
  return htmlResponse(html, { ...PRIVATE, status });
}

export async function GET(request: Request, context: { params: Promise<{ order: string }> }) {
  const { order: orderId } = await context.params;
  if (!UUID_RE.test(orderId)) return notFoundResponse();

  const checks = Math.max(0, Number.parseInt(new URL(request.url).searchParams.get("n") ?? "0", 10) || 0);

  try {
    await ensureStoreSchema();
    let order = await getOrderById(orderId);
    if (!order) return notFoundResponse();

    // The redirect usually beats the webhook, so ask Square directly.
    if (order.status === "pending") {
      order = await confirmWithSquare(order, requestOrigin(request));
    }

    const totals = {
      subtotalCents: (order.taxable_amount_cents ?? 0) + (order.non_taxable_amount_cents ?? 0) - (order.shipping_cents ?? 0),
      shippingCents: order.shipping_cents ?? 0,
      taxCents: order.tax_cents ?? 0,
      totalCents: order.amount_cents,
    };

    return page(orderPageState(order, checks), {
      id: order.id,
      title: getProduct(order.product_id)?.title ?? "Your download",
      token: order.download_token,
      sandbox: order.environment !== "production",
      checks,
      totals,
    });
  } catch (err) {
    // The database could not be reached. The buyer may well have paid, so say
    // what the "not confirmed yet" state says, and let them check again.
    console.error("[store] order page failed:", err instanceof Error ? err.message : String(err));
    return page("stalled", { id: orderId, title: "Your download", token: null, sandbox: false, checks }, 503);
  }
}

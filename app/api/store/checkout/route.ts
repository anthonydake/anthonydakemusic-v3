import crypto from "crypto";
import { NextResponse } from "next/server";
import { findProduct } from "@/lib/store/catalog";
import { getSquareConfig, SUPPORT_EMAIL } from "@/lib/store/config";
import { createOrder, ensureStoreSchema } from "@/lib/store/orders";
import { createPaymentLink } from "@/lib/store/square";
import { computeTax, isAcceptedBuyerState } from "@/lib/store/tax";

export const dynamic = "force-dynamic";

// Plain HTML form target. The /products/buy/<id> cart POSTs here with:
//   product=<id>&state=<US-two-letter or "XX">
// On success: 303 to Square's payment page. On any problem: 303 back with
// ?error=<code> so the UI can tell the buyer why without showing a server
// error page. Known-good product → back to its cart. Unknown / hidden
// product → back to /products (the cart for an unknown id would just 404).
function backToCart(request: Request, productId: string, code: string, knownProduct: boolean) {
  const to =
    knownProduct && productId
      ? `/products/buy/${encodeURIComponent(productId)}?error=${code}`
      : `/products?error=${code}`;
  return NextResponse.redirect(new URL(to, request.url), 303);
}

export async function POST(request: Request) {
  const self = new URL(request.url);

  // Same-origin posts only. Compared against the host that served this
  // request (not NEXT_PUBLIC_SITE_URL) so preview deployments work too.
  const origin = request.headers.get("origin");
  if (origin) {
    try {
      if (new URL(origin).host !== self.host) {
        return NextResponse.json({ error: "Forbidden." }, { status: 403 });
      }
    } catch {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }
  }

  const config = getSquareConfig();
  if (!config) return backToCart(request, "", "unavailable", false);

  let productId = "";
  let rawState = "";
  try {
    const form = await request.formData();
    const pid = form.get("product");
    const st = form.get("state");
    if (typeof pid === "string") productId = pid.trim();
    if (typeof st === "string") rawState = st.trim().toUpperCase();
  } catch {
    productId = "";
  }

  const product = findProduct(productId);
  if (!product) return backToCart(request, productId, "unavailable", false);

  // Accept a real US state code or the catch-all "XX" ("Outside the United
  // States"). Anything else — "" or e.g. "ZZ" — is a step-1 error.
  const buyerState = isAcceptedBuyerState(rawState) ? rawState : "";
  if (!buyerState) return backToCart(request, product.id, "state", true);

  // Compute tax locally; this is what gets stored on the order. Square will
  // charge the same number because the Order sent to CreatePaymentLink carries
  // the same percentage tax, applied to the same lines.
  const breakdown = computeTax({
    buyerState,
    lines: [
      {
        productId: product.id,
        priceCents: product.priceCents,
        quantity: 1,
        category: product.taxCategory,
      },
    ],
    shippingCents: 0,
  });

  const orderId = crypto.randomUUID();
  const downloadToken = crypto.randomBytes(32).toString("base64url");

  try {
    await ensureStoreSchema();

    const link = await createPaymentLink(config, {
      idempotencyKey: orderId,
      currency: "USD",
      lines: [
        {
          name: product.title,
          priceCents: product.priceCents,
          quantity: 1,
          category: product.taxCategory,
        },
      ],
      shippingCents: 0,
      buyerState,
      redirectUrl: `${self.origin}/products/thanks/${orderId}`,
      note: `anthonydakemusic.com order ${orderId}`,
      supportEmail: SUPPORT_EMAIL,
    });

    await createOrder({
      id: orderId,
      productId: product.id,
      amountCents: breakdown.totalCents,
      currency: "USD",
      environment: config.environment,
      squareOrderId: link.orderId,
      squarePaymentLinkId: link.id,
      downloadToken,
      buyerState: buyerState === "XX" ? null : buyerState,
      taxCategory: product.taxCategory,
      taxableAmountCents: breakdown.taxableAmountCents,
      nonTaxableAmountCents: breakdown.nonTaxableAmountCents,
      shippingCents: breakdown.shippingCents,
      taxCents: breakdown.taxCents,
      taxRate: breakdown.rate,
    });

    return NextResponse.redirect(link.url, 303);
  } catch (err) {
    console.error(
      "[store] checkout failed:",
      err instanceof Error ? err.message : String(err)
    );
    return backToCart(request, product.id, "checkout", true);
  }
}

import {
  htmlResponse,
  notFoundResponse,
  renderDocument,
  storefront,
} from "@/lib/site/render";
import { findProduct } from "@/lib/store/catalog";
import { getSquareConfig } from "@/lib/store/config";
import { calculateOrderTotals } from "@/lib/store/square";
import { computeTax, isAcceptedBuyerState, taxRateFor } from "@/lib/store/tax";

export const dynamic = "force-dynamic";

// The cart / confirm page. Two steps, so tax shows before Buy with no
// JavaScript:
// 1) /products/buy/<id>            → form asks for the buyer's state
// 2) /products/buy/<id>?state=OH   → shows subtotal/tax/total + Confirm & pay
//
// The address itself is private (the item + state live in the URL), so it is
// never cached and never indexed. Only the POST to /api/store/checkout
// actually creates the Square payment link.
// Referrer-Policy is same-origin (not no-referrer): no-referrer makes Chrome
// send Origin: null on the Confirm & pay POST to /api/store/checkout, and the
// route's same-origin check then rejects the submission as a 403. same-origin
// still sends no referrer to Square or any other site.
const PRIVATE = {
  cache: "private, no-store",
  headers: {
    "Referrer-Policy": "same-origin",
    "X-Robots-Tag": "noindex, nofollow",
  },
};

export async function GET(
  request: Request,
  context: { params: Promise<{ productId: string }> }
) {
  const { productId } = await context.params;
  const product = findProduct(productId);
  const shop = storefront();
  if (!product || !shop.open) return notFoundResponse();

  const url = new URL(request.url);
  const rawState = (url.searchParams.get("state") || "").trim().toUpperCase();
  // Accept a real US state code or the catch-all "XX" ("Outside the United
  // States"). Anything else drops back to step 1 (the state picker).
  const state = isAcceptedBuyerState(rawState) ? rawState : "";
  // The checkout POST can bounce the buyer back here with ?error=<code>
  // ("state" if the state field was missing or invalid; "checkout" if the
  // Square call failed). The template maps the code to a visible message.
  const rawError = (url.searchParams.get("error") || "").trim();
  const error = rawError === "state" || rawError === "checkout" ? rawError : null;

  // Step 1 — no state picked yet, or step 2 with an error worth re-asking
  // the state after.
  if (!state || error === "state") {
    const html = renderDocument(
      "buy",
      {
        step: "state",
        product: {
          id: product.id,
          title: product.title,
          priceCents: product.priceCents,
        },
        sandbox: shop.sandbox,
        error,
      },
      { shop }
    );
    return htmlResponse(html, PRIVATE);
  }

  // Step 2 — state is settled. Compute totals, and (if Square is reachable)
  // ask Square to preview the same order so the cart's number matches what
  // the buyer will be charged, rounding and all.
  const rate = taxRateFor(state);
  const local = computeTax({
    buyerState: state,
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

  let totals = {
    subtotalCents: local.subtotalCents,
    shippingCents: local.shippingCents,
    taxCents: local.taxCents,
    totalCents: local.totalCents,
  };

  const config = getSquareConfig();
  if (config && rate > 0) {
    const square = await calculateOrderTotals(config, {
      idempotencyKey: `preview-${product.id}-${state}`,
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
      buyerState: state,
      redirectUrl: `${url.origin}/products/thanks/preview`,
      note: "preview",
      supportEmail: "",
    });
    if (square) {
      totals = {
        subtotalCents: square.subtotalCents,
        shippingCents: 0,
        taxCents: square.taxCents,
        totalCents: square.totalCents,
      };
    }
  }

  const html = renderDocument(
    "buy",
    {
      step: "confirm",
      product: {
        id: product.id,
        title: product.title,
        priceCents: product.priceCents,
      },
      // Pass the raw state through (including the catch-all "XX") so the
      // hidden input in the Confirm & pay form carries a value the checkout
      // route will accept. The template's "is this Ohio?" check still works
      // for XX (it is not OH, so no tax row).
      buyerState: state,
      totals,
      sandbox: shop.sandbox,
      error,
    },
    { shop }
  );
  return htmlResponse(html, PRIVATE);
}

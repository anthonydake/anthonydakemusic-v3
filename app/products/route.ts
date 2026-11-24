import { htmlResponse, notFoundResponse, renderDocument, storefront } from "@/lib/site/render";

// Products: what is for sale, each with its own Buy (a plain form to
// POST /api/store/checkout). Answered per request: checkout sends a buyer
// back here with ?error=… when Square's page could not be opened.
export const dynamic = "force-dynamic";

export function GET(request: Request) {
  // With no Square keys or nothing to sell there is no store: a 404, as before.
  const shop = storefront();
  if (!shop.open) return notFoundResponse();

  const error = new URL(request.url).searchParams.has("error");
  const html = renderDocument("products", { products: shop.products, sandbox: shop.sandbox, error }, { shop });
  return htmlResponse(html, { cache: "private, no-store" });
}

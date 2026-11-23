import crypto from "crypto";
import { NextResponse } from "next/server";
import { findProduct } from "@/lib/store/catalog";
import { getSquareConfig, SUPPORT_EMAIL } from "@/lib/store/config";
import { createOrder, ensureStoreSchema } from "@/lib/store/orders";
import { createPaymentLink } from "@/lib/store/square";

export const dynamic = "force-dynamic";

// Plain HTML form target: POST product=<id>, answer with a redirect. Works
// with JavaScript off — the Buy button on /store is a real form.
function backToStore(request: Request, code: string) {
  return NextResponse.redirect(new URL(`/store?error=${code}`, request.url), 303);
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
  if (!config) return backToStore(request, "unavailable");

  let productId = "";
  try {
    const form = await request.formData();
    const value = form.get("product");
    if (typeof value === "string") productId = value.trim();
  } catch {
    productId = "";
  }

  const product = findProduct(productId);
  if (!product) return backToStore(request, "unavailable");

  const orderId = crypto.randomUUID();
  const downloadToken = crypto.randomBytes(32).toString("base64url");

  try {
    await ensureStoreSchema();

    const link = await createPaymentLink(config, {
      idempotencyKey: orderId,
      name: product.title,
      amountCents: product.priceCents,
      currency: "USD",
      redirectUrl: `${self.origin}/store/thanks/${orderId}`,
      note: `anthonydakemusic.com order ${orderId}`,
      supportEmail: SUPPORT_EMAIL,
    });

    await createOrder({
      id: orderId,
      productId: product.id,
      amountCents: product.priceCents,
      currency: "USD",
      environment: config.environment,
      squareOrderId: link.orderId,
      squarePaymentLinkId: link.id,
      downloadToken,
    });

    return NextResponse.redirect(link.url, 303);
  } catch (err) {
    console.error(
      "[store] checkout failed:",
      err instanceof Error ? err.message : String(err)
    );
    return backToStore(request, "checkout");
  }
}

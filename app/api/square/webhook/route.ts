import { NextResponse } from "next/server";
import { settlePayment } from "@/lib/store/fulfill";
import { ensureStoreSchema, markRefundedByPaymentId } from "@/lib/store/orders";
import { verifyWebhookSignature, type SquarePayment } from "@/lib/store/square";

export const dynamic = "force-dynamic";

type SquareEvent = {
  type?: string;
  data?: {
    object?: {
      payment?: SquarePayment;
      refund?: { payment_id?: string; status?: string };
    };
  };
};

// Square → this site. Subscribe the webhook to payment.updated and
// refund.updated. Every request is checked against Square's signature before
// anything is read from it; a 5xx answer makes Square retry.
export async function POST(request: Request) {
  const signatureKey = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY?.trim();
  if (!signatureKey) {
    return NextResponse.json({ error: "Not configured." }, { status: 503 });
  }

  // The raw body, exactly as sent — the signature covers these bytes.
  const rawBody = await request.text();
  const signatureHeader = request.headers.get("x-square-hmacsha256-signature") ?? "";

  // The signed text starts with the URL registered in Square. Accept the URL
  // this request actually arrived at, or an explicit SQUARE_WEBHOOK_URL.
  const self = new URL(request.url);
  const candidates = [
    process.env.SQUARE_WEBHOOK_URL?.trim(),
    `${self.origin}${self.pathname}`,
  ].filter((url): url is string => Boolean(url));

  const valid = candidates.some((notificationUrl) =>
    verifyWebhookSignature({ signatureKey, notificationUrl, rawBody, signatureHeader })
  );
  if (!valid) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 403 });
  }

  let event: SquareEvent;
  try {
    event = JSON.parse(rawBody) as SquareEvent;
  } catch {
    return NextResponse.json({ error: "Bad payload." }, { status: 400 });
  }

  try {
    const type = event?.type ?? "";

    if (type === "payment.created" || type === "payment.updated") {
      const payment = event.data?.object?.payment;
      if (payment) {
        await ensureStoreSchema();
        await settlePayment(payment, self.origin);
      }
    } else if (type === "refund.created" || type === "refund.updated") {
      const refund = event.data?.object?.refund;
      if (
        refund?.payment_id &&
        (refund.status === "PENDING" || refund.status === "COMPLETED")
      ) {
        await ensureStoreSchema();
        const order = await markRefundedByPaymentId(refund.payment_id);
        if (order) console.log(`[store] order ${order.id} refunded — download closed`);
      }
    }
    // Anything else: acknowledged and ignored.
  } catch (err) {
    console.error(
      "[store] webhook handler failed:",
      err instanceof Error ? err.message : String(err)
    );
    return NextResponse.json({ error: "Handler error." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

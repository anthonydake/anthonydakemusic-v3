import { SUPPORT_EMAIL } from "./config";
import { buildReceiptEmail, type ReceiptInput } from "./receipt";
import { formatPrice } from "@/data/store.data";

// Same Resend setup as the booking notification (key injected by the Vercel
// integration). Until anthonydakemusic.com is a verified Resend domain the
// test sender only delivers to the account owner, so buyer emails will fail
// and the thank-you page is the delivery path. Failures never block an order.

function fromAddress(): string {
  return (
    process.env.STORE_EMAIL_FROM ||
    process.env.BOOKING_NOTIFY_FROM ||
    "noreply@anthonydakemusic.com"
  );
}

/** A buyer sees who the mail is from, so give the bare address a name. */
function fromNamed(): string {
  const address = fromAddress();
  return address.includes("<") ? address : `Anthony Dake <${address}>`;
}

/** Where the store's own mail goes: sale notices, and sandbox receipts. */
export function storeInbox(): string {
  return process.env.BOOKING_NOTIFY_EMAIL || SUPPORT_EMAIL;
}

async function send(payload: {
  to: string;
  subject: string;
  text: string;
  html?: string;
  from?: string;
  reply_to?: string;
}): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn(`[store] RESEND_API_KEY not set — email "${payload.subject}" skipped`);
    return false;
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ ...payload, from: payload.from ?? fromAddress() }),
    });
    if (!res.ok) {
      console.error("[store] Resend send failed:", res.status, await res.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error("[store] Resend send threw:", err);
    return false;
  }
}

/**
 * The buyer's receipt, with the download button on it. The button points at
 * the order page, not the file. Sent as HTML with a plain-text twin; its
 * images load from a public folder (see receiptAssetBase in config.ts).
 */
export async function sendReceiptEmail(input: ReceiptInput): Promise<boolean> {
  const receipt = buildReceiptEmail(input);
  return send({
    to: input.to,
    from: fromNamed(),
    reply_to: SUPPORT_EMAIL,
    subject: receipt.subject,
    text: receipt.text,
    html: receipt.html,
  });
}

/** Tells Anthony a sale landed. */
export async function sendSaleNotice(input: {
  productTitle: string;
  amountCents: number;
  buyerEmail: string | null;
  orderId: string;
  test: boolean;
}): Promise<boolean> {
  return send({
    to: storeInbox(),
    subject: `${input.test ? "[TEST] " : ""}New sale — ${input.productTitle} (${formatPrice(input.amountCents)})`,
    text:
      `Product: ${input.productTitle}\n` +
      `Amount: ${formatPrice(input.amountCents)}\n` +
      `Buyer: ${input.buyerEmail ?? "(no email on the payment)"}\n` +
      `Order: ${input.orderId}\n` +
      (input.test ? `\nSandbox order — no real money moved.\n` : ""),
  });
}

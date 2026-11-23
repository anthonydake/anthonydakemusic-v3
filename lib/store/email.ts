import { SUPPORT_EMAIL } from "./config";
import { DOWNLOAD_WINDOW_DAYS } from "./orders";
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

async function send(payload: {
  to: string;
  subject: string;
  text: string;
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
      body: JSON.stringify({ from: fromAddress(), ...payload }),
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

/** Buyer's copy of the download link. Points at the order page, not the file. */
export async function sendDownloadEmail(input: {
  to: string;
  productTitle: string;
  pageUrl: string;
  test: boolean;
}): Promise<boolean> {
  return send({
    to: input.to,
    reply_to: SUPPORT_EMAIL,
    subject: `${input.test ? "[TEST] " : ""}Your download: ${input.productTitle}`,
    text:
      `Thanks for your order.\n\n` +
      `Your download: ${input.pageUrl}\n\n` +
      `The link works for ${DOWNLOAD_WINDOW_DAYS} days. If anything goes wrong with the file, reply to this email.\n\n` +
      `Anthony Dake\n`,
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
  const to = process.env.BOOKING_NOTIFY_EMAIL || SUPPORT_EMAIL;
  return send({
    to,
    subject: `${input.test ? "[TEST] " : ""}New sale — ${input.productTitle} (${formatPrice(input.amountCents)})`,
    text:
      `Product: ${input.productTitle}\n` +
      `Amount: ${formatPrice(input.amountCents)}\n` +
      `Buyer: ${input.buyerEmail ?? "(no email on the payment)"}\n` +
      `Order: ${input.orderId}\n` +
      (input.test ? `\nSandbox order — no real money moved.\n` : ""),
  });
}

import crypto from "crypto";
import type { SquareConfig } from "./config";

// Thin fetch wrapper around the three Square endpoints the store needs. No
// SDK — same plain-fetch convention as the Resend call in /api/book. The
// Square-Version header is left off on purpose, so requests use the API
// version pinned on the Square application.

export type SquareMoney = { amount?: number; currency?: string };

export type SquarePayment = {
  id?: string;
  status?: string;
  order_id?: string;
  amount_money?: SquareMoney;
  buyer_email_address?: string;
};

export type SquareTender = { id?: string; payment_id?: string };

export type SquareOrder = {
  id?: string;
  state?: string;
  tenders?: SquareTender[];
};

export class SquareApiError extends Error {
  status: number;

  constructor(status: number, detail: string) {
    super(`Square API ${status}: ${detail}`);
    this.name = "SquareApiError";
    this.status = status;
  }
}

function summarizeErrors(json: unknown): string {
  const errors = (
    json as {
      errors?: Array<{ category?: string; code?: string; detail?: string }>;
    } | null
  )?.errors;
  if (!Array.isArray(errors) || errors.length === 0) return "no error detail";
  return errors
    .map((e) => [e.category, e.code, e.detail].filter(Boolean).join(" / "))
    .join("; ");
}

async function squareRequest<T>(
  config: SquareConfig,
  path: string,
  init?: { method?: string; body?: unknown }
): Promise<T> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${config.accessToken}`,
    Accept: "application/json",
  };
  if (init?.body !== undefined) headers["Content-Type"] = "application/json";

  const res = await fetch(`${config.apiBase}${path}`, {
    method: init?.method ?? "GET",
    headers,
    body: init?.body !== undefined ? JSON.stringify(init.body) : undefined,
    cache: "no-store",
  });

  const text = await res.text();
  let json: unknown = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }
  if (!res.ok) throw new SquareApiError(res.status, summarizeErrors(json));
  return json as T;
}

/** Creates a Square-hosted checkout page for one item and returns its URL. */
export async function createPaymentLink(
  config: SquareConfig,
  input: {
    idempotencyKey: string;
    name: string;
    amountCents: number;
    currency: string;
    redirectUrl: string;
    note: string;
    supportEmail: string;
  }
): Promise<{ id: string; url: string; orderId: string }> {
  const json = await squareRequest<{
    payment_link?: { id?: string; url?: string; order_id?: string };
  }>(config, "/v2/online-checkout/payment-links", {
    method: "POST",
    body: {
      idempotency_key: input.idempotencyKey,
      quick_pay: {
        name: input.name,
        price_money: { amount: input.amountCents, currency: input.currency },
        location_id: config.locationId,
      },
      checkout_options: {
        redirect_url: input.redirectUrl,
        ask_for_shipping_address: false,
        merchant_support_email: input.supportEmail,
      },
      payment_note: input.note,
    },
  });

  const link = json?.payment_link;
  if (!link?.id || !link.url || !link.order_id) {
    throw new SquareApiError(502, "payment link response was missing id, url or order_id");
  }
  return { id: link.id, url: link.url, orderId: link.order_id };
}

export async function retrieveOrder(
  config: SquareConfig,
  orderId: string
): Promise<SquareOrder | null> {
  const json = await squareRequest<{ order?: SquareOrder }>(
    config,
    `/v2/orders/${encodeURIComponent(orderId)}`
  );
  return json?.order ?? null;
}

export async function getPayment(
  config: SquareConfig,
  paymentId: string
): Promise<SquarePayment | null> {
  const json = await squareRequest<{ payment?: SquarePayment }>(
    config,
    `/v2/payments/${encodeURIComponent(paymentId)}`
  );
  return json?.payment ?? null;
}

/**
 * Square signs every webhook: base64(HMAC-SHA256(signature key, notification
 * URL + raw body)). The URL is part of the signed text, so it has to be the
 * exact URL registered on the webhook subscription.
 */
export function verifyWebhookSignature(input: {
  signatureKey: string;
  notificationUrl: string;
  rawBody: string;
  signatureHeader: string;
}): boolean {
  if (!input.signatureKey || !input.signatureHeader) return false;
  const expected = crypto
    .createHmac("sha256", input.signatureKey)
    .update(input.notificationUrl + input.rawBody, "utf8")
    .digest();
  const provided = Buffer.from(input.signatureHeader, "base64");
  return (
    provided.length === expected.length &&
    crypto.timingSafeEqual(provided, expected)
  );
}

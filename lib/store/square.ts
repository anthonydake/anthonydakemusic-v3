import crypto from "crypto";
import type { SquareConfig } from "./config";
import { TAX, type TaxCategory, categoryIsTaxable } from "./tax";

// Thin fetch wrapper around the three Square endpoints the store needs. No
// SDK — same plain-fetch convention as the Resend call in /api/book. The
// Square-Version header is left off on purpose, so requests use the API
// version pinned on the Square application.

export type SquareMoney = { amount?: number; currency?: string };

/**
 * A postal address as Square models it. We only ever look at the state
 * (administrative_district_level_1) for the mismatch check. Every field is
 * optional — a sandbox test payment often has no address at all.
 */
export type SquareAddress = {
  administrative_district_level_1?: string;
  locality?: string;
  postal_code?: string;
  country?: string;
};

export type SquarePayment = {
  id?: string;
  status?: string;
  order_id?: string;
  amount_money?: SquareMoney;
  buyer_email_address?: string;
  // Read only for the buyer's receipt. Any of these can be missing.
  receipt_number?: string;
  source_type?: string;
  card_details?: { card?: { card_brand?: string; last_4?: string } };
  wallet_details?: { brand?: string };
  shipping_address?: SquareAddress;
  billing_address?: SquareAddress;
};

const CARD_BRANDS: Record<string, string> = {
  VISA: "Visa",
  MASTERCARD: "Mastercard",
  AMERICAN_EXPRESS: "American Express",
  DISCOVER: "Discover",
  DISCOVER_DINERS: "Diners Club",
  JCB: "JCB",
  CHINA_UNIONPAY: "UnionPay",
  INTERAC: "Interac",
  EFTPOS: "eftpos",
};

/**
 * How the buyer paid, in the words a receipt uses: "Visa ending 4242". Null
 * when Square does not say — the receipt then leaves the line out instead of
 * guessing.
 */
export function describePaidWith(payment: SquarePayment): string | null {
  const card = payment.card_details?.card;
  const last4 = /^\d{4}$/.test(card?.last_4 ?? "") ? card?.last_4 : null;
  if (card?.card_brand || last4) {
    const brand = CARD_BRANDS[card?.card_brand ?? ""] ?? "Card";
    return last4 ? `${brand} ending ${last4}` : brand === "Card" ? null : brand;
  }
  if (payment.wallet_details?.brand === "CASH_APP") return "Cash App";
  return null;
}

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

/** One line in an order sent to Square. */
export type OrderLineInput = {
  /** The product's id in our catalog. Square sees it as the line's "name". */
  name: string;
  /** Unit price, cents. */
  priceCents: number;
  /** Count of the item. */
  quantity: number;
  /** Our category — decides whether Square's order applies tax to this line. */
  category: TaxCategory;
};

export type OrderInput = {
  idempotencyKey: string;
  currency: string;
  lines: readonly OrderLineInput[];
  /** Shipping charge in cents, 0 for downloads. Taxed only when at least one line is physical AND the buyer is in a taxing state. */
  shippingCents?: number;
  /** US two-letter state the buyer stated — decides whether a tax line is applied. */
  buyerState: string | null;
  redirectUrl: string;
  note: string;
  supportEmail: string;
};

/**
 * Builds the `order` payload for Square's CreatePaymentLink and the
 * CalculateOrder endpoint. One function so the "preview the total" call and
 * the "actually create the link" call describe the same order byte for byte.
 */
function buildSquareOrder(
  config: SquareConfig,
  input: OrderInput
): {
  location_id: string;
  reference_id: string;
  line_items: Array<{
    name: string;
    quantity: string;
    base_price_money: SquareMoney;
    applied_taxes?: Array<{ tax_uid: string }>;
  }>;
  taxes?: Array<{
    uid: string;
    name: string;
    percentage: string;
    scope: "LINE_ITEM" | "ORDER";
    type: "ADDITIVE";
  }>;
  service_charges?: Array<{
    name: string;
    amount_money: SquareMoney;
    calculation_phase: "SUBTOTAL_PHASE";
    taxable: boolean;
    applied_taxes?: Array<{ tax_uid: string }>;
  }>;
} {
  const buyerState = (input.buyerState ?? "").trim().toUpperCase();
  const taxable = buyerState === TAX.state;
  const hasPhysical = input.lines.some((l) => l.category === "physical_good");
  const shippingCents = Math.max(0, Math.round(input.shippingCents ?? 0));
  const taxUid = "tax-sales";

  const lineItems = input.lines.map((line) => {
    const lineItem = {
      name: line.name,
      quantity: String(Math.max(1, Math.round(line.quantity))),
      base_price_money: {
        amount: Math.max(0, Math.round(line.priceCents)),
        currency: input.currency,
      },
      ...(taxable && categoryIsTaxable(line.category)
        ? { applied_taxes: [{ tax_uid: taxUid }] }
        : {}),
    };
    return lineItem;
  });

  const taxes = taxable
    ? [
        {
          uid: taxUid,
          name: TAX.displayName,
          // Square expects percentage as a decimal string ("8.0", not "0.08").
          percentage: (TAX.rate * 100).toFixed(1).replace(/\.0$/, ""),
          scope: "LINE_ITEM" as const,
          type: "ADDITIVE" as const,
        },
      ]
    : undefined;

  const shippingTaxable = taxable && hasPhysical;
  const serviceCharges = shippingCents > 0
    ? [
        {
          name: "Shipping",
          amount_money: { amount: shippingCents, currency: input.currency },
          calculation_phase: "SUBTOTAL_PHASE" as const,
          taxable: shippingTaxable,
          ...(shippingTaxable ? { applied_taxes: [{ tax_uid: taxUid }] } : {}),
        },
      ]
    : undefined;

  return {
    location_id: config.locationId,
    reference_id: input.idempotencyKey,
    line_items: lineItems,
    ...(taxes ? { taxes } : {}),
    ...(serviceCharges ? { service_charges: serviceCharges } : {}),
  };
}

/**
 * Calls Square's CalculateOrder to preview what the order will cost without
 * creating anything. We use it so the cart's displayed tax and total exactly
 * match what Square will charge, rounding and all.
 */
export async function calculateOrderTotals(
  config: SquareConfig,
  input: OrderInput
): Promise<{ subtotalCents: number; taxCents: number; totalCents: number } | null> {
  try {
    const json = await squareRequest<{
      order?: {
        total_money?: SquareMoney;
        total_tax_money?: SquareMoney;
        net_amounts?: {
          total_money?: SquareMoney;
          tax_money?: SquareMoney;
        };
      };
    }>(config, "/v2/orders/calculate", {
      method: "POST",
      body: {
        order: buildSquareOrder(config, input),
      },
    });
    const order = json?.order;
    if (!order) return null;
    const total = order.total_money?.amount ?? order.net_amounts?.total_money?.amount ?? 0;
    const tax = order.total_tax_money?.amount ?? order.net_amounts?.tax_money?.amount ?? 0;
    return {
      subtotalCents: total - tax,
      taxCents: tax,
      totalCents: total,
    };
  } catch {
    // CalculateOrder is a confidence check. If it fails (network blip, old
    // sandbox), fall back to our own computeTax() number — the caller has it
    // already and will use it as the display total.
    return null;
  }
}

/**
 * Creates a Square-hosted checkout page for the given order and returns its
 * URL. Order-based (not quick_pay), so Square can carry a tax line.
 */
export async function createPaymentLink(
  config: SquareConfig,
  input: OrderInput
): Promise<{ id: string; url: string; orderId: string }> {
  const json = await squareRequest<{
    payment_link?: { id?: string; url?: string; order_id?: string };
  }>(config, "/v2/online-checkout/payment-links", {
    method: "POST",
    body: {
      idempotency_key: input.idempotencyKey,
      order: buildSquareOrder(config, input),
      checkout_options: {
        redirect_url: input.redirectUrl,
        // Physical goods make Square collect a real ship-to. Downloads do not.
        ask_for_shipping_address: input.lines.some((l) => l.category === "physical_good"),
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

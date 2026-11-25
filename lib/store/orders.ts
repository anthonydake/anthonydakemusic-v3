import { sql } from "@vercel/postgres";
import { TAX, type TaxCategory } from "./tax";

export const DOWNLOAD_WINDOW_DAYS = 30;
export const DOWNLOAD_LIMIT = 10;

export type OrderStatus = "pending" | "paid" | "refunded";

export type StoreOrder = {
  id: string;
  product_id: string;
  amount_cents: number;
  currency: string;
  /** "sandbox" or "production" — both write to the same table, so every row says which. */
  environment: string;
  status: OrderStatus;
  square_order_id: string | null;
  square_payment_link_id: string | null;
  square_payment_id: string | null;
  buyer_email: string | null;
  download_token: string;
  download_count: number;
  email_sent_at: Date | null;
  paid_at: Date | null;
  refunded_at: Date | null;
  created_at: Date;
  // ---- Sales-tax columns (added 2026-11-25; see lib/store/tax.ts) --------
  /** The buyer's stated state (US two-letter), e.g. "OH". Null for orders written before this column existed. */
  buyer_state: string | null;
  /** The item's tax category at the time of purchase, snapshotted on the order. */
  tax_category: TaxCategory | null;
  /** Of amount_cents + shipping, how much was in a taxable line. */
  taxable_amount_cents: number;
  /** Of amount_cents + shipping, how much was NOT in a taxable line (services, out-of-state, etc). */
  non_taxable_amount_cents: number;
  /** Shipping charge in cents, 0 for downloads. */
  shipping_cents: number;
  /** Tax charged in cents. 0 outside the taxing state. */
  tax_cents: number;
  /** The rate used, e.g. 0.08. 0 outside the taxing state. */
  tax_rate: number;
  /** Where the order was received, for Ohio's sourcing rule — "Franklin, OH" by default. */
  received_in_county: string | null;
  /**
   * A buyer who said one state but whose Square shipping address later showed
   * another gets this flag on the order, and the sale notice mentions it.
   * Anthony reviews; the agent never auto-corrects.
   */
  buyer_state_mismatch: boolean;
};

// Same convention as the bookings table: created idempotently, no migrations.
// Memoized per warm instance so a request only pays for it once.
let schemaReady: Promise<void> | null = null;

export function ensureStoreSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS store_orders (
          id UUID PRIMARY KEY,
          product_id TEXT NOT NULL,
          amount_cents INTEGER NOT NULL,
          currency TEXT NOT NULL DEFAULT 'USD',
          environment TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'pending',
          square_order_id TEXT,
          square_payment_link_id TEXT,
          square_payment_id TEXT,
          buyer_email TEXT,
          download_token TEXT NOT NULL,
          download_count INTEGER NOT NULL DEFAULT 0,
          email_sent_at TIMESTAMPTZ,
          paid_at TIMESTAMPTZ,
          refunded_at TIMESTAMPTZ,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `;
      // Idempotent additive migration for sales-tax columns (added 2026-11-25).
      await sql`ALTER TABLE store_orders ADD COLUMN IF NOT EXISTS buyer_state TEXT;`;
      await sql`ALTER TABLE store_orders ADD COLUMN IF NOT EXISTS tax_category TEXT;`;
      await sql`ALTER TABLE store_orders ADD COLUMN IF NOT EXISTS taxable_amount_cents INTEGER NOT NULL DEFAULT 0;`;
      await sql`ALTER TABLE store_orders ADD COLUMN IF NOT EXISTS non_taxable_amount_cents INTEGER NOT NULL DEFAULT 0;`;
      await sql`ALTER TABLE store_orders ADD COLUMN IF NOT EXISTS shipping_cents INTEGER NOT NULL DEFAULT 0;`;
      await sql`ALTER TABLE store_orders ADD COLUMN IF NOT EXISTS tax_cents INTEGER NOT NULL DEFAULT 0;`;
      // numeric(6,5) holds 0.08000 and any plausible US combined rate.
      await sql`ALTER TABLE store_orders ADD COLUMN IF NOT EXISTS tax_rate NUMERIC(6,5) NOT NULL DEFAULT 0;`;
      await sql`ALTER TABLE store_orders ADD COLUMN IF NOT EXISTS received_in_county TEXT;`;
      await sql`ALTER TABLE store_orders ADD COLUMN IF NOT EXISTS buyer_state_mismatch BOOLEAN NOT NULL DEFAULT FALSE;`;
      await sql`CREATE UNIQUE INDEX IF NOT EXISTS store_orders_square_order_id_key ON store_orders (square_order_id);`;
      await sql`CREATE UNIQUE INDEX IF NOT EXISTS store_orders_download_token_key ON store_orders (download_token);`;
    })().catch((err) => {
      schemaReady = null;
      throw err;
    });
  }
  return schemaReady;
}

export async function createOrder(input: {
  id: string;
  productId: string;
  /** The total the buyer will be charged, in cents (subtotal + shipping + tax). */
  amountCents: number;
  currency: string;
  environment: string;
  squareOrderId: string;
  squarePaymentLinkId: string;
  downloadToken: string;
  /** US two-letter postal code the buyer stated at checkout, e.g. "OH". */
  buyerState: string | null;
  /** The product's tax category at the time of purchase. */
  taxCategory: TaxCategory;
  taxableAmountCents: number;
  nonTaxableAmountCents: number;
  shippingCents: number;
  taxCents: number;
  /** The rate used (0.08 or 0). */
  taxRate: number;
}): Promise<void> {
  // Ohio sourcing rule: an in-state seller's orders are sourced to where the
  // order is received. The store always "receives" at Anthony's place, so the
  // county/state are constants from the tax config.
  const county = `${TAX.sourcedToCounty}, ${TAX.sourcedToState}`;
  await sql`
    INSERT INTO store_orders (
      id, product_id, amount_cents, currency, environment,
      square_order_id, square_payment_link_id, download_token,
      buyer_state, tax_category,
      taxable_amount_cents, non_taxable_amount_cents,
      shipping_cents, tax_cents, tax_rate,
      received_in_county
    ) VALUES (
      ${input.id}, ${input.productId}, ${input.amountCents}, ${input.currency}, ${input.environment},
      ${input.squareOrderId}, ${input.squarePaymentLinkId}, ${input.downloadToken},
      ${input.buyerState}, ${input.taxCategory},
      ${input.taxableAmountCents}, ${input.nonTaxableAmountCents},
      ${input.shippingCents}, ${input.taxCents}, ${input.taxRate},
      ${county}
    );
  `;
}

/**
 * Called after Square reports a payment that includes a shipping address.
 * If the buyer's stated state differs from the shipping address's state, we
 * flag the order (and the sale notice surfaces it). We never auto-correct.
 */
export async function flagBuyerStateMismatch(id: string): Promise<void> {
  await sql`UPDATE store_orders SET buyer_state_mismatch = TRUE WHERE id = ${id};`;
}

export async function getOrderById(id: string): Promise<StoreOrder | null> {
  const { rows } = await sql<StoreOrder>`SELECT * FROM store_orders WHERE id = ${id} LIMIT 1;`;
  return rows[0] ?? null;
}

export async function getOrderBySquareOrderId(
  squareOrderId: string
): Promise<StoreOrder | null> {
  const { rows } = await sql<StoreOrder>`
    SELECT * FROM store_orders WHERE square_order_id = ${squareOrderId} LIMIT 1;
  `;
  return rows[0] ?? null;
}

export async function getOrderByToken(token: string): Promise<StoreOrder | null> {
  const { rows } = await sql<StoreOrder>`
    SELECT * FROM store_orders WHERE download_token = ${token} LIMIT 1;
  `;
  return rows[0] ?? null;
}

/**
 * pending → paid, exactly once. Returns the row only for the call that made
 * the change; a duplicate webhook (Square sends several per payment) gets null.
 */
export async function markOrderPaid(input: {
  squareOrderId: string;
  paymentId: string;
  buyerEmail: string | null;
}): Promise<StoreOrder | null> {
  const { rows } = await sql<StoreOrder>`
    UPDATE store_orders
    SET status = 'paid',
        paid_at = NOW(),
        square_payment_id = ${input.paymentId},
        buyer_email = COALESCE(${input.buyerEmail}, buyer_email)
    WHERE square_order_id = ${input.squareOrderId} AND status = 'pending'
    RETURNING *;
  `;
  return rows[0] ?? null;
}

export async function attachBuyerEmail(id: string, email: string): Promise<void> {
  await sql`UPDATE store_orders SET buyer_email = ${email} WHERE id = ${id} AND buyer_email IS NULL;`;
}

/**
 * Claims the receipt email so two overlapping webhooks can't both send it.
 * A live order needs a buyer email to claim. A sandbox order does not: its
 * receipt goes to the store's own inbox (see receiptRecipient in fulfill.ts).
 */
export async function claimDeliveryEmail(id: string): Promise<StoreOrder | null> {
  const { rows } = await sql<StoreOrder>`
    UPDATE store_orders
    SET email_sent_at = NOW()
    WHERE id = ${id}
      AND status = 'paid'
      AND email_sent_at IS NULL
      AND (buyer_email IS NOT NULL OR environment <> 'production')
    RETURNING *;
  `;
  return rows[0] ?? null;
}

/** Undo a claim when the send failed, so a later event can retry. */
export async function releaseDeliveryEmail(id: string): Promise<void> {
  await sql`UPDATE store_orders SET email_sent_at = NULL WHERE id = ${id};`;
}

export async function markRefundedByPaymentId(
  paymentId: string
): Promise<StoreOrder | null> {
  const { rows } = await sql<StoreOrder>`
    UPDATE store_orders
    SET status = 'refunded', refunded_at = NOW()
    WHERE square_payment_id = ${paymentId} AND status = 'paid'
    RETURNING *;
  `;
  return rows[0] ?? null;
}

/**
 * Counts one download, but only for a paid order inside its window and under
 * its limit. Returns null when the download is not allowed.
 */
export async function recordDownload(token: string): Promise<StoreOrder | null> {
  const { rows } = await sql<StoreOrder>`
    UPDATE store_orders
    SET download_count = download_count + 1
    WHERE download_token = ${token}
      AND status = 'paid'
      AND download_count < ${DOWNLOAD_LIMIT}::int
      AND paid_at > NOW() - make_interval(days => ${DOWNLOAD_WINDOW_DAYS}::int)
    RETURNING *;
  `;
  return rows[0] ?? null;
}

export function downloadIsOpen(order: StoreOrder): boolean {
  if (order.status !== "paid" || !order.paid_at) return false;
  const ageMs = Date.now() - new Date(order.paid_at).getTime();
  return (
    order.download_count < DOWNLOAD_LIMIT &&
    ageMs < DOWNLOAD_WINDOW_DAYS * 24 * 60 * 60 * 1000
  );
}

export type OrderPageState = "ready" | "pending" | "stalled" | "refunded" | "expired";

/** How many times the order page re-checks an unconfirmed payment on its own. */
export const MAX_AUTO_CHECKS = 12;

/** What /products/thanks/[order] shows for an order, given how often it has re-checked. */
export function orderPageState(order: StoreOrder, checks: number): OrderPageState {
  if (order.status === "refunded") return "refunded";
  if (order.status === "paid") return downloadIsOpen(order) ? "ready" : "expired";
  return checks >= MAX_AUTO_CHECKS ? "stalled" : "pending";
}

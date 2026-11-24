import { sql } from "@vercel/postgres";

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
  amountCents: number;
  currency: string;
  environment: string;
  squareOrderId: string;
  squarePaymentLinkId: string;
  downloadToken: string;
}): Promise<void> {
  await sql`
    INSERT INTO store_orders (
      id, product_id, amount_cents, currency, environment,
      square_order_id, square_payment_link_id, download_token
    ) VALUES (
      ${input.id}, ${input.productId}, ${input.amountCents}, ${input.currency}, ${input.environment},
      ${input.squareOrderId}, ${input.squarePaymentLinkId}, ${input.downloadToken}
    );
  `;
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

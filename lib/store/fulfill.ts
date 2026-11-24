import { getProduct } from "./catalog";
import { getSquareConfig, receiptAssetBase } from "./config";
import { sendReceiptEmail, sendSaleNotice, storeInbox } from "./email";
import {
  attachBuyerEmail,
  claimDeliveryEmail,
  DOWNLOAD_WINDOW_DAYS,
  getOrderById,
  getOrderBySquareOrderId,
  markOrderPaid,
  releaseDeliveryEmail,
  type StoreOrder,
} from "./orders";
import { describePaidWith, getPayment, retrieveOrder, type SquarePayment } from "./square";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type SettleResult = "paid" | "already-paid" | "ignored" | "mismatch";

function describeError(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

/**
 * Who gets the receipt. Normally the buyer. Square's sandbox test payment has
 * no buyer at all, so in sandbox only the receipt goes to the store's own
 * inbox — otherwise a test order could never show what a buyer receives.
 */
function receiptRecipient(order: StoreOrder): string | null {
  if (order.buyer_email) return order.buyer_email;
  return order.environment !== "production" ? storeInbox() : null;
}

async function deliverByEmail(
  order: StoreOrder,
  origin: string,
  payment: SquarePayment
): Promise<void> {
  if (order.status !== "paid" || order.email_sent_at || !receiptRecipient(order)) return;
  const claimed = await claimDeliveryEmail(order.id);
  if (!claimed) return; // another event is already sending it
  const to = receiptRecipient(claimed);
  if (!to) {
    await releaseDeliveryEmail(claimed.id);
    return;
  }

  const ok = await sendReceiptEmail({
    to,
    productTitle: getProduct(claimed.product_id)?.title ?? "Your download",
    pageUrl: `${origin}/store/thanks/${claimed.id}`,
    itemCents: claimed.amount_cents,
    paidCents: payment.amount_money?.amount ?? claimed.amount_cents,
    currency: claimed.currency,
    paidAt: claimed.paid_at ? new Date(claimed.paid_at) : new Date(),
    downloadDays: DOWNLOAD_WINDOW_DAYS,
    receiptNumber: payment.receipt_number?.trim() || null,
    paidWith: describePaidWith(payment),
    test: claimed.environment !== "production",
    assetBase: receiptAssetBase(),
  });
  if (!ok) await releaseDeliveryEmail(claimed.id);
}

/**
 * The one place an order becomes paid. Called from the webhook and from the
 * thank-you page's direct check with Square, so it has to be safe to run many
 * times for the same payment.
 */
export async function settlePayment(
  payment: SquarePayment,
  origin: string
): Promise<SettleResult> {
  if (payment.status !== "COMPLETED" || !payment.id || !payment.order_id) {
    return "ignored";
  }

  // The Square account also takes payments that have nothing to do with the
  // store (invoices, in-person sales). Those have no row here — skip them.
  let order = await getOrderBySquareOrderId(payment.order_id);
  if (!order || order.status === "refunded") return "ignored";

  const amount = payment.amount_money?.amount ?? 0;
  const currency = payment.amount_money?.currency ?? "";
  if (amount < order.amount_cents || currency !== order.currency) {
    console.error(
      `[store] payment ${payment.id} does not match order ${order.id}: ` +
        `got ${amount} ${currency}, expected ${order.amount_cents} ${order.currency}`
    );
    return "mismatch";
  }

  const rawEmail = payment.buyer_email_address?.trim().toLowerCase() ?? "";
  const buyerEmail = EMAIL_REGEX.test(rawEmail) ? rawEmail : null;

  let result: SettleResult = "already-paid";
  if (order.status === "pending") {
    const updated = await markOrderPaid({
      squareOrderId: payment.order_id,
      paymentId: payment.id,
      buyerEmail,
    });
    if (updated) {
      order = updated;
      result = "paid";
      await sendSaleNotice({
        productTitle: getProduct(order.product_id)?.title ?? order.product_id,
        amountCents: order.amount_cents,
        buyerEmail: order.buyer_email,
        orderId: order.id,
        test: order.environment !== "production",
      });
    } else {
      // Lost a race with another event for the same payment.
      order = (await getOrderById(order.id)) ?? order;
    }
  }

  if (!order.buyer_email && buyerEmail) {
    await attachBuyerEmail(order.id, buyerEmail);
    order = { ...order, buyer_email: buyerEmail };
  }

  await deliverByEmail(order, origin, payment);
  return result;
}

/**
 * Asks Square directly whether a pending order has been paid. The buyer is
 * usually redirected back before the webhook arrives, and this also keeps
 * delivery working if the webhook is ever misconfigured.
 */
export async function confirmWithSquare(
  order: StoreOrder,
  origin: string
): Promise<StoreOrder> {
  const config = getSquareConfig();
  if (
    !config ||
    order.status !== "pending" ||
    !order.square_order_id ||
    order.environment !== config.environment
  ) {
    return order;
  }

  try {
    const squareOrder = await retrieveOrder(config, order.square_order_id);
    for (const tender of squareOrder?.tenders ?? []) {
      const paymentId = tender.payment_id ?? tender.id;
      if (!paymentId) continue;
      const payment = await getPayment(config, paymentId);
      if (!payment) continue;
      const result = await settlePayment(payment, origin);
      if (result === "paid" || result === "already-paid") break;
    }
  } catch (err) {
    console.error("[store] Square confirmation failed:", describeError(err));
  }

  return (await getOrderById(order.id)) ?? order;
}

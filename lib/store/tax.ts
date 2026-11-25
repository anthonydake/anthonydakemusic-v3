// Sales tax for the store, in one place.
//
// Rules Anthony is operating under (researched 25 Nov 2026; source notes
// below; general information, not tax advice):
// - Ohio taxes digital downloads of audio, video and e-books.
// - Ohio taxes physical goods and the shipping charge on them.
// - Ohio does NOT tax services (session work, gigs, mixing, mastering,
//   production and its deposits, lessons).
// - Anthony is a Franklin County (Ohio) seller and is not registered in any
//   other state. Ohio sources an in-state seller's orders to where the order
//   is received (the seller's place), so every Ohio buyer is charged
//   Franklin County's combined 8.0% rate. If an accountant later tells
//   Anthony the right answer is each buyer's county rate, taxRateFor() is
//   the only function to change.
//
// Sources (names only — do not hardcode URLs that could rot): Ohio Rev. Code
// § 5739.01 and § 5739.033; Ohio Department of Taxation sales tax notices;
// Franklin County rate confirmed 1 April 2025 combined rate schedule.
// Last reviewed: 2026-11-25.
//
// Every tax decision in the store calls one of the functions here. No rate,
// no state, and no category logic anywhere else. If this file disagrees with
// something written in another store file, this file wins.

/** The one place the rate, the state and the name are written. */
export const TAX = {
  /** The one state Anthony is registered to collect in. */
  state: "OH" as const,
  /** Franklin County, Ohio combined rate (as of 1 April 2025). */
  rate: 0.08,
  /** What a buyer sees on the cart, the receipt and the sale notice. */
  displayName: "Ohio sales tax",
  /** Where the seller receives the order (Ohio's sourcing rule leans on this). */
  sourcedToCounty: "Franklin",
  sourcedToState: "OH" as const,
  /** When the rate was last confirmed. If this file grows stale, change the rate here first. */
  lastReviewed: "2026-11-25",
};

/**
 * Every sellable item carries exactly one of these. There is no default —
 * a product without a category must fail the build (see data/store.data.ts).
 *
 * - digital_good — taxable. Downloads of audio, video, or e-books
 *   (songs, stems, sample packs, drum loops).
 * - physical_good — taxable, and makes its shipping charge taxable too
 *   (shirts, vinyl, CDs).
 * - service — not taxable (session drumming, gigs, mixing, mastering,
 *   production, production deposits, lessons).
 */
export type TaxCategory = "digital_good" | "physical_good" | "service";

export const TAX_CATEGORIES: readonly TaxCategory[] = [
  "digital_good",
  "physical_good",
  "service",
] as const;

export function isTaxCategory(value: unknown): value is TaxCategory {
  return (
    typeof value === "string" &&
    (TAX_CATEGORIES as readonly string[]).includes(value)
  );
}

/**
 * The 50 US states + DC. The cart's state selector uses this; the checkout
 * route uses it to validate that a submitted state code is real. Kept here
 * (not in site/content.mjs) so server validation never depends on the UI.
 */
export const US_STATE_CODES: ReadonlySet<string> = new Set([
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "DC", "FL",
  "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME",
  "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH",
  "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI",
  "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY",
]);

/**
 * True for a real US state code, the "OH" taxing state, or the catch-all
 * "XX" the cart uses for "Outside the United States". Everything else is
 * refused by the checkout.
 */
export function isAcceptedBuyerState(value: string): boolean {
  return value === "XX" || US_STATE_CODES.has(value);
}

/** Taxable in Ohio: digital goods and physical goods. Services are not. */
export function categoryIsTaxable(category: TaxCategory): boolean {
  return category === "digital_good" || category === "physical_good";
}

/**
 * The rate to charge a buyer in a given state. 0 for anywhere Anthony is not
 * registered — today that means every state except Ohio.
 *
 * Accepts the US two-letter postal code (case-insensitive) or an empty string
 * (treated as "not Ohio"). An out-of-US buyer is "not Ohio" too.
 */
export function taxRateFor(buyerState: string | null | undefined): number {
  const normalised = (buyerState ?? "").trim().toUpperCase();
  return normalised === TAX.state ? TAX.rate : 0;
}

/**
 * Shipping (the charge, not the goods) is taxable only when the order
 * contains at least one physical good AND the buyer is in a taxing state.
 * Shipping on a download-only order is never taxable, nor is shipping when
 * the buyer is outside Ohio.
 */
export function shippingIsTaxable(
  buyerState: string | null | undefined,
  lineCategories: readonly TaxCategory[]
): boolean {
  if (taxRateFor(buyerState) === 0) return false;
  return lineCategories.some((c) => c === "physical_good");
}

export type TaxLine = {
  /** The item's id. */
  productId: string;
  /** Unit price in cents. */
  priceCents: number;
  /** Count of the item (one for now; the field exists so quantities can be added without a rewrite). */
  quantity: number;
  /** Taxable under the category rule. */
  category: TaxCategory;
};

export type TaxBreakdown = {
  /** Cents before tax (sum of every line's price × quantity). */
  subtotalCents: number;
  /** Cents of shipping before tax. */
  shippingCents: number;
  /** Sum of the taxable lines' cents (only). */
  taxableAmountCents: number;
  /** Sum of the non-taxable lines' cents (services, and shipping when non-taxable). */
  nonTaxableAmountCents: number;
  /** The tax charged, in cents. */
  taxCents: number;
  /** subtotal + shipping + tax. */
  totalCents: number;
  /** The rate used (0 when the buyer is outside the taxing state). */
  rate: number;
};

/**
 * Compute the tax breakdown for a cart. Rounds every tax amount to whole
 * cents (half-away-from-zero), the same way Square rounds its own LINE_ITEM
 * percentage taxes. The cart's displayed total must match Square's.
 */
export function computeTax(input: {
  lines: readonly TaxLine[];
  shippingCents?: number;
  buyerState: string | null | undefined;
}): TaxBreakdown {
  const rate = taxRateFor(input.buyerState);
  const shippingCents = Math.max(0, Math.round(input.shippingCents ?? 0));

  let subtotalCents = 0;
  let taxableAmountCents = 0;
  let nonTaxableAmountCents = 0;
  let taxCents = 0;

  for (const line of input.lines) {
    const qty = Math.max(1, Math.round(line.quantity));
    const lineCents = Math.max(0, Math.round(line.priceCents)) * qty;
    subtotalCents += lineCents;

    if (rate > 0 && categoryIsTaxable(line.category)) {
      taxableAmountCents += lineCents;
      taxCents += roundHalfAwayFromZero(lineCents * rate);
    } else {
      nonTaxableAmountCents += lineCents;
    }
  }

  const categories = input.lines.map((l) => l.category);
  if (shippingIsTaxable(input.buyerState, categories)) {
    taxableAmountCents += shippingCents;
    taxCents += roundHalfAwayFromZero(shippingCents * rate);
  } else {
    nonTaxableAmountCents += shippingCents;
  }

  const totalCents = subtotalCents + shippingCents + taxCents;
  return {
    subtotalCents,
    shippingCents,
    taxableAmountCents,
    nonTaxableAmountCents,
    taxCents,
    totalCents,
    rate,
  };
}

function roundHalfAwayFromZero(value: number): number {
  return value >= 0 ? Math.floor(value + 0.5) : -Math.floor(-value + 0.5);
}

/** For UI: "8%" (as a string, no trailing zeros). */
export function formatRatePercent(rate: number): string {
  const percent = rate * 100;
  return Number.isInteger(percent) ? `${percent}%` : `${percent.toFixed(2).replace(/\.?0+$/, "")}%`;
}

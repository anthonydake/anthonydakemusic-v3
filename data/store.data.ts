// Store catalog — public product info only. Everything in this file can end
// up in the browser (and this repository is public), so where a product's
// file lives is never written here. See lib/store/files.ts.
//
// EVERY ITEM NEEDS A TAX CATEGORY. See the "Sales tax" section of CLAUDE.md:
// - digital_good  — downloads of audio, video, or e-books (taxed in OH)
// - physical_good — anything shipped (taxed in OH; shipping charge too)
// - service       — session work, gigs, mixing, mastering, production and its
//                   deposits, lessons (not taxed in OH)
// If an item does not fit one of those cleanly (presets, software,
// subscriptions, gift cards, bundles that mix categories), STOP AND ASK
// ANTHONY. Do not guess, because Ohio's treatment of those is not settled
// for this store.
import { isTaxCategory, type TaxCategory } from "@/lib/store/tax";

export type StoreProduct = {
  /** URL-safe slug. Also stored on every order, so never rename one that has sold. */
  id: string;
  title: string;
  blurb: string;
  /** Price in USD cents. */
  priceCents: number;
  /** Required. See the comment at the top of this file. */
  taxCategory: TaxCategory;
  /** File name the buyer's download is saved as, e.g. "groove-pack-1.zip". */
  downloadName?: string;
  /** Placeholder products are listed and sellable only while Square runs in sandbox. */
  placeholder?: boolean;
};

// Order in the array = display order on /products.
export const STORE_PRODUCTS: StoreProduct[] = [
  {
    id: "test-download",
    title: "Test download",
    blurb: "A placeholder for checking the checkout flow. Sandbox only. It is never listed in live mode.",
    priceCents: 100,
    taxCategory: "digital_good",
    placeholder: true,
  },
];

// Build-time guard: every product MUST have a valid tax category. A missing
// or wrong value fails the module load — the Next build, the self-test and
// the dev server all import this file at startup, so a bad catalog never
// ships. See the top-of-file comment and the "Sales tax" section of
// CLAUDE.md for how to pick a category.
for (const p of STORE_PRODUCTS) {
  if (!isTaxCategory(p.taxCategory)) {
    throw new Error(
      `data/store.data.ts: product "${p.id}" has no valid taxCategory ` +
        `(found ${JSON.stringify(p.taxCategory)}). ` +
        `See the top of this file and the "Sales tax" section of CLAUDE.md.`
    );
  }
}

export function formatPrice(cents: number): string {
  const dollars = cents / 100;
  return Number.isInteger(dollars) ? `$${dollars}` : `$${dollars.toFixed(2)}`;
}

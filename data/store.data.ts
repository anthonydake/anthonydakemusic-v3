// Store catalog — public product info only. Everything in this file can end
// up in the browser (and this repository is public), so where a product's
// file lives is never written here. See lib/store/files.ts.
export type StoreProduct = {
  /** URL-safe slug. Also stored on every order, so never rename one that has sold. */
  id: string;
  title: string;
  blurb: string;
  /** Price in USD cents. */
  priceCents: number;
  /** File name the buyer's download is saved as, e.g. "groove-pack-1.zip". */
  downloadName?: string;
  /** Placeholder products are listed and sellable only while Square runs in sandbox. */
  placeholder?: boolean;
};

// Order in the array = display order on /store.
export const STORE_PRODUCTS: StoreProduct[] = [
  {
    id: "test-download",
    title: "Test download",
    blurb: "A placeholder for checking the checkout flow. Sandbox only — it is never listed in live mode.",
    priceCents: 100,
    placeholder: true,
  },
];

export function formatPrice(cents: number): string {
  const dollars = cents / 100;
  return Number.isInteger(dollars) ? `$${dollars}` : `$${dollars.toFixed(2)}`;
}

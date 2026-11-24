export type SquareEnvironment = "sandbox" | "production";

export type SquareConfig = {
  environment: SquareEnvironment;
  accessToken: string;
  locationId: string;
  apiBase: string;
};

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.anthonydakemusic.com";
export const SUPPORT_EMAIL = "adakemusic@gmail.com";

// Sandbox unless SQUARE_ENVIRONMENT is exactly "production" — a missing or
// mistyped value can never point test code at real money.
export function squareEnvironment(): SquareEnvironment {
  return process.env.SQUARE_ENVIRONMENT?.trim() === "production"
    ? "production"
    : "sandbox";
}

/** Null until the Square keys are set — the whole store stays hidden (404) in that case. */
export function getSquareConfig(): SquareConfig | null {
  const accessToken = process.env.SQUARE_ACCESS_TOKEN?.trim();
  const locationId = process.env.SQUARE_LOCATION_ID?.trim();
  if (!accessToken || !locationId) return null;

  const environment = squareEnvironment();
  let apiBase =
    environment === "production"
      ? "https://connect.squareup.com"
      : "https://connect.squareupsandbox.com";

  // Self-test only (scripts/store-selftest.mjs points this at a local mock).
  // Never honored in a production build.
  const override = process.env.SQUARE_API_BASE?.trim();
  if (override && process.env.NODE_ENV !== "production") {
    apiBase = override.replace(/\/+$/, "");
  }

  return { environment, accessToken, locationId, apiBase };
}

/**
 * Where the receipt email's five images are served from. A mail app only
 * shows an image that sits at a public https address.
 * - Live: the site's own /email/ folder (public/email/ in this repo).
 * - A Vercel preview sits behind a login, so nothing on it is public. The
 *   repo is public, though, so a preview reads the same files straight from
 *   GitHub at the exact commit it was built from. That is what lets a receipt
 *   be tested from a branch before the images are on the live site. If the
 *   repo is ever made private, preview receipts lose their images.
 */
export function receiptAssetBase(): string {
  if (process.env.VERCEL_ENV === "preview") {
    const owner = process.env.VERCEL_GIT_REPO_OWNER?.trim() ?? "";
    const repo = process.env.VERCEL_GIT_REPO_SLUG?.trim() ?? "";
    const sha = process.env.VERCEL_GIT_COMMIT_SHA?.trim() ?? "";
    const name = /^[\w.-]+$/;
    if (name.test(owner) && name.test(repo) && /^[0-9a-f]{40}$/.test(sha)) {
      return `https://raw.githubusercontent.com/${owner}/${repo}/${sha}/public/email`;
    }
  }
  return "https://www.anthonydakemusic.com/email";
}

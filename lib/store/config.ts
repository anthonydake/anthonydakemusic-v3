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

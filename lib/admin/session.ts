import crypto from "crypto";

// The pass /admin/bookings carries after the password has been given.
//
// It is a cookie holding an expiry time and a signature of that time made
// with the admin password (ARCHIVE_ADMIN_PASSWORD), so it cannot be made up
// by hand: before 24 Nov 2026 the cookie was the fixed value "1", and anyone
// who set it themselves could read the bookings list.
export const ADMIN_COOKIE = "archive_admin";
export const ADMIN_MINUTES = 10;

function sign(secret: string, expires: number): string {
  return crypto.createHmac("sha256", secret).update(`archive-admin:${expires}`).digest("hex");
}

/** A fresh pass, or null when no admin password is set (then nobody gets in). */
export function issueAdminPass(now = Date.now()): string | null {
  const secret = process.env.ARCHIVE_ADMIN_PASSWORD ?? "";
  if (!secret) return null;
  const expires = now + ADMIN_MINUTES * 60 * 1000;
  return `${expires}.${sign(secret, expires)}`;
}

export function adminPassIsValid(value: string | undefined, now = Date.now()): boolean {
  const secret = process.env.ARCHIVE_ADMIN_PASSWORD ?? "";
  if (!secret || !value) return false;
  const match = /^(\d{13})\.([0-9a-f]{64})$/.exec(value);
  if (!match) return false;
  const expires = Number(match[1]);
  if (!Number.isFinite(expires) || expires <= now) return false;
  const given = Buffer.from(match[2], "hex");
  const wanted = Buffer.from(sign(secret, expires), "hex");
  return given.length === wanted.length && crypto.timingSafeEqual(given, wanted);
}

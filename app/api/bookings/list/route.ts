import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";
import { ADMIN_COOKIE, adminPassIsValid } from "@/lib/admin/session";

export const dynamic = "force-dynamic";

function cookie(request: Request, name: string): string | undefined {
  for (const part of (request.headers.get("cookie") ?? "").split(";")) {
    const at = part.indexOf("=");
    if (at > 0 && part.slice(0, at).trim() === name) return decodeURIComponent(part.slice(at + 1).trim());
  }
  return undefined;
}

export async function GET(request: Request) {
  // The cookie must be a pass this site signed and that has not run out:
  // its mere presence proves nothing (see lib/admin/session.ts).
  if (!adminPassIsValid(cookie(request, ADMIN_COOKIE))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: { "Cache-Control": "private, no-store" } });
  }

  await sql`
    CREATE TABLE IF NOT EXISTS bookings (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      service TEXT,
      description TEXT,
      timeline TEXT,
      music_link TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;
  await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS event_date DATE;`;
  await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS event_type TEXT;`;
  await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS message TEXT;`;
  await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS music_link TEXT;`;

  const { rows } = await sql`
    SELECT id, name, email, event_type, event_date, message, music_link, created_at
    FROM bookings
    ORDER BY created_at DESC;
  `;

  return NextResponse.json({ bookings: rows }, { headers: { "Cache-Control": "private, no-store" } });
}

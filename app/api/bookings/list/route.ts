import { sql } from "@vercel/postgres";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const cookieStore = await cookies();
  const adminCookie = cookieStore.get("archive_admin")?.value;
  if (!adminCookie) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

  const { rows } = await sql`
    SELECT id, name, email, event_type, event_date, message, created_at
    FROM bookings
    ORDER BY created_at DESC;
  `;

  return NextResponse.json({ bookings: rows });
}

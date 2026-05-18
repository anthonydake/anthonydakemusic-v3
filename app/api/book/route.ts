import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const name = typeof body?.name === "string" ? body.name.trim() : "";
    const email =
      typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const eventType =
      typeof body?.eventType === "string" ? body.eventType.trim() : "";
    const message =
      typeof body?.message === "string" ? body.message.trim() : "";

    const rawDate =
      typeof body?.eventDate === "string" ? body.eventDate.trim() : "";
    const eventDate = rawDate && ISO_DATE_REGEX.test(rawDate) ? rawDate : null;

    if (!name) {
      return NextResponse.json({ error: "Name is required." }, { status: 400 });
    }
    if (!email || !EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { error: "Valid email is required." },
        { status: 400 }
      );
    }
    if (!eventType) {
      return NextResponse.json(
        { error: "Event type is required." },
        { status: 400 }
      );
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

    // Spec-aligned columns; added idempotently so existing rows aren't disturbed.
    await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS event_date DATE;`;
    await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS event_type TEXT;`;
    await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS message TEXT;`;

    await sql`
      INSERT INTO bookings (name, email, event_date, event_type, message)
      VALUES (${name}, ${email}, ${eventDate}, ${eventType}, ${message});
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS archive_emails (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `;

    await sql`
      INSERT INTO archive_emails (email)
      VALUES (${email})
      ON CONFLICT (email) DO NOTHING;
    `;

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}

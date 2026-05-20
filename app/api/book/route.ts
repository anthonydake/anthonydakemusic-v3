import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.anthonydakemusic.com";
const SITE_HOST = new URL(SITE_URL).host;

async function notifyBooking(payload: {
  name: string;
  email: string;
  eventType: string;
  eventDate: string | null;
  message: string;
}) {
  const to = process.env.BOOKING_NOTIFY_EMAIL || "adakemusic@gmail.com";
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.BOOKING_NOTIFY_FROM || "noreply@anthonydakemusic.com";

  const subject = `New booking inquiry — ${payload.eventType} (${payload.name})`;
  const text =
    `Name: ${payload.name}\n` +
    `Email: ${payload.email}\n` +
    `Event Type: ${payload.eventType}\n` +
    `Event Date: ${payload.eventDate ?? "—"}\n\n` +
    `Message:\n${payload.message || "(none)"}\n`;

  if (!apiKey) {
    console.warn("[booking] RESEND_API_KEY not set — inquiry stored in DB only");
    console.warn(text);
    return;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ from, to, subject, text, reply_to: payload.email }),
    });
    if (!res.ok) {
      console.error("[booking] Resend send failed:", res.status, await res.text());
    }
  } catch (err) {
    console.error("[booking] Resend send threw:", err);
  }
}

export async function POST(request: Request) {
  try {
    // Origin check — block off-site POSTs (curl/scrapers without correct Origin).
    const origin = request.headers.get("origin");
    if (origin) {
      try {
        if (new URL(origin).host !== SITE_HOST) {
          return NextResponse.json({ error: "Forbidden." }, { status: 403 });
        }
      } catch {
        return NextResponse.json({ error: "Forbidden." }, { status: 403 });
      }
    }

    const body = await request.json();

    // Honeypot — hidden field that real users never fill. Bots auto-fill all fields.
    if (typeof body?.website === "string" && body.website.trim() !== "") {
      // Pretend to succeed so the bot moves on without retry.
      return NextResponse.json({ ok: true });
    }

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

    // Fire-and-forget notify — never blocks the user's response.
    notifyBooking({ name, email, eventType, eventDate, message }).catch(() => {});

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}

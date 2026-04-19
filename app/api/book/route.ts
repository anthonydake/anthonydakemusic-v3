import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const name = typeof body?.name === "string" ? body.name.trim() : "";
    const email =
      typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const service = typeof body?.service === "string" ? body.service.trim() : "";
    const description =
      typeof body?.description === "string" ? body.description.trim() : "";
    const timeline =
      typeof body?.timeline === "string" ? body.timeline.trim() : "";
    const musicLink =
      typeof body?.musicLink === "string" ? body.musicLink.trim() : "";

    if (!name) {
      return NextResponse.json({ error: "Name is required." }, { status: 400 });
    }
    if (!email || !EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { error: "Valid email is required." },
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

    await sql`
      INSERT INTO bookings (name, email, service, description, timeline, music_link)
      VALUES (${name}, ${email}, ${service}, ${description}, ${timeline}, ${musicLink});
    `;

    // Also add to the archive email list so they get updates
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

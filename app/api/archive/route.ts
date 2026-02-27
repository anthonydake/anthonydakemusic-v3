import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";

    if (!email || !EMAIL_REGEX.test(email)) {
      return NextResponse.json({ error: "Invalid email." }, { status: 400 });
    }

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
  } catch (error) {
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}

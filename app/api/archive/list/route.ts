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
    CREATE TABLE IF NOT EXISTS archive_emails (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  const { rows } = await sql`
    SELECT email, created_at
    FROM archive_emails
    ORDER BY created_at DESC;
  `;

  return NextResponse.json({ emails: rows });
}

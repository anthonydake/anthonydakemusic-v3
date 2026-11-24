import crypto from "crypto";
import { NextResponse } from "next/server";
import { ADMIN_COOKIE, ADMIN_MINUTES, issueAdminPass } from "@/lib/admin/session";

const PASSWORD_ENV = "ARCHIVE_ADMIN_PASSWORD";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const password = typeof body?.password === "string" ? body.password : "";
    const secret = process.env[PASSWORD_ENV] ?? "";

    if (!password || !secret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const hash = (value: string) => crypto.createHash("sha256").update(value).digest();
    const provided = hash(password);
    const expected = hash(secret);

    const isValid =
      provided.length === expected.length && crypto.timingSafeEqual(provided, expected);

    if (!isValid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // A signed, short-lived pass (lib/admin/session.ts), never a fixed value.
    const pass = issueAdminPass();
    if (!pass) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const response = NextResponse.json({ ok: true });
    response.cookies.set({
      name: ADMIN_COOKIE,
      value: pass,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * ADMIN_MINUTES,
      path: "/",
    });
    return response;
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

import crypto from "crypto";
import { NextResponse } from "next/server";

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

    const response = NextResponse.json({ ok: true });
    response.cookies.set({
      name: "archive_admin",
      value: "1",
      httpOnly: true,
      sameSite: "strict",
      maxAge: 60 * 10,
      path: "/",
    });
    return response;
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

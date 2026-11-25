import { sql } from "@vercel/postgres";
import { after, NextResponse } from "next/server";
import { BOOKING } from "@/site/content.mjs";

// The booking form on /production posts here. Two ways in, one result:
//   - with scripts on, the page sends JSON and gets JSON back ({ ok: true });
//   - with scripts off, the browser posts the plain form and is sent on to
//     /production/sent or /production/not-sent.
// Either way Anthony is emailed, and the request is also kept in the
// `bookings` table as a second copy (there is no page that lists them any
// more: read the table in the Neon console if an email ever goes missing).
export const dynamic = "force-dynamic";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const MAX = { name: 200, email: 320, link: 2000, note: 5000, eventType: 200 };

type Inquiry = {
  name: string;
  email: string;
  eventType: string;
  eventDate: string | null;
  link: string;
  note: string;
};

async function notifyBooking(payload: Inquiry) {
  const to = process.env.BOOKING_NOTIFY_EMAIL || "adakemusic@gmail.com";
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.BOOKING_NOTIFY_FROM || "noreply@anthonydakemusic.com";

  const subject = `New booking inquiry — ${payload.eventType} (${payload.name})`;
  const text =
    `Name: ${payload.name}\n` +
    `Email: ${payload.email}\n` +
    `For: ${payload.eventType}\n` +
    (payload.eventDate ? `Date: ${payload.eventDate}\n` : "") +
    `Link to released music: ${payload.link || "(none)"}\n\n` +
    `Note:\n${payload.note || "(none)"}\n`;

  if (!apiKey) {
    console.warn("[booking] RESEND_API_KEY not set — inquiry stored in DB only");
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

// The email goes out after the answer has been sent, and the platform is told
// to keep the function alive until it has (a plain un-awaited promise can be
// cut off the moment the response leaves). Outside a request (the self-test)
// it simply runs.
function later(task: () => Promise<void>) {
  try {
    after(task);
  } catch {
    void task();
  }
}

function text(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

/** A one-line field: line breaks become spaces (the name goes into an email's subject). */
function line(value: unknown, max: number): string {
  return text(typeof value === "string" ? value.replace(/[\r\n\t]+/g, " ") : value, max);
}

export async function POST(request: Request) {
  const self = new URL(request.url);
  const asForm = !(request.headers.get("content-type") ?? "").toLowerCase().includes("application/json");

  // What each kind of caller gets back.
  const done = () =>
    asForm ? NextResponse.redirect(new URL("/production/sent", self), 303) : NextResponse.json({ ok: true });
  const refuse = (error: string, status: number) =>
    asForm ? NextResponse.redirect(new URL("/production/not-sent", self), 303) : NextResponse.json({ error }, { status });

  try {
    // Same-origin posts only. Compared against the host that served this
    // request (not NEXT_PUBLIC_SITE_URL), so preview deployments work too.
    const origin = request.headers.get("origin");
    if (origin) {
      const host = (request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? self.host).split(",")[0].trim();
      let from = "";
      try {
        from = new URL(origin).host;
      } catch {
        from = "";
      }
      if (!from || (from !== host && from !== self.host)) {
        return NextResponse.json({ error: "Forbidden." }, { status: 403 });
      }
    }

    let body: Record<string, unknown> = {};
    if (asForm) {
      const form = await request.formData();
      form.forEach((value, key) => {
        if (typeof value === "string") body[key] = value;
      });
    } else {
      const parsed: unknown = await request.json();
      if (parsed && typeof parsed === "object") body = parsed as Record<string, unknown>;
    }

    // Honeypot — a hidden field people never see. A script that fills every
    // field gives itself away; it is told all went well so it does not retry.
    if (typeof body.website === "string" && body.website.trim() !== "") return done();

    const name = line(body.name, MAX.name);
    const email = line(body.email, MAX.email).toLowerCase();
    // What the request is for. The production form sends its own name for it;
    // a plain form post carries none, so it gets the same one.
    const eventType = line(body.eventType, MAX.eventType) || BOOKING.type;
    // `link` and `note` are the form's fields; `message` is the older name for the note.
    const link = line(body.link, MAX.link);
    const note = text(body.note, MAX.note) || text(body.message, MAX.note);
    const rawDate = text(body.eventDate, 10);
    const eventDate = rawDate && ISO_DATE_REGEX.test(rawDate) ? rawDate : null;

    if (!name) return refuse("Name is required.", 400);
    if (!email || !EMAIL_REGEX.test(email)) return refuse("Valid email is required.", 400);

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

    // Added idempotently so existing rows aren't disturbed.
    await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS event_date DATE;`;
    await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS event_type TEXT;`;
    await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS message TEXT;`;
    await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS music_link TEXT;`;

    await sql`
      INSERT INTO bookings (name, email, event_date, event_type, message, music_link)
      VALUES (${name}, ${email}, ${eventDate}, ${eventType}, ${note}, ${link || null});
    `;

    later(() => notifyBooking({ name, email, eventType, eventDate, link, note }));

    return done();
  } catch (err) {
    console.error("[booking] request failed:", err instanceof Error ? err.message : String(err));
    return refuse("Server error.", 500);
  }
}

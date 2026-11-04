"use client";

import { useEffect, useState } from "react";

type BookingEntry = {
  id: number;
  name: string;
  email: string;
  event_type: string | null;
  event_date: string | null;
  message: string | null;
  created_at: string;
};

export default function BookingsAdminPage() {
  const [bookings, setBookings] = useState<BookingEntry[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "locked">("idle");
  const [message, setMessage] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const load = async () => {
      setStatus("loading");
      try {
        const response = await fetch("/api/bookings/list", { cache: "no-store" });
        if (!response.ok) {
          throw new Error("Unauthorized");
        }
        const data = await response.json();
        setBookings(Array.isArray(data?.bookings) ? data.bookings : []);
        setStatus("idle");
      } catch {
        setStatus("locked");
      }
    };

    load();
  }, []);

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!password) return;
    setStatus("loading");
    setMessage("");
    try {
      const response = await fetch("/api/bookings/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!response.ok) {
        throw new Error("Unauthorized");
      }
      setPassword("");
      const listResponse = await fetch("/api/bookings/list", { cache: "no-store" });
      if (!listResponse.ok) throw new Error("Unable to load");
      const data = await listResponse.json();
      setBookings(Array.isArray(data?.bookings) ? data.bookings : []);
      setStatus("idle");
    } catch {
      setStatus("locked");
      setMessage("Incorrect password.");
    }
  };

  const fmtDate = (iso: string | null) => {
    if (!iso) return null;
    const d = new Date(iso.length > 10 ? iso : `${iso}T12:00:00`);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <div className="min-h-screen bg-[#0f0f11] px-6 py-16 text-white">
      <div className="mx-auto w-full max-w-3xl space-y-6">
        <div className="space-y-2">
          <p className="text-[11px] uppercase tracking-[0.35em] text-white/60"><span>Booking Inbox</span></p>
          <h1 className="text-2xl tracking-[0.1em] uppercase"><span>Bookings</span></h1>
        </div>

        {status === "locked" ? (
          <form className="max-w-sm space-y-4" onSubmit={handleLogin}>
            <label className="sr-only" htmlFor="admin-password">
              Password
            </label>
            <input
              id="admin-password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="h-11 w-full rounded-full border border-white/15 bg-transparent px-4 text-[12px] uppercase tracking-[0.25em] text-white/70 focus:outline-none focus:ring-1 focus:ring-white/30"
            />
            <button
              type="submit"
              className="w-full rounded-full border border-white/20 px-4 py-2 text-[10px] uppercase tracking-[0.3em] transition hover:border-white/40"
            >
              <span>Unlock</span>
            </button>
            {message ? (
              <p className="text-[11px] uppercase tracking-[0.25em] text-white/50"><span>{message}</span></p>
            ) : null}
          </form>
        ) : null}

        {status !== "locked" ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 text-[12px] uppercase tracking-[0.3em] text-white/60">
              <span>{bookings.length} inquiries</span>
            </div>
            <div className="space-y-4">
              {bookings.map((b) => (
                <article
                  key={b.id}
                  className="rounded-lg border border-white/10 bg-white/[0.02] p-4 text-[13px] text-white/80"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <p className="text-[14px]"><span>{b.name}</span></p>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">
                      <span>{new Date(b.created_at).toLocaleString()}</span>
                    </p>
                  </div>
                  <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-white/60">
                    <a
                      href={`mailto:${b.email}?subject=Re:%20Booking%20inquiry`}
                      className="underline decoration-white/20 underline-offset-4 hover:decoration-white/60"
                    >
                      <span>{b.email}</span>
                    </a>
                    <span className="mx-2 text-white/30">·</span>
                    <span>Reply</span>
                  </p>
                  <p className="mt-3 text-[11px] uppercase tracking-[0.18em] text-white/50">
                    <span>{b.event_type || "(no type)"}</span>
                    {b.event_date ? (
                      <>
                        <span className="mx-2 text-white/30">·</span>
                        <span>{fmtDate(b.event_date)}</span>
                      </>
                    ) : null}
                  </p>
                  {b.message ? (
                    <p className="mt-3 whitespace-pre-wrap text-[13px] leading-6 text-white/70">
                      <span>{b.message}</span>
                    </p>
                  ) : (
                    <p className="mt-3 text-[11px] uppercase tracking-[0.18em] text-white/30">
                      <span>(no message)</span>
                    </p>
                  )}
                </article>
              ))}
              {bookings.length === 0 && status === "idle" ? (
                <p className="text-[12px] uppercase tracking-[0.3em] text-white/50">
                  <span>No bookings yet.</span>
                </p>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

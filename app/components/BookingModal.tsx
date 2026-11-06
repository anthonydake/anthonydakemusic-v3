"use client";

import { useEffect, useRef, useState } from "react";

type BookingModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

type Status = "idle" | "submitting" | "success" | "error";

const EVENT_TYPES = [
  "Live show / tour date",
  "Session drums (remote)",
  "Session drums (in person)",
  "Production / drum programming",
  "Church / worship",
  "Corporate event",
  "Other",
];

export default function BookingModal({ isOpen, onClose }: BookingModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventType, setEventType] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");

  const todayIso = new Date().toISOString().slice(0, 10);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const firstFieldRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setStatus("idle");
    setErrorMessage("");
    requestAnimationFrame(() => firstFieldRef.current?.focus());
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const root = dialogRef.current;
    if (!root) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const focusable = root.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    root.addEventListener("keydown", onKey);
    return () => root.removeEventListener("keydown", onKey);
  }, [isOpen]);

  useEffect(() => {
    if (status !== "success") return;
    const t = window.setTimeout(() => onClose(), 3000);
    return () => window.clearTimeout(t);
  }, [status, onClose]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "submitting") return;
    setStatus("submitting");
    setErrorMessage("");
    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          eventDate: eventDate || null,
          eventType,
          message,
          website,
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setErrorMessage(
          data?.error || "Something went wrong. Try emailing adakemusic@gmail.com directly."
        );
        setStatus("error");
        return;
      }
      setName("");
      setEmail("");
      setEventDate("");
      setEventType("");
      setMessage("");
      setStatus("success");
    } catch {
      setErrorMessage("Something went wrong. Try emailing adakemusic@gmail.com directly.");
      setStatus("error");
    }
  };

  if (!isOpen) return null;

  const labelClass = "mb-1 block text-[12px] text-[#9A9A9A]";

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Booking inquiry"
        onClick={(e) => e.stopPropagation()}
        className="relative my-8 w-full max-w-lg rounded-xl border border-white/[0.08] bg-black p-8"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close booking form"
          className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full text-[#9A9A9A] transition-colors hover:text-[#F2F2F2]"
        >
          <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-5 w-5">
            <line x1="5" y1="5" x2="15" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="15" y1="5" x2="5" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>

        <h2 className="mb-6 text-[20px] text-[#F2F2F2]">Let&apos;s talk about your project.</h2>

        {status === "success" ? (
          <div className="py-8 text-center">
            <p className="text-[15px] leading-[1.6] text-[#F2F2F2]">
              Thanks — I&apos;ll get back to you within 24 hours.
            </p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <div aria-hidden="true" style={{ position: "absolute", left: "-10000px", top: "auto", width: "1px", height: "1px", overflow: "hidden" }}>
              <label htmlFor="bk-website">Website</label>
              <input
                id="bk-website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="bk-name" className={labelClass}>Name</label>
              <input
                ref={firstFieldRef}
                id="bk-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                className="form-input"
              />
            </div>

            <div>
              <label htmlFor="bk-email" className={labelClass}>Email</label>
              <input
                id="bk-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className="form-input"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="bk-date" className={labelClass}>Event date</label>
                <input
                  id="bk-date"
                  type="date"
                  min={todayIso}
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="form-input"
                />
              </div>
              <div>
                <label htmlFor="bk-type" className={labelClass}>Event type</label>
                <select
                  id="bk-type"
                  required
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  className="form-input"
                >
                  <option value="" disabled>
                    Select…
                  </option>
                  {EVENT_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="bk-msg" className={labelClass}>Message</label>
              <textarea
                id="bk-msg"
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell me about your project — style, vibe, any details that help."
                className="form-input resize-none"
              />
            </div>

            {status === "error" && (
              <p className="text-[12px] leading-5 text-[#F5A3A3]">{errorMessage}</p>
            )}

            <div className="mt-2 flex justify-end">
              <button
                type="submit"
                disabled={status === "submitting"}
                className="epk-cta disabled:cursor-not-allowed disabled:opacity-60"
              >
                {status === "submitting" ? "Sending…" : "Send inquiry →"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

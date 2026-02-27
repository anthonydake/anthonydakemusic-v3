"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";

const LAST_SHOWN_KEY = "archiveModalLastShownAt";
const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const SHOW_DELAY_MS = 18_000;

export default function ArchiveModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const reduceMotion = useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    []
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const lastShown = Number(window.localStorage.getItem(LAST_SHOWN_KEY) ?? 0);
    if (Number.isFinite(lastShown) && Date.now() - lastShown < ONE_DAY_MS) return;

    const timer = window.setTimeout(() => {
      setIsOpen(true);
      window.localStorage.setItem(LAST_SHOWN_KEY, String(Date.now()));
    }, SHOW_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        if (typeof window !== "undefined") {
          window.localStorage.setItem(LAST_SHOWN_KEY, String(Date.now()));
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === "loading") return;
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    if (!email) {
      setStatus("error");
      setMessage("Email is required.");
      return;
    }
    setStatus("loading");
    setMessage("");
    try {
      const response = await fetch("/api/archive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!response.ok) {
        throw new Error("Request failed");
      }
      setStatus("success");
      setMessage("Received.");
      event.currentTarget.reset();
    } catch {
      setStatus("error");
      setMessage("Unable to submit. Please try again.");
    }
  };

  return (
    <div
      className={[
        "archive-fade fixed inset-0 z-[9999] flex items-center justify-center p-6",
        "bg-[rgba(8,8,8,0.72)]",
      ].join(" ")}
      role="dialog"
      aria-modal="true"
      aria-labelledby="archive-title"
    >
      <div
        className={[
          "archive-modal-plain archive-modal-surface relative w-full max-w-[420px] rounded-2xl px-8 py-10",
          "shadow-[0_22px_70px_rgba(0,0,0,0.55)]",
          reduceMotion ? "" : "archive-fade",
        ].join(" ")}
      >
        <button
          type="button"
          aria-label="Close"
          className="archive-close absolute right-4 top-4 h-6 w-6 rounded-full text-[16px] leading-none"
          onClick={() => setIsOpen(false)}
        >
          ×
        </button>
        <div className="space-y-6">
          <div className="space-y-3">
            <h2 id="archive-title" className="archive-title text-[20px] tracking-[0.08em] uppercase">
              The Archive
            </h2>
            <p className="text-[13px] leading-6 text-[rgba(220,220,220,0.85)]">
              Unreleased drafts. Early releases.
              <br />
              Access before public distribution.
            </p>
          </div>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <label className="sr-only" htmlFor="archive-email">
              Email
            </label>
            <input
              id="archive-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="Email"
              required
              className={[
                "archive-modal-input h-11 w-full rounded-full border border-white/10 bg-transparent px-4 text-[13px]",
                "tracking-[0.04em] focus:outline-none focus:ring-1 focus:ring-white/20",
              ].join(" ")}
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className={[
                "archive-modal-button h-11 w-full rounded-full border border-white/15 text-[12px]",
                "uppercase tracking-[0.3em] transition hover:border-white/30",
              ].join(" ")}
            >
              {status === "loading" ? "Sending" : "Enter"}
            </button>
            {message ? (
              <p className="text-[11px] uppercase tracking-[0.18em] text-[rgba(210,210,210,0.72)]">{message}</p>
            ) : null}
          </form>
        </div>
      </div>
    </div>
  );
}

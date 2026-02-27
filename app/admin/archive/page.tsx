"use client";

import { useEffect, useState } from "react";

type EmailEntry = {
  email: string;
  created_at: string;
};

export default function ArchiveAdminPage() {
  const [emails, setEmails] = useState<EmailEntry[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "locked">("idle");
  const [message, setMessage] = useState("");
  const [password, setPassword] = useState("");

  const [isUnlocked, setIsUnlocked] = useState(false);

  useEffect(() => {
    const load = async () => {
      setStatus("loading");
      try {
        const response = await fetch("/api/archive/list", { cache: "no-store" });
        if (!response.ok) {
          throw new Error("Unauthorized");
        }
        const data = await response.json();
        setEmails(Array.isArray(data?.emails) ? data.emails : []);
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
      const response = await fetch("/api/archive/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!response.ok) {
        throw new Error("Unauthorized");
      }
      setIsUnlocked(true);
      setPassword("");
      const listResponse = await fetch("/api/archive/list", { cache: "no-store" });
      if (!listResponse.ok) throw new Error("Unable to load");
      const data = await listResponse.json();
      setEmails(Array.isArray(data?.emails) ? data.emails : []);
      setStatus("idle");
    } catch {
      setStatus("locked");
      setMessage("Incorrect password.");
    }
  };

  const handleDownload = () => {
    const header = "email,created_at";
    const rows = emails.map((entry) => `${entry.email},${entry.created_at}`);
    const blob = new Blob([header, "\n", rows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "archive-emails.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#0f0f11] px-6 py-16 text-white">
      <div className="mx-auto w-full max-w-3xl space-y-6">
        <div className="space-y-2">
          <p className="text-[11px] uppercase tracking-[0.35em] text-white/60">Archive Access</p>
          <h1 className="text-2xl tracking-[0.1em] uppercase">Email List</h1>
        </div>

        {status === "locked" ? (
          <form className="max-w-sm space-y-4" onSubmit={handleLogin}>
            <label className="sr-only" htmlFor="archive-password">
              Password
            </label>
            <input
              id="archive-password"
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
              Unlock
            </button>
            {message ? (
              <p className="text-[11px] uppercase tracking-[0.25em] text-white/50">{message}</p>
            ) : null}
          </form>
        ) : null}

        {status === "error" ? (
          <p className="text-[13px] uppercase tracking-[0.25em] text-white/50">{message}</p>
        ) : null}

        {status !== "locked" ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 text-[12px] uppercase tracking-[0.3em] text-white/60">
              <span>{emails.length} entries</span>
              <button
                type="button"
                className="rounded-full border border-white/20 px-4 py-2 text-[10px] uppercase tracking-[0.3em] transition hover:border-white/40"
                onClick={handleDownload}
                disabled={emails.length === 0}
              >
                Download
              </button>
            </div>
            <div className="space-y-2">
              {emails.map((entry) => (
                <div
                  key={`${entry.email}-${entry.created_at}`}
                  className="flex flex-col border-b border-white/5 pb-3 text-[13px] text-white/70"
                >
                  <span>{entry.email}</span>
                  <span className="text-[11px] uppercase tracking-[0.18em] text-white/40">
                    {new Date(entry.created_at).toLocaleString()}
                  </span>
                </div>
              ))}
              {emails.length === 0 && status === "idle" ? (
                <p className="text-[12px] uppercase tracking-[0.3em] text-white/50">No entries yet.</p>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

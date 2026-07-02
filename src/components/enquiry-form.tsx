"use client";

import { useState } from "react";
import { clsx } from "@/lib/clsx";

type Status = "idle" | "loading" | "success" | "error";

const BUDGETS = [
  "Exploring",
  "$5k – $15k",
  "$15k – $40k",
  "$40k+",
] as const;

/**
 * Premium, simple enquiry form for the "Work With Me" page. Posts to
 * /api/enquiry. Deliberately short: name, email, budget, and the ask.
 */
export function EnquiryForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "loading") return;
    const form = e.currentTarget;
    const payload = Object.fromEntries(new FormData(form).entries());

    // Honeypot — bots fill hidden fields; humans don't.
    if (payload.company) return;

    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? "Something went wrong.");
      setStatus("success");
      setMessage(
        data?.message ?? "Thank you — I'll be in touch within a few days."
      );
      form.reset();
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  if (status === "success") {
    return (
      <div className="animate-fade-up rounded-lg border border-gold/40 p-10 text-center">
        <p className="font-display text-2xl text-champagne">Received.</p>
        <p className="mt-3 text-mist">{message}</p>
      </div>
    );
  }

  const field =
    "w-full bg-transparent border border-graphite focus:border-gold/60 rounded-lg px-4 py-3 text-ivory placeholder:text-ash transition-colors duration-300 outline-none";

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
      />

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="eyebrow mb-2 block">
            Name
          </label>
          <input id="name" name="name" required className={field} />
        </div>
        <div>
          <label htmlFor="email" className="eyebrow mb-2 block">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className={field}
          />
        </div>
      </div>

      <div>
        <label htmlFor="budget" className="eyebrow mb-2 block">
          Budget
        </label>
        <select
          id="budget"
          name="budget"
          defaultValue=""
          className={clsx(field, "appearance-none")}
        >
          <option value="" disabled>
            Select a range
          </option>
          {BUDGETS.map((b) => (
            <option key={b} value={b} className="bg-obsidian">
              {b}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="message" className="eyebrow mb-2 block">
          The project
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          placeholder="A sentence or two on what you have in mind."
          className={clsx(field, "resize-y")}
        />
      </div>

      {status === "error" && (
        <p className="text-sm text-red-300/80" role="alert">
          {message}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="btn-gold w-full sm:w-auto disabled:opacity-50"
      >
        {status === "loading" ? "Sending…" : "Send enquiry"}
      </button>
    </form>
  );
}

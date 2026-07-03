"use client";

import { useState } from "react";
import { clsx } from "@/lib/clsx";
import { CheckIcon } from "./icons";

type Status = "idle" | "loading" | "success" | "error";

const ROLES = [
  "Clinical / Medical Director",
  "Quality / Compliance",
  "Utilization Review",
  "Revenue Cycle / Billing",
  "Executive / Owner",
  "Other",
] as const;

const SIZES = [
  "1–3 facilities",
  "4–10 facilities",
  "11–50 facilities",
  "50+ facilities",
] as const;

/**
 * Demo request form. Posts to /api/demo. Kept short — the goal is to book a
 * conversation, not to qualify a lead to death.
 */
export function DemoForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "loading") return;
    const form = e.currentTarget;
    const payload = Object.fromEntries(new FormData(form).entries());

    // Honeypot — bots fill hidden fields; humans don't.
    if (payload.company_url) return;

    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch("/api/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? "Something went wrong.");
      setStatus("success");
      setMessage(
        data?.message ??
          "Thanks — we'll be in touch within one business day to schedule your walkthrough."
      );
      form.reset();
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  if (status === "success") {
    return (
      <div className="card animate-fade-up p-10 text-center">
        <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-aqua/15 text-aqua">
          <CheckIcon className="h-6 w-6" />
        </span>
        <p className="mt-5 font-display text-2xl font-bold text-ink">
          Request received
        </p>
        <p className="mt-3 text-slate">{message}</p>
      </div>
    );
  }

  const field =
    "w-full rounded-xl border border-line bg-white px-4 py-3 text-ink placeholder:text-faint outline-none transition-colors duration-200 focus:border-teal";
  const label = "mb-2 block text-sm font-medium text-ink";

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {/* Honeypot */}
      <input
        type="text"
        name="company_url"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className={label}>
            Full name
          </label>
          <input id="name" name="name" required className={field} />
        </div>
        <div>
          <label htmlFor="email" className={label}>
            Work email
          </label>
          <input id="email" name="email" type="email" required className={field} />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="organization" className={label}>
            Organization
          </label>
          <input id="organization" name="organization" className={field} />
        </div>
        <div>
          <label htmlFor="role" className={label}>
            Your role
          </label>
          <select
            id="role"
            name="role"
            defaultValue=""
            className={clsx(field, "appearance-none")}
          >
            <option value="" disabled>
              Select…
            </option>
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="size" className={label}>
          Facilities
        </label>
        <select
          id="size"
          name="size"
          defaultValue=""
          className={clsx(field, "appearance-none")}
        >
          <option value="" disabled>
            Select a range
          </option>
          {SIZES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="message" className={label}>
          What would you like to solve? <span className="text-faint">(optional)</span>
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          placeholder="Denials, charting time, audit readiness, your EMR…"
          className={clsx(field, "resize-y")}
        />
      </div>

      {status === "error" && (
        <p className="text-sm text-red-600" role="alert">
          {message}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="btn-primary w-full sm:w-auto"
      >
        {status === "loading" ? "Sending…" : "Request a demo"}
      </button>

      <p className="text-xs text-muted">
        By submitting, you agree to be contacted about Circle Health. We never
        share your information.
      </p>
    </form>
  );
}

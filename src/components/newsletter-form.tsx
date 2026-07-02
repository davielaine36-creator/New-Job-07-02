"use client";

import { useState } from "react";
import { clsx } from "@/lib/clsx";

type Status = "idle" | "loading" | "success" | "error";

/**
 * Newsletter signup — the brand's persistent CTA. Posts to /api/subscribe,
 * which forwards to the owned newsletter system (Ghost Members or an ESP).
 * Optimistic, accessible, and quietly animated.
 */
export function NewsletterForm({
  variant = "block",
  className,
}: {
  variant?: "block" | "inline";
  className?: string;
}) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "loading") return;
    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? "Something went wrong.");
      setStatus("success");
      setMessage(data?.message ?? "Check your inbox to confirm.");
      setEmail("");
    } catch (err) {
      setStatus("error");
      setMessage(
        err instanceof Error ? err.message : "Something went wrong."
      );
    }
  }

  if (status === "success") {
    return (
      <p
        className={clsx(
          "text-champagne animate-fade-up",
          variant === "block" ? "text-lg" : "text-sm",
          className
        )}
        role="status"
      >
        {message}
      </p>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className={clsx(
        "w-full",
        variant === "block" ? "max-w-md" : "max-w-sm",
        className
      )}
      noValidate
    >
      <div
        className={clsx(
          "flex items-center gap-3",
          variant === "block" && "flex-col sm:flex-row"
        )}
      >
        <label htmlFor={`nl-${variant}`} className="sr-only">
          Email address
        </label>
        <input
          id={`nl-${variant}`}
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@domain.com"
          autoComplete="email"
          className="w-full flex-1 bg-transparent border border-graphite focus:border-gold/60
                     rounded-full px-5 py-3 text-ivory placeholder:text-ash
                     transition-colors duration-300 outline-none"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="btn-gold w-full sm:w-auto whitespace-nowrap disabled:opacity-50"
        >
          {status === "loading" ? "Joining…" : "Subscribe"}
        </button>
      </div>
      {status === "error" && (
        <p className="mt-3 text-sm text-red-300/80" role="alert">
          {message}
        </p>
      )}
      <p className="mt-3 text-xs text-ash">
        Weekly essays. No noise. Unsubscribe anytime.
      </p>
    </form>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { clsx } from "@/lib/clsx";

type Action = "tick" | "seed" | "simulate" | "reset";

const ENDPOINT: Record<Action, string> = {
  tick: "/api/radar/tick",
  seed: "/api/radar/seed",
  simulate: "/api/radar/simulate",
  reset: "/api/radar/reset",
};

const BODY: Record<Action, unknown> = {
  tick: { force: true, discover: true, discoveryBatches: 3, optimize: true },
  seed: { ticks: 6, reset: true },
  simulate: { rate: 0.6, max: 25 },
  reset: {},
};

/**
 * The operator's console controls. In autonomous mode the loop runs on a cron;
 * these are the manual overrides — advance a tick, seed a full mock pipeline,
 * simulate inbound replies, or wipe and start over.
 */
export function ControlBar({ mode }: { mode: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [busy, setBusy] = useState<Action | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  async function run(action: Action) {
    if (action === "reset" && !confirm("Wipe all factory data?")) return;
    setBusy(action);
    setMsg(null);
    try {
      const res = await fetch(ENDPOINT[action], {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(BODY[action]),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "failed");
      setMsg(summarize(action, data));
      startTransition(() => router.refresh());
    } catch (err) {
      setMsg(`✗ ${(err as Error).message}`);
    } finally {
      setBusy(null);
    }
  }

  const disabled = busy !== null || pending;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button className="r-btn-primary" onClick={() => run("tick")} disabled={disabled}>
        {busy === "tick" ? <Spinner /> : <Play />} Run tick
      </button>
      {mode === "mock" && (
        <>
          <button className="r-btn-outline" onClick={() => run("seed")} disabled={disabled}>
            {busy === "seed" ? <Spinner /> : "⚡"} Seed pipeline
          </button>
          <button className="r-btn-outline" onClick={() => run("simulate")} disabled={disabled}>
            {busy === "simulate" ? <Spinner /> : "✉"} Simulate replies
          </button>
          <button className="r-btn-danger" onClick={() => run("reset")} disabled={disabled}>
            Reset
          </button>
        </>
      )}
      {msg && (
        <span
          className={clsx(
            "ml-1 font-mono text-[11px]",
            msg.startsWith("✗") ? "text-radar-rose" : "text-radar-mute"
          )}
        >
          {msg}
        </span>
      )}
    </div>
  );
}

function summarize(action: Action, data: Record<string, unknown>): string {
  if (action === "tick") {
    const d = data as { discovered: number; audited: number; scored: number; demos: number; outreach: number; followups: number };
    return `✓ +${d.discovered} found · ${d.audited} audited · ${d.scored} scored · ${d.demos} demos · ${d.outreach + d.followups} sent`;
  }
  if (action === "seed") {
    const o = (data.optimizer as { totals?: { sent: number; positive: number } } | undefined)?.totals;
    return `✓ pipeline seeded · ${o?.sent ?? 0} sent · ${o?.positive ?? 0} positive replies`;
  }
  if (action === "simulate") {
    return `✓ ${(data as { generated: number }).generated} replies generated`;
  }
  return "✓ reset";
}

function Spinner() {
  return (
    <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
  );
}
function Play() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" aria-hidden>
      <path d="M2 1.5v9l8-4.5z" />
    </svg>
  );
}

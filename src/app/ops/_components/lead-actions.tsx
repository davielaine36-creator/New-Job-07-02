"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { clsx } from "@/lib/clsx";

/**
 * Per-lead manual controls. Even in a fully autonomous system the operator can
 * step a single lead through any agent for inspection or run an off-loop action.
 */
export function LeadActions({ leadId }: { leadId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  async function call(url: string, body: unknown, label: string) {
    setBusy(label);
    setMsg(null);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "failed");
      setMsg(`✓ ${label}`);
      router.refresh();
    } catch (err) {
      setMsg(`✗ ${(err as Error).message}`);
    } finally {
      setBusy(null);
    }
  }

  const agent = (a: string) => `/api/radar/agents/${a}`;

  async function injectReply() {
    const text = prompt("Paste an inbound reply to classify:");
    if (!text) return;
    await call(`/api/radar/leads/${leadId}/reply`, { text }, "reply classified");
  }

  const btns: { label: string; run: () => void }[] = [
    { label: "Audit", run: () => call(agent("audit"), { leadId }, "audited") },
    { label: "Score", run: () => call(agent("scoring"), { leadId }, "scored") },
    { label: "Build demo", run: () => call(agent("demo"), { leadId }, "demo built") },
    { label: "Send next", run: () => call(agent("outreach"), { leadId }, "outreach sent") },
    { label: "Inject reply", run: injectReply },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2">
      {btns.map((b) => (
        <button key={b.label} className="r-btn-outline" onClick={b.run} disabled={busy !== null}>
          {busy === b.label.toLowerCase() ? "…" : b.label}
        </button>
      ))}
      <button
        className="r-btn-danger"
        onClick={() => {
          if (confirm("Suppress this lead permanently?"))
            call(agent("compliance"), { leadId, reason: "manual suppression" }, "suppressed");
        }}
        disabled={busy !== null}
      >
        Suppress
      </button>
      {msg && (
        <span className={clsx("font-mono text-[11px]", msg.startsWith("✗") ? "text-radar-rose" : "text-radar-signal")}>
          {msg}
        </span>
      )}
    </div>
  );
}

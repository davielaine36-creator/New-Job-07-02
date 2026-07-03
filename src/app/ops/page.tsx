import Link from "next/link";
import { computeMetrics } from "@/lib/radar/metrics";
import { getDb } from "@/lib/radar/db";
import { NICHE_LABELS, STATUS_LABELS, STATUSES } from "@/lib/radar/types";
import type { AgentRun, LeadStatus } from "@/lib/radar/types";
import { Stat, money } from "./_components/ui";
import { clsx } from "@/lib/clsx";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const m = await computeMetrics();
  const runs = await getDb().list("agent_runs", {
    order: { column: "created_at", dir: "desc" },
    limit: 8,
  });

  if (m.total_leads === 0) return <EmptyState />;

  const funnel: { status: LeadStatus; count: number }[] = [
    "discovered", "audited", "scored", "demo_generated", "outreach_sent",
    "replied", "interested", "won",
  ].map((s) => ({ status: s as LeadStatus, count: funnelCount(m.status_counts, s as LeadStatus) }));
  const funnelMax = Math.max(...funnel.map((f) => f.count), 1);

  return (
    <div className="space-y-6">
      <div>
        <p className="r-eyebrow">Operations</p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight">Factory overview</h1>
      </div>

      {/* Headline metrics */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Leads discovered" value={m.total_leads} />
        <Stat label="Audited" value={m.audited} tone="cyan" />
        <Stat label="Demos built" value={m.demos} tone="violet" />
        <Stat label="Outreach sent" value={m.sends_total} tone="amber" />
        <Stat label="Replies" value={m.replies} />
        <Stat label="Interested" value={m.interested} tone="signal" />
        <Stat label="Won" value={m.won} tone="signal" />
        <Stat label="Pipeline value" value={money(m.pipeline_value)} tone="signal" sub="probability-weighted" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Funnel */}
        <section className="r-panel p-5 lg:col-span-2">
          <h2 className="text-sm font-bold">Conversion funnel</h2>
          <div className="mt-4 space-y-2.5">
            {funnel.map((f) => (
              <div key={f.status} className="flex items-center gap-3">
                <span className="w-28 shrink-0 text-[12px] text-radar-mute">
                  {STATUS_LABELS[f.status]}
                </span>
                <div className="relative h-6 flex-1 overflow-hidden rounded bg-radar-raised">
                  <div
                    className="h-full rounded bg-gradient-to-r from-radar-signal-deep to-radar-signal"
                    style={{ width: `${(f.count / funnelMax) * 100}%` }}
                  />
                </div>
                <span className="w-10 shrink-0 text-right font-mono text-[12px] font-semibold tabular-nums">
                  {f.count}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Compliance */}
        <section className="r-panel p-5">
          <h2 className="text-sm font-bold">Compliance & health</h2>
          <div className="mt-4 space-y-3">
            <Gauge label="Bounce rate" value={m.bounce_rate} danger={0.05} />
            <Gauge label="Unsubscribe rate" value={m.unsub_rate} danger={0.08} />
            <div className="flex items-center justify-between rounded-lg border border-radar-line bg-radar-raised px-3 py-2.5">
              <span className="text-[12px] text-radar-mute">Suppressed / opted-out</span>
              <span className="font-mono text-sm font-bold text-radar-rose">{m.suppressed}</span>
            </div>
            <p className="text-[11px] leading-relaxed text-radar-faint">
              Opt-outs, complaints and bounces are permanently suppressed and can never be
              re-contacted. Every send carries sender identity, a physical address, and a
              working unsubscribe.
            </p>
          </div>
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Niche mix */}
        <section className="r-panel p-5">
          <h2 className="text-sm font-bold">Leads by niche</h2>
          <div className="mt-4 space-y-2">
            {m.niche_counts.slice(0, 8).map((n) => (
              <div key={n.niche} className="flex items-center justify-between text-[12px]">
                <span className="text-radar-mute">{NICHE_LABELS[n.niche]}</span>
                <span className="font-mono font-semibold tabular-nums">{n.count}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Full pipeline distribution */}
        <section className="r-panel p-5">
          <h2 className="text-sm font-bold">Pipeline distribution</h2>
          <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1.5">
            {STATUSES.map((s) => (
              <div key={s} className="flex items-center justify-between text-[11.5px]">
                <span className="text-radar-mute">{STATUS_LABELS[s]}</span>
                <span className="font-mono tabular-nums text-radar-ink">{m.status_counts[s] ?? 0}</span>
              </div>
            ))}
          </div>
          <Link href="/ops/pipeline" className="mt-4 inline-block text-[12px] font-semibold text-radar-signal hover:underline">
            Open board →
          </Link>
        </section>

        {/* Recent agent runs */}
        <section className="r-panel p-5">
          <h2 className="text-sm font-bold">Recent agent runs</h2>
          <div className="mt-4 space-y-1.5">
            {runs.length === 0 && <p className="text-[12px] text-radar-faint">No runs yet.</p>}
            {runs.map((r: AgentRun) => (
              <div key={r.id} className="flex items-center justify-between text-[11.5px]">
                <span className="flex items-center gap-2">
                  <span
                    className={clsx(
                      "h-1.5 w-1.5 rounded-full",
                      r.status === "ok" ? "bg-radar-signal" : "bg-radar-rose"
                    )}
                  />
                  <span className="font-mono text-radar-mute">{r.agent_name}</span>
                </span>
                <span className="font-mono text-radar-faint">{r.duration_ms ?? 0}ms</span>
              </div>
            ))}
          </div>
          <Link href="/ops/runs" className="mt-4 inline-block text-[12px] font-semibold text-radar-signal hover:underline">
            View log →
          </Link>
        </section>
      </div>
    </div>
  );
}

function funnelCount(counts: Record<LeadStatus, number>, stage: LeadStatus): number {
  // Cumulative "reached at least this stage" for the funnel view.
  const order = STATUSES.indexOf(stage);
  const contacted: LeadStatus[] = [
    "outreach_sent", "followup_1_sent", "followup_2_sent", "followup_3_sent",
    "replied", "interested", "booked", "proposal_sent", "won", "lost",
  ];
  let total = 0;
  for (const s of STATUSES) {
    const reached =
      STATUSES.indexOf(s) >= order ||
      (stage === "audited" && (contacted.includes(s) || s === "scored" || s === "demo_generated")) ||
      (stage === "scored" && (contacted.includes(s) || s === "demo_generated")) ||
      (stage === "demo_generated" && contacted.includes(s)) ||
      (stage === "outreach_sent" && contacted.includes(s)) ||
      (stage === "replied" && ["interested", "booked", "proposal_sent", "won", "lost"].includes(s));
    if (reached) total += counts[s] ?? 0;
  }
  return total;
}

function Gauge({ label, value, danger }: { label: string; value: number; danger: number }) {
  const pct = Math.min(100, Math.round(value * 100 * 4)); // scale for visibility
  const hot = value >= danger;
  return (
    <div>
      <div className="flex items-center justify-between text-[12px]">
        <span className="text-radar-mute">{label}</span>
        <span className={clsx("font-mono font-semibold", hot ? "text-radar-rose" : "text-radar-signal")}>
          {(value * 100).toFixed(1)}%
        </span>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-radar-raised">
        <div
          className={clsx("h-full rounded-full", hot ? "bg-radar-rose" : "bg-radar-signal")}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="relative mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-radar-signal/10">
        <span className="h-4 w-4 rounded-full bg-radar-signal animate-pulse-signal" />
      </div>
      <h1 className="text-xl font-extrabold">The factory is idle</h1>
      <p className="mt-2 max-w-md text-[13px] text-radar-mute">
        No leads yet. Seed a full mock pipeline — discovery → audit → score → demo → outreach →
        simulated replies → CRM → optimization — with one click, or press{" "}
        <span className="font-mono text-radar-ink">Run tick</span> in the top bar to advance one cycle.
      </p>
      <p className="mt-6 rounded-lg border border-radar-line bg-radar-raised px-4 py-2 font-mono text-[12px] text-radar-mute">
        Use <span className="text-radar-signal">Seed pipeline</span> in the header ↑
      </p>
    </div>
  );
}

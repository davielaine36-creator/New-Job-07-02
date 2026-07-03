import type { LeadStatus } from "@/lib/radar/types";
import { STATUS_LABELS } from "@/lib/radar/types";
import { clsx } from "@/lib/clsx";

/** Colour language for the funnel. Kept in one place so board + table agree. */
const STATUS_TONE: Record<LeadStatus, string> = {
  discovered: "text-radar-faint border-radar-line",
  audited: "text-radar-cyan border-radar-cyan/30",
  scored: "text-radar-cyan border-radar-cyan/30",
  demo_generated: "text-radar-violet border-radar-violet/30",
  outreach_sent: "text-radar-amber border-radar-amber/30",
  followup_1_sent: "text-radar-amber border-radar-amber/30",
  followup_2_sent: "text-radar-amber border-radar-amber/30",
  followup_3_sent: "text-radar-amber border-radar-amber/30",
  replied: "text-radar-signal border-radar-signal/30",
  interested: "text-radar-signal border-radar-signal/40",
  booked: "text-radar-signal border-radar-signal/50",
  proposal_sent: "text-radar-signal border-radar-signal/40",
  won: "text-[#04140c] bg-radar-signal border-radar-signal font-bold",
  lost: "text-radar-faint border-radar-line line-through decoration-radar-faint/50",
  bounced: "text-radar-rose border-radar-rose/30",
  opted_out: "text-radar-rose border-radar-rose/40",
  suppressed: "text-radar-rose border-radar-rose/40",
  archived: "text-radar-faint border-radar-line",
};

export function StatusBadge({ status }: { status: LeadStatus }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap",
        STATUS_TONE[status]
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

export function statusTone(status: LeadStatus): string {
  return STATUS_TONE[status];
}

export function ScorePill({ score }: { score: number | null }) {
  if (score == null)
    return <span className="r-metric text-radar-faint text-xs">—</span>;
  const tone =
    score >= 80
      ? "text-radar-signal"
      : score >= 65
        ? "text-radar-cyan"
        : score >= 50
          ? "text-radar-amber"
          : "text-radar-faint";
  return (
    <span className={clsx("r-metric font-semibold tabular-nums", tone)}>
      {score}
    </span>
  );
}

export function Stat({
  label,
  value,
  sub,
  tone = "ink",
}: {
  label: string;
  value: string | number;
  sub?: string;
  tone?: "ink" | "signal" | "cyan" | "amber" | "rose" | "violet";
}) {
  const toneClass = {
    ink: "text-radar-ink",
    signal: "text-radar-signal",
    cyan: "text-radar-cyan",
    amber: "text-radar-amber",
    rose: "text-radar-rose",
    violet: "text-radar-violet",
  }[tone];
  return (
    <div className="r-panel p-4">
      <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-radar-faint">
        {label}
      </div>
      <div className={clsx("mt-2 font-mono text-2xl font-bold tabular-nums", toneClass)}>
        {value}
      </div>
      {sub && <div className="mt-1 text-[11px] text-radar-mute">{sub}</div>}
    </div>
  );
}

export function money(n: number): string {
  return `$${Math.round(n).toLocaleString("en-US")}`;
}

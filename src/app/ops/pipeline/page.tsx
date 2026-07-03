import Link from "next/link";
import { allLeads } from "@/lib/radar/repo";
import { NICHE_LABELS, STATUS_LABELS, STATUSES } from "@/lib/radar/types";
import type { Lead, LeadStatus } from "@/lib/radar/types";
import { ScorePill, statusTone } from "../_components/ui";
import { clsx } from "@/lib/clsx";

export const dynamic = "force-dynamic";

// Columns to always show, in funnel order; terminal states appended if populated.
const CORE: LeadStatus[] = [
  "discovered", "audited", "scored", "demo_generated",
  "outreach_sent", "followup_1_sent", "followup_2_sent", "followup_3_sent",
  "replied", "interested", "booked", "proposal_sent", "won",
];
const TERMINAL: LeadStatus[] = ["lost", "bounced", "opted_out", "suppressed", "archived"];

export default async function PipelinePage() {
  const leads = await allLeads();
  const byStatus = new Map<LeadStatus, Lead[]>();
  for (const s of STATUSES) byStatus.set(s, []);
  for (const l of leads) byStatus.get(l.status)?.push(l);

  const columns = [
    ...CORE,
    ...TERMINAL.filter((s) => (byStatus.get(s)?.length ?? 0) > 0),
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between">
        <div>
          <p className="r-eyebrow">Pipeline</p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight">Lead board</h1>
        </div>
        <span className="font-mono text-[12px] text-radar-mute">{leads.length} leads</span>
      </div>

      {leads.length === 0 ? (
        <p className="text-[13px] text-radar-mute">No leads yet — seed the pipeline from the top bar.</p>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-4">
          {columns.map((status) => {
            const items = byStatus.get(status) ?? [];
            return (
              <div key={status} className="w-64 shrink-0">
                <div className="mb-2 flex items-center justify-between px-1">
                  <span className={clsx("rounded-md border px-2 py-0.5 text-[11px] font-semibold", statusTone(status))}>
                    {STATUS_LABELS[status]}
                  </span>
                  <span className="font-mono text-[11px] text-radar-faint">{items.length}</span>
                </div>
                <div className="space-y-2">
                  {items.slice(0, 40).map((l) => (
                    <LeadCard key={l.id} lead={l} />
                  ))}
                  {items.length === 0 && (
                    <div className="rounded-lg border border-dashed border-radar-line/60 px-3 py-6 text-center text-[11px] text-radar-faint">
                      empty
                    </div>
                  )}
                  {items.length > 40 && (
                    <p className="px-1 text-[11px] text-radar-faint">+{items.length - 40} more</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function LeadCard({ lead }: { lead: Lead }) {
  return (
    <Link
      href={`/ops/leads/${lead.id}`}
      className="block rounded-lg border border-radar-line bg-radar-surface p-3 transition-colors hover:border-radar-line-strong hover:bg-radar-raised"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-[12.5px] font-semibold leading-tight text-radar-ink">
          {lead.business_name}
        </span>
        <ScorePill score={lead.score_total} />
      </div>
      <div className="mt-1.5 flex items-center gap-2 text-[11px] text-radar-faint">
        <span>{NICHE_LABELS[lead.niche]}</span>
        <span>·</span>
        <span>{lead.location_city}</span>
      </div>
      {lead.offer_level_recommended && (
        <span className="mt-2 inline-block rounded border border-radar-line px-1.5 py-0.5 text-[10px] font-medium text-radar-mute">
          {lead.offer_level_recommended === 1 ? "Refresh" : "Growth"}
        </span>
      )}
    </Link>
  );
}

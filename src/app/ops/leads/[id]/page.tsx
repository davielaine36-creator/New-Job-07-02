import Link from "next/link";
import { notFound } from "next/navigation";
import { getLead, latestAuditFor, latestDemoFor, messagesFor, repliesFor } from "@/lib/radar/repo";
import { NICHE_LABELS } from "@/lib/radar/types";
import type { LeadStatus } from "@/lib/radar/types";
import { ScorePill, StatusBadge } from "../../_components/ui";
import { LeadActions } from "../../_components/lead-actions";
import { clsx } from "@/lib/clsx";

export const dynamic = "force-dynamic";

export default async function LeadDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lead = await getLead(id);
  if (!lead) notFound();

  const [audit, demo, messages, replies] = await Promise.all([
    latestAuditFor(id),
    latestDemoFor(id),
    messagesFor(id),
    repliesFor(id),
  ]);

  const subScores: { label: string; v: number | null }[] = [
    { label: "Need", v: lead.score_need },
    { label: "Budget", v: lead.score_budget },
    { label: "Delivery ease", v: lead.score_delivery_ease },
    { label: "Contactability", v: lead.score_contactability },
    { label: "Demo potential", v: lead.score_demo_potential },
    { label: "Niche fit", v: lead.score_fit },
    { label: "Local", v: lead.score_local },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-[12px] text-radar-faint">
        <Link href="/ops/leads" className="hover:text-radar-ink">Leads</Link>
        <span>/</span>
        <span className="text-radar-mute">{lead.business_name}</span>
      </div>

      {/* Header */}
      <div className="r-panel p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-extrabold tracking-tight">{lead.business_name}</h1>
              <StatusBadge status={lead.status as LeadStatus} />
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12.5px] text-radar-mute">
              <span>{NICHE_LABELS[lead.niche]}</span>
              <span>{lead.location_city}, {lead.location_state}</span>
              {lead.website_url ? (
                <a href={lead.website_url} target="_blank" rel="noreferrer" className="text-radar-cyan hover:underline">
                  {lead.website_url.replace(/^https?:\/\//, "")}
                </a>
              ) : (
                <span className="text-radar-rose">no website</span>
              )}
              {lead.email && <span>{lead.email}</span>}
              {lead.phone && <span className="font-mono">{formatPhone(lead.phone)}</span>}
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span className="r-chip">source: {lead.source_type}</span>
              {lead.offer_level_recommended && (
                <span className="r-chip">
                  offer: {lead.offer_level_recommended === 1 ? "Website Refresh" : "Growth System"}
                </span>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[11px] uppercase tracking-wide text-radar-faint">Fit score</div>
            <div className="font-mono text-4xl font-bold tabular-nums">
              <ScorePill score={lead.score_total} />
            </div>
          </div>
        </div>
        <div className="mt-4 border-t border-radar-line pt-4">
          <LeadActions leadId={lead.id} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Score breakdown */}
        <section className="r-panel p-5">
          <h2 className="text-sm font-bold">Score breakdown</h2>
          <div className="mt-4 space-y-2.5">
            {subScores.map((s) => (
              <div key={s.label} className="flex items-center gap-3">
                <span className="w-28 shrink-0 text-[12px] text-radar-mute">{s.label}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-radar-raised">
                  <div className="h-full rounded-full bg-radar-cyan" style={{ width: `${s.v ?? 0}%` }} />
                </div>
                <span className="w-8 text-right font-mono text-[12px] tabular-nums">{s.v ?? "—"}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Audit */}
        <section className="r-panel p-5">
          <h2 className="text-sm font-bold">Website audit</h2>
          {audit ? (
            <div className="mt-4 space-y-3">
              <div className="grid grid-cols-4 gap-2">
                {[
                  ["Overall", audit.website_score],
                  ["Mobile", audit.mobile_score],
                  ["CTA", audit.cta_score],
                  ["SEO", audit.seo_score],
                  ["Clarity", audit.clarity_score],
                  ["Trust", audit.trust_score],
                  ["Convert", audit.conversion_score],
                ].map(([label, v]) => (
                  <div key={label as string} className="rounded-md border border-radar-line bg-radar-raised px-2 py-1.5 text-center">
                    <div className="font-mono text-sm font-bold tabular-nums text-radar-ink">{v as number}</div>
                    <div className="text-[9.5px] uppercase tracking-wide text-radar-faint">{label as string}</div>
                  </div>
                ))}
              </div>
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wide text-radar-faint">Top problems</div>
                <ul className="mt-1.5 space-y-1">
                  {audit.top_problems.map((p, i) => (
                    <li key={i} className="flex gap-2 text-[12.5px] text-radar-mute">
                      <span className="text-radar-rose">▸</span>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
              <p className="text-[12.5px] leading-relaxed text-radar-mute">{audit.audit_summary}</p>
            </div>
          ) : (
            <p className="mt-4 text-[13px] text-radar-faint">Not audited yet.</p>
          )}
        </section>
      </div>

      {/* Demo */}
      <section className="r-panel p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold">Generated demo</h2>
          {demo && (
            <Link href={`/ops/demos/${demo.id}`} target="_blank" className="r-btn-primary">
              Open preview ↗
            </Link>
          )}
        </div>
        {demo ? (
          <div className="mt-3 grid gap-4 md:grid-cols-3">
            <div className="md:col-span-2">
              <div className="text-[13px] font-semibold text-radar-ink">{demo.demo_title}</div>
              <p className="mt-1 text-[12.5px] text-radar-mute">{demo.demo_summary}</p>
              <p className="mt-3 whitespace-pre-wrap text-[12.5px] leading-relaxed text-radar-mute">
                {demo.proposal_text}
              </p>
            </div>
            <div className="space-y-2">
              <div className="rounded-lg border border-radar-line bg-radar-raised p-3">
                <div className="text-[11px] uppercase tracking-wide text-radar-faint">Price range</div>
                <div className="mt-1 text-[13px] font-semibold text-radar-signal">{demo.price_range}</div>
              </div>
              <div className="rounded-lg border border-radar-line bg-radar-raised p-3">
                <div className="text-[11px] uppercase tracking-wide text-radar-faint">Type</div>
                <div className="mt-1 text-[13px] text-radar-ink">
                  {demo.offer_level === 1 ? "Website Refresh" : "Growth System"}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p className="mt-3 text-[13px] text-radar-faint">No demo generated yet.</p>
        )}
      </section>

      {/* Outreach + replies */}
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="r-panel p-5">
          <h2 className="text-sm font-bold">Outreach sequence</h2>
          <div className="mt-4 space-y-3">
            {messages.length === 0 && <p className="text-[13px] text-radar-faint">No messages sent.</p>}
            {messages.map((m) => (
              <div key={m.id} className="rounded-lg border border-radar-line bg-radar-raised p-3">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-semibold text-radar-ink">
                    {m.sequence_step >= 90 ? "Auto-reply" : `Step ${m.sequence_step} · ${m.channel}`}
                  </span>
                  <span className={clsx(
                    "font-mono text-[10.5px]",
                    m.send_status === "sent" || m.send_status === "simulated" ? "text-radar-signal" :
                    m.send_status === "queued" ? "text-radar-amber" : "text-radar-rose"
                  )}>
                    {m.send_status}
                  </span>
                </div>
                {m.subject && <div className="mt-1 text-[12px] font-medium text-radar-mute">{m.subject}</div>}
                <p className="mt-1.5 whitespace-pre-wrap text-[11.5px] leading-relaxed text-radar-faint line-clamp-6">
                  {m.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="r-panel p-5">
          <h2 className="text-sm font-bold">Replies</h2>
          <div className="mt-4 space-y-3">
            {replies.length === 0 && <p className="text-[13px] text-radar-faint">No replies.</p>}
            {replies.map((r) => (
              <div key={r.id} className="rounded-lg border border-radar-line bg-radar-raised p-3">
                <div className="flex items-center justify-between">
                  <span className="rounded border border-radar-line px-1.5 py-0.5 font-mono text-[10.5px] text-radar-cyan">
                    {r.reply_type}
                  </span>
                  <span className="text-[10.5px] text-radar-faint">{r.recommended_action}</span>
                </div>
                <p className="mt-2 text-[12px] italic text-radar-mute">&ldquo;{r.raw_reply}&rdquo;</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {lead.notes && (
        <section className="r-panel p-5">
          <h2 className="text-sm font-bold">Notes</h2>
          <p className="mt-2 whitespace-pre-wrap text-[12.5px] text-radar-mute">{lead.notes}</p>
        </section>
      )}
    </div>
  );
}

function formatPhone(p: string): string {
  const d = p.replace(/\D/g, "").slice(-10);
  return d.length === 10 ? `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}` : p;
}

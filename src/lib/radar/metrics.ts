import type { Lead, LeadStatus, Niche } from "@/lib/radar/types";
import { STATUSES } from "@/lib/radar/types";
import { getDb } from "@/lib/radar/db";
import { capabilities } from "@/lib/radar/config";

export interface DashboardMetrics {
  discovered: number;
  audited: number;
  demos: number;
  outreach_sent: number;
  replies: number;
  interested: number;
  booked: number;
  won: number;
  lost: number;
  bounce_rate: number;
  unsub_rate: number;
  pipeline_value: number;
  suppressed: number;
  status_counts: Record<LeadStatus, number>;
  niche_counts: { niche: Niche; count: number }[];
  capabilities: ReturnType<typeof capabilities>;
  total_leads: number;
  sends_total: number;
}

/** Expected setup value by recommended offer level (midpoint of the range). */
const OFFER_VALUE: Record<number, number> = { 1: 1000, 2: 3250 };

/** Probability a lead in a given stage eventually closes (rough pipeline model). */
const STAGE_PROB: Partial<Record<LeadStatus, number>> = {
  interested: 0.25,
  booked: 0.45,
  proposal_sent: 0.6,
  won: 1,
};

export async function computeMetrics(): Promise<DashboardMetrics> {
  const db = getDb();
  const leads = await db.list("leads");
  const messages = await db.list("outreach_messages");
  const replies = await db.list("replies");

  const status_counts = Object.fromEntries(STATUSES.map((s) => [s, 0])) as Record<
    LeadStatus,
    number
  >;
  const nicheMap = new Map<Niche, number>();
  let pipeline_value = 0;

  for (const l of leads) {
    status_counts[l.status] = (status_counts[l.status] ?? 0) + 1;
    nicheMap.set(l.niche, (nicheMap.get(l.niche) ?? 0) + 1);
    const prob = STAGE_PROB[l.status];
    if (prob) {
      pipeline_value += OFFER_VALUE[l.offer_level_recommended ?? 1] * prob;
    }
  }

  const coldSends = messages.filter(
    (m) => m.sequence_step < 90 && (m.send_status === "sent" || m.send_status === "simulated")
  );
  const bounces = messages.filter((m) => m.bounced).length;
  const unsubs = messages.filter((m) => m.unsubscribe_detected).length;
  const sendsTotal = coldSends.length;

  const reached = countReached(leads);

  return {
    total_leads: leads.length,
    discovered: leads.length,
    audited: leads.filter((l) => hasReached(l, "audited")).length,
    demos: leads.filter((l) => hasReached(l, "demo_generated")).length,
    outreach_sent: reached.outreach,
    replies: replies.length,
    interested: status_counts.interested + status_counts.booked + status_counts.proposal_sent,
    booked: status_counts.booked,
    won: status_counts.won,
    lost: status_counts.lost,
    bounce_rate: sendsTotal ? round(bounces / sendsTotal) : 0,
    unsub_rate: sendsTotal ? round(unsubs / sendsTotal) : 0,
    pipeline_value: Math.round(pipeline_value),
    suppressed: status_counts.suppressed + status_counts.opted_out,
    status_counts,
    niche_counts: [...nicheMap.entries()]
      .map(([niche, count]) => ({ niche, count }))
      .sort((a, b) => b.count - a.count),
    capabilities: capabilities(),
    sends_total: sendsTotal,
  };
}

// Rank of each status in the funnel — used to answer "has the lead reached X?".
const RANK: Record<LeadStatus, number> = Object.fromEntries(
  STATUSES.map((s, i) => [s, i])
) as Record<LeadStatus, number>;

// Terminal/branch statuses that still imply the lead was contacted.
const CONTACTED: LeadStatus[] = [
  "outreach_sent", "followup_1_sent", "followup_2_sent", "followup_3_sent",
  "replied", "interested", "booked", "proposal_sent", "won", "lost",
];

function hasReached(l: Lead, stage: LeadStatus): boolean {
  // Branch statuses (replied/interested/etc.) imply earlier funnel stages done.
  if (RANK[l.status] >= RANK[stage]) return true;
  if (stage === "audited")
    return CONTACTED.includes(l.status) || l.status === "scored" || l.status === "demo_generated";
  if (stage === "demo_generated") return CONTACTED.includes(l.status);
  return false;
}

function countReached(leads: Lead[]) {
  let outreach = 0;
  for (const l of leads) if (CONTACTED.includes(l.status)) outreach++;
  return { outreach };
}

function round(n: number): number {
  return Math.round(n * 1000) / 1000;
}

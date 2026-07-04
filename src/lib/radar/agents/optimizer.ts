import type { Lead, Niche, Reply } from "@/lib/radar/types";
import { getDb } from "@/lib/radar/db";
import { withRun } from "@/lib/radar/log";
import { getSettings, saveSettings, cityKey } from "@/lib/radar/settings";
import { clamp } from "@/lib/radar/util";

export interface OptimizerReport {
  totals: {
    sent: number;
    positive: number;
    negative: number;
    reply_rate: number;
    bounce_rate: number;
    unsub_rate: number;
  };
  by_niche: Record<string, { sent: number; positive: number; rate: number; priority: number }>;
  by_city: Record<string, { sent: number; positive: number; rate: number; priority: number }>;
  by_offer: Record<string, { won: number; interested: number; sent: number }>;
  adjustments: string[];
}

const POSITIVE = new Set(["interested", "pricing_request", "meeting_request"]);
const NEGATIVE = new Set(["unsubscribe", "complaint", "bounce", "not_interested"]);

/**
 * Loop 9 — Loop Optimizer Agent.
 *
 * Reads the full outcome history and retunes targeting: niches and cities that
 * reply get a priority multiplier > 1 (they'll score higher and be worked
 * first); those that bounce/opt out get damped. If global bounce/opt-out runs
 * hot, it raises selectivity a notch. All changes are persisted to settings and
 * feed straight back into the scorer.
 */
export async function runOptimizer(): Promise<OptimizerReport> {
  return withRun("optimizer", {}, async () => {
    const db = getDb();
    const settings = await getSettings();
    const leads = await db.list("leads");
    const messages = await db.list("outreach_messages");
    const replies = await db.list("replies");
    const leadById = new Map(leads.map((l) => [l.id, l]));

    const sentByLead = new Map<string, number>();
    for (const m of messages) {
      if ((m.send_status === "sent" || m.send_status === "simulated") && m.sequence_step < 90) {
        sentByLead.set(m.lead_id, (sentByLead.get(m.lead_id) ?? 0) + 1);
      }
    }

    const niche: Record<string, { sent: number; positive: number; negative: number }> = {};
    const city: Record<string, { sent: number; positive: number; negative: number }> = {};
    const ensure = (o: typeof niche, k: string) => (o[k] ??= { sent: 0, positive: 0, negative: 0 });

    // Attribute sends per niche/city.
    for (const [leadId, n] of sentByLead) {
      const l = leadById.get(leadId);
      if (!l) continue;
      ensure(niche, l.niche).sent += n;
      ensure(city, cityKey(l.location_city, l.location_state)).sent += n;
    }

    let positive = 0;
    let negative = 0;
    const countReply = (r: Reply, l: Lead) => {
      if (POSITIVE.has(r.reply_type)) {
        ensure(niche, l.niche).positive++;
        ensure(city, cityKey(l.location_city, l.location_state)).positive++;
        positive++;
      } else if (NEGATIVE.has(r.reply_type)) {
        ensure(niche, l.niche).negative++;
        ensure(city, cityKey(l.location_city, l.location_state)).negative++;
        negative++;
      }
    };
    for (const r of replies) {
      const l = leadById.get(r.lead_id);
      if (l) countReply(r, l);
    }

    const totalSent = [...sentByLead.values()].reduce((a, b) => a + b, 0);
    const bounces = messages.filter((m) => m.bounced).length;
    const unsubs = messages.filter((m) => m.unsubscribe_detected).length;

    // Compute new multipliers. Neutral is 1.0; reply lifts, negatives damp.
    const nicheOut: OptimizerReport["by_niche"] = {};
    const nichePriority: Partial<Record<Niche, number>> = { ...settings.niche_priority };
    for (const [k, s] of Object.entries(niche)) {
      const rate = s.sent ? s.positive / s.sent : 0;
      const damp = s.sent ? s.negative / s.sent : 0;
      const priority = clampMult(0.9 + rate * 1.2 - damp * 0.8);
      nichePriority[k as Niche] = priority;
      nicheOut[k] = { sent: s.sent, positive: s.positive, rate: round(rate), priority };
    }

    const cityOut: OptimizerReport["by_city"] = {};
    const cityPriority: Record<string, number> = { ...settings.city_priority };
    for (const [k, s] of Object.entries(city)) {
      const rate = s.sent ? s.positive / s.sent : 0;
      const damp = s.sent ? s.negative / s.sent : 0;
      const priority = clampMult(0.9 + rate * 1.2 - damp * 0.8);
      cityPriority[k] = priority;
      cityOut[k] = { sent: s.sent, positive: s.positive, rate: round(rate), priority };
    }

    // Offer-level performance.
    const byOffer: OptimizerReport["by_offer"] = {
      "1": { won: 0, interested: 0, sent: 0 },
      "2": { won: 0, interested: 0, sent: 0 },
    };
    for (const l of leads) {
      const key = String(l.offer_level_recommended ?? 1);
      if (!byOffer[key]) continue;
      if (sentByLead.has(l.id)) byOffer[key].sent++;
      if (l.status === "won") byOffer[key].won++;
      if (l.status === "interested" || l.status === "booked" || l.status === "proposal_sent")
        byOffer[key].interested++;
    }

    // Global selectivity nudge if we're burning goodwill.
    const bounceRate = totalSent ? bounces / totalSent : 0;
    const unsubRate = totalSent ? unsubs / totalSent : 0;
    const adjustments: string[] = [];
    const thresholds = { ...settings.thresholds };
    if (totalSent >= 20 && (bounceRate > 0.05 || unsubRate > 0.08)) {
      thresholds.build_audit = clamp(thresholds.build_audit + 2, 50, 85);
      adjustments.push(
        `High bounce/opt-out (${pct(bounceRate)}/${pct(unsubRate)}) → raised outreach threshold to ${thresholds.build_audit}.`
      );
    } else if (totalSent >= 30 && positive / Math.max(totalSent, 1) > 0.15 && thresholds.build_audit > 60) {
      thresholds.build_audit = clamp(thresholds.build_audit - 1, 60, 85);
      adjustments.push(`Healthy reply rate → loosened outreach threshold to ${thresholds.build_audit}.`);
    }

    // Reorder subject variants by a light heuristic (best niche rate first-ish).
    // With no per-variant attribution yet we keep order stable but note it.
    if (Object.keys(nicheOut).length) {
      const top = Object.entries(nicheOut).sort((a, b) => b[1].rate - a[1].rate)[0];
      if (top) adjustments.push(`Top-replying niche: ${top[0]} (${pct(top[1].rate)}).`);
    }

    await saveSettings({
      niche_priority: nichePriority,
      city_priority: cityPriority,
      thresholds,
    });

    const report: OptimizerReport = {
      totals: {
        sent: totalSent,
        positive,
        negative,
        reply_rate: round(totalSent ? (positive + negative) / totalSent : 0),
        bounce_rate: round(bounceRate),
        unsub_rate: round(unsubRate),
      },
      by_niche: nicheOut,
      by_city: cityOut,
      by_offer: byOffer,
      adjustments,
    };
    return { output: report as unknown as Record<string, unknown>, result: report };
  });
}

function clampMult(n: number): number {
  return Math.round(Math.max(0.7, Math.min(1.4, n)) * 100) / 100;
}
function round(n: number): number {
  return Math.round(n * 100) / 100;
}
function pct(n: number): string {
  return `${Math.round(n * 100)}%`;
}

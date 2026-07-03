import type { Audit, Lead, Niche, OfferLevel } from "@/lib/radar/types";
import { getDb } from "@/lib/radar/db";
import { withRun } from "@/lib/radar/log";
import { getSettings, cityKey, type RadarSettings } from "@/lib/radar/settings";
import { isSuppressed, latestAuditFor } from "@/lib/radar/repo";
import { clamp, daysFromNow, now } from "@/lib/radar/util";

/** What the loop should do next with a scored lead. */
export type ScorePlan = "demo" | "proposal" | "hold" | "archive" | "suppress";

export interface ScoreResult {
  lead: Lead;
  plan: ScorePlan;
  total: number;
}

/** Rough ability-to-pay by vertical (ticket size / margins). */
const BUDGET_TIER: Record<Niche, number> = {
  roofer: 90, hvac: 88, med_spa: 86, security: 82, concrete_paving: 80,
  electrician: 78, garage_door: 76, plumber: 74, pest_control: 70,
  landscaper: 68, auto_shop: 66, locksmith: 62, gym: 64,
  cleaning: 58, junk_removal: 56, mobile_detailing: 54, dog_grooming: 52,
};

/**
 * Loop 3 — Lead Scoring Agent.
 *
 * Turns an audit + contact data into a 0-100 fit score using the operator's
 * weights (need 25 / budget 15 / delivery 15 / contactability 15 / demo 15 /
 * fit 10 / local 5), applies the optimizer's niche & city multipliers, then
 * routes the lead by threshold.
 */
export async function scoreLead(lead: Lead): Promise<ScoreResult> {
  return withRun("scoring", { leadId: lead.id }, async () => {
    const db = getDb();
    const settings = await getSettings();
    const audit = await latestAuditFor(lead.id);

    const subs = computeSubScores(lead, audit, settings);
    const w = settings.scoring_weights;
    const weightSum =
      w.need + w.budget + w.delivery_ease + w.contactability + w.demo_potential + w.fit + w.local;

    let total =
      (subs.need * w.need +
        subs.budget * w.budget +
        subs.delivery_ease * w.delivery_ease +
        subs.contactability * w.contactability +
        subs.demo_potential * w.demo_potential +
        subs.fit * w.fit +
        subs.local * w.local) /
      (weightSum || 100);

    // Optimizer influence: learned priority multipliers nudge the ranking.
    const nicheMult = settings.niche_priority[lead.niche] ?? 1;
    const cityMult = settings.city_priority[cityKey(lead.location_city, lead.location_state)] ?? 1;
    total = clamp(Math.round(total * nicheMult * cityMult));

    const suppressed = await isSuppressed(lead);
    const offer: OfferLevel = audit?.recommended_solution ?? 1;
    const plan = decidePlan(total, settings, suppressed);

    const patch: Partial<Lead> = {
      score_need: subs.need,
      score_budget: subs.budget,
      score_delivery_ease: subs.delivery_ease,
      score_contactability: subs.contactability,
      score_demo_potential: subs.demo_potential,
      score_fit: subs.fit,
      score_local: subs.local,
      score_total: total,
      offer_level_recommended: offer,
      last_checked_at: now(),
    };

    if (plan === "suppress") {
      patch.status = "suppressed";
      patch.suppression_reason = lead.suppression_reason ?? "do_not_contact";
    } else if (plan === "archive") {
      patch.status = "archived";
      patch.notes = appendNote(lead.notes, `Archived: score ${total} < store threshold.`);
    } else if (plan === "hold") {
      patch.status = "scored";
      patch.next_action_at = daysFromNow(30);
      patch.notes = appendNote(lead.notes, `Stored for later: score ${total}.`);
    } else {
      patch.status = "scored";
      patch.next_action_at = now();
    }

    const updated = (await db.update("leads", lead.id, patch)) as Lead;
    return {
      output: { total, plan, subs, offer },
      result: { lead: updated, plan, total },
    };
  });
}

function computeSubScores(lead: Lead, audit: Audit | null, _settings: RadarSettings) {
  const website = audit?.website_score ?? (lead.website_url ? 55 : 5);
  const q = (lead.source_payload?._quality as Record<string, number> | undefined) ?? {};
  const reviews = Number(q.reviews ?? lead.source_payload?.review_count ?? 0);
  const years = Number(q.years_in_business ?? 8);

  // Need: the worse the site, the more they need us.
  const need = clamp(100 - website + (lead.website_url ? 0 : 10));

  // Budget: vertical tier, seasoned businesses and review volume signal spend.
  const budget = clamp(
    BUDGET_TIER[lead.niche] * 0.7 +
      Math.min(years, 20) * 1.0 +
      Math.min(reviews, 200) * 0.05
  );

  // Delivery ease: refreshes are quick; existing content helps.
  const offer = audit?.recommended_solution ?? 1;
  const delivery_ease = clamp((offer === 1 ? 82 : 66) + Math.min(reviews, 100) * 0.05);

  // Contactability: how many ways can we reach them, cleanly.
  const contactability = clamp(
    (lead.email ? 45 : 0) +
      (lead.contact_page_url ? 25 : 0) +
      (lead.phone ? 20 : 0) +
      (lead.website_url ? 10 : 0)
  );

  // Demo potential: dramatic before/after when need is high and there's a story.
  const demo_potential = clamp(need * 0.55 + (lead.website_url ? 35 : 45) - (audit ? 0 : 10));

  // Fit: is the niche one we target?
  const fit = _settings.target_niches.includes(lead.niche) ? 100 : 45;

  // Local: are they in a target city?
  const local = _settings.target_cities.some(
    (c) => c.city.toLowerCase() === lead.location_city.toLowerCase()
  )
    ? 100
    : 55;

  return { need, budget, delivery_ease, contactability, demo_potential, fit, local };
}

function decidePlan(
  total: number,
  s: RadarSettings,
  suppressed: boolean
): ScorePlan {
  if (suppressed) return "suppress";
  if (total >= s.thresholds.build_demo) return "demo";
  if (total >= s.thresholds.build_audit) return "proposal";
  if (total >= s.thresholds.store) return "hold";
  return "archive";
}

/** Public helper so downstream agents route the same way the scorer did. */
export function planForScore(total: number | null, s: RadarSettings): ScorePlan {
  if (total == null) return "hold";
  if (total >= s.thresholds.build_demo) return "demo";
  if (total >= s.thresholds.build_audit) return "proposal";
  if (total >= s.thresholds.store) return "hold";
  return "archive";
}

function appendNote(existing: string | null, line: string): string {
  return existing ? `${existing}\n${line}` : line;
}

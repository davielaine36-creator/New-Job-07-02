import type { Audit, Demo, DemoType, Lead, OfferLevel } from "@/lib/radar/types";
import { NICHE_LABELS } from "@/lib/radar/types";
import { getDb } from "@/lib/radar/db";
import { getAi } from "@/lib/radar/ai";
import { config } from "@/lib/radar/config";
import { withRun } from "@/lib/radar/log";
import { getSettings } from "@/lib/radar/settings";
import { latestAuditFor } from "@/lib/radar/repo";
import { id, now, seededRng, titleCase } from "@/lib/radar/util";
import { renderDemoHtml } from "./demo-html";

/**
 * Loop 4 — Demo Generator Agent.
 *
 * Produces a business-specific asset the outreach can link to:
 *   Level 1 → a refreshed homepage mockup (hero, services, CTA, reviews).
 *   Level 2 → a growth-system one-pager (audit, SEO/traffic plan, funnel,
 *             CRM + automation map, ads starter, reporting concept).
 * The copy is generated (mock or model); the layout is deterministic HTML so
 * every demo is a real, hostable preview page.
 */
export async function generateDemo(lead: Lead): Promise<Demo> {
  return withRun("demo", { leadId: lead.id }, async () => {
    const db = getDb();
    const ai = getAi();
    const settings = await getSettings();
    const audit = await latestAuditFor(lead.id);
    const offer: OfferLevel = lead.offer_level_recommended ?? audit?.recommended_solution ?? 1;
    const demoType: DemoType = offer === 2 ? "level2_growth" : "level1_refresh";
    const rand = seededRng("demo", lead.id);
    const accentHue = rand.int(0, 360);

    // Generated marketing copy (deterministic in mock).
    const copy = await ai.object<DemoCopy>({
      system:
        "You write crisp, non-hyperbolic marketing copy for local service businesses. No guarantees, no fake claims, no '#1 on Google' promises.",
      schemaHint:
        '{ "headline": string, "subhead": string, "services": string[4], "cta": string, "reviews": [{"name": string, "text": string}], "proposal": string }',
      prompt: `Create demo copy for ${lead.business_name}, a ${NICHE_LABELS[lead.niche]} business in ${lead.location_city}, ${lead.location_state}.
Offer: ${offer === 1 ? "Website Refresh" : "Growth System"}.
Top problems from audit: ${(audit?.top_problems ?? ["dated site"]).join("; ")}.
Reviews must be plausible and clearly illustrative (not attributed to real people). Proposal is 3-4 sentences, honest, specific to their gaps.`,
      mock: () => buildMockCopy(lead, audit, offer),
    });

    const html = renderDemoHtml({ lead, audit, offer, copy, accentHue });
    const priceRange =
      offer === 1
        ? `${settings.offers.level1.setup} setup · ${settings.offers.level1.monthly}`
        : `${settings.offers.level2.setup} setup · ${settings.offers.level2.retainer} retainer`;

    const demoId = id();
    const demo: Demo = {
      id: demoId,
      lead_id: lead.id,
      demo_type: demoType,
      offer_level: offer,
      demo_title:
        offer === 1
          ? `${lead.business_name} — Website Refresh Preview`
          : `${lead.business_name} — Growth System Plan`,
      demo_summary: copy.subhead,
      demo_html: html,
      demo_preview_url: `${config.baseUrl}/ops/demos/${demoId}`,
      proposal_text: copy.proposal,
      price_range: priceRange,
      status: "ready",
      created_at: now(),
    };

    await db.insert("demos", demo);
    await db.update("leads", lead.id, { status: "demo_generated", last_checked_at: now() });

    return {
      output: { demo_id: demoId, offer, preview_url: demo.demo_preview_url },
      result: demo,
    };
  });
}

export interface DemoCopy {
  headline: string;
  subhead: string;
  services: string[];
  cta: string;
  reviews: { name: string; text: string }[];
  proposal: string;
}

const SERVICE_SETS: Partial<Record<string, string[]>> = {
  hvac: ["AC Repair & Install", "Heating & Furnace", "Duct & Air Quality", "Maintenance Plans"],
  plumber: ["Emergency Plumbing", "Drain & Sewer", "Water Heaters", "Repiping & Leaks"],
  roofer: ["Roof Replacement", "Storm & Leak Repair", "Inspections", "Gutters"],
  cleaning: ["Recurring Cleaning", "Deep Cleans", "Move-In / Move-Out", "Commercial"],
  electrician: ["Panel Upgrades", "EV Chargers", "Lighting & Fixtures", "Troubleshooting"],
  landscaper: ["Design & Install", "Maintenance", "Irrigation", "Hardscape"],
  garage_door: ["Spring Repair", "New Doors", "Opener Install", "Same-Day Service"],
  security: ["Guard Services", "Alarm Response", "Camera Systems", "Access Control"],
};

function buildMockCopy(lead: Lead, audit: Audit | null, offer: OfferLevel): DemoCopy {
  const r = seededRng("copy", lead.id);
  const city = lead.location_city;
  const services =
    SERVICE_SETS[lead.niche] ??
    ["Free Estimates", "Same-Day Service", "Licensed & Insured", "Local & Trusted"];
  const reviewers = ["J. Martinez", "Dana R.", "The Okafor Family", "M. Chen", "Priya S."];
  const reviewLines = [
    `Showed up on time and fixed it right the first time. Highly recommend to anyone in ${city}.`,
    "Clear quote, no surprises, and the work was clean. Exactly what I wanted.",
    "Booked online in two minutes and they were out the next morning. Great crew.",
  ];
  return {
    headline:
      offer === 1
        ? `${titleCase(NICHE_LABELS[lead.niche])} in ${city}, done right.`
        : `More ${city} jobs for ${lead.business_name}.`,
    subhead:
      offer === 1
        ? `A faster, mobile-first site that turns visitors into booked ${NICHE_LABELS[lead.niche].toLowerCase()} jobs.`
        : `A website + local SEO + tracked funnel built to fill your calendar in ${city}.`,
    services,
    cta: r.pick(["Get a Free Quote", "Book Service Now", "Request an Estimate"]),
    reviews: r.sample(reviewers, 3).map((name, i) => ({ name, text: reviewLines[i] })),
    proposal:
      offer === 1
        ? `Right now ${lead.business_name} is losing ${city} jobs to competitors with clearer, faster sites — the audit flagged ${(audit?.top_problems ?? []).slice(0, 2).join(" and ") || "weak mobile UX and no quote path"}. This preview shows a mobile-first refresh with an obvious quote CTA, service clarity, and trust signals. Typical turnaround is 1-2 weeks; ${config.baseUrl ? "" : ""}pricing is transparent and fixed.`
        : `${lead.business_name} has a working presence but is under-marketed in ${city}. This plan pairs a refreshed site with local SEO, a single high-intent landing page, a tracked quote funnel, and simple monthly reporting — so you can see which jobs came from where. No guarantees on rankings; just a disciplined system and honest measurement.`,
  };
}

import type { Audit, Lead, OfferLevel } from "@/lib/radar/types";
import { getDb } from "@/lib/radar/db";
import { getAi } from "@/lib/radar/ai";
import { withRun } from "@/lib/radar/log";
import { clamp, id, now } from "@/lib/radar/util";

interface QualitySignals {
  has_site: boolean;
  mobile: number;
  speed: number;
  clarity: number;
  cta: number;
  seo: number;
  trust: number;
  reviews: number;
  conversion: number;
  mobile_friendly?: boolean;
  has_quote_form?: boolean;
}

const DIMENSIONS: {
  key: keyof QualitySignals;
  label: string;
  problem: string;
}[] = [
  { key: "mobile", label: "Mobile experience", problem: "Site is hard to use on a phone — most local searches are mobile" },
  { key: "speed", label: "Load speed", problem: "Slow page load; visitors bounce before the form loads" },
  { key: "clarity", label: "Clarity of services", problem: "Services and service area aren't clear above the fold" },
  { key: "cta", label: "Call-to-action", problem: "Weak or missing call/quote CTA — visitors don't know the next step" },
  { key: "seo", label: "Local SEO", problem: "Thin local SEO: no city/service structure, weak on 'near me' searches" },
  { key: "trust", label: "Trust signals", problem: "Few trust signals — no reviews, badges, or guarantees near the CTA" },
  { key: "conversion", label: "Conversion path", problem: "No fast quote/booking path; leads leak to competitors" },
];

/**
 * Loop 2 — Website Audit Agent.
 *
 * Scores the lead's web presence across the dimensions the offers address.
 * Mock mode reads the source's hidden quality signals (deterministic);
 * live mode fetches the page and asks the model to score it. Either way it
 * emits a website score, the top 3 problems, a recommended offer level, and a
 * short human-readable summary.
 */
export async function auditLead(lead: Lead): Promise<Audit> {
  return withRun("audit", { leadId: lead.id, input: { website: lead.website_url } }, async () => {
    const db = getDb();
    const ai = getAi();
    const q = readSignals(lead);

    // Live-mode context: a best-effort peek at the real page for the model.
    let pageContext = "";
    if (ai.kind === "anthropic" && lead.website_url) {
      pageContext = await peekPage(lead.website_url);
    }

    const audit = await ai.object<Audit>({
      system:
        "You are a conversion-focused web auditor for local service businesses. Be concrete and fair. Never invent metrics you can't observe.",
      schemaHint:
        '{ "website_score": 0-100, "mobile_score": 0-100, "clarity_score": 0-100, "cta_score": 0-100, "seo_score": 0-100, "trust_score": 0-100, "conversion_score": 0-100, "speed_observation": string, "top_problems": string[3], "recommended_solution": 1|2, "audit_summary": string }',
      prompt: `Audit this business for a website/growth pitch.
Business: ${lead.business_name} (${lead.niche}) in ${lead.location_city}, ${lead.location_state}
Website: ${lead.website_url ?? "NONE FOUND"}
${pageContext ? `Page excerpt:\n${pageContext}` : ""}
Return the JSON described. recommended_solution: 1 (Website Refresh) if there is no site or the site is weak/outdated; 2 (Growth System) if the site is decent but they need SEO/traffic/leads.`,
      mock: () => buildMockAudit(lead, q),
    });

    // Normalize + persist (the model result is trusted only within bounds).
    const row: Audit = {
      id: id(),
      lead_id: lead.id,
      website_score: clamp(audit.website_score),
      mobile_score: clamp(audit.mobile_score),
      clarity_score: clamp(audit.clarity_score),
      cta_score: clamp(audit.cta_score),
      seo_score: clamp(audit.seo_score),
      trust_score: clamp(audit.trust_score),
      conversion_score: clamp(audit.conversion_score),
      speed_observation: audit.speed_observation,
      top_problems: audit.top_problems.slice(0, 3),
      recommended_solution: (audit.recommended_solution === 2 ? 2 : 1) as OfferLevel,
      audit_summary: audit.audit_summary,
      created_at: now(),
    };
    await db.insert("audits", row);
    await db.update("leads", lead.id, {
      status: "audited",
      last_checked_at: now(),
      offer_level_recommended: row.recommended_solution,
    });

    return { output: { website_score: row.website_score, offer: row.recommended_solution }, result: row };
  });
}

function readSignals(lead: Lead): QualitySignals {
  const raw = (lead.source_payload?._quality as QualitySignals | undefined) ?? null;
  if (raw) return raw;
  // Unknown source without embedded signals: infer a neutral baseline.
  const hasSite = Boolean(lead.website_url);
  const base = hasSite ? 55 : 5;
  return {
    has_site: hasSite,
    mobile: base,
    speed: base,
    clarity: base,
    cta: base,
    seo: base - 10,
    trust: base - 5,
    reviews: 20,
    conversion: base - 10,
  };
}

function buildMockAudit(lead: Lead, q: QualitySignals): Audit {
  if (!q.has_site) {
    return {
      id: "",
      lead_id: lead.id,
      website_score: 6,
      mobile_score: 0,
      clarity_score: 8,
      cta_score: 0,
      seo_score: 6,
      trust_score: 4,
      conversion_score: 0,
      speed_observation: "No website found in search or directory listings.",
      top_problems: [
        "No website — the business is nearly invisible in local 'near me' search",
        "No online way to request a quote; every lead depends on catching the phone",
        "Competitors with even a basic site are winning these jobs by default",
      ],
      recommended_solution: 1,
      audit_summary: `${lead.business_name} has no discoverable website. A clean, mobile-first site with a quote form and reviews would move them from invisible to bookable — a textbook Website Refresh.`,
      created_at: "",
    };
  }

  const website_score = clamp(
    Math.round(
      (q.mobile + q.speed + q.clarity + q.cta + q.seo + q.trust + q.conversion) / 7
    )
  );
  const ranked = [...DIMENSIONS].sort(
    (a, b) => (q[a.key] as number) - (q[b.key] as number)
  );
  const top_problems = ranked.slice(0, 3).map((d) => d.problem);

  // Decent-but-underperforming site → Growth System; weak/outdated → Refresh.
  const recommended: OfferLevel =
    website_score >= 50 && q.seo < 62 && (q.mobile_friendly ?? q.mobile > 45)
      ? 2
      : 1;

  return {
    id: "",
    lead_id: lead.id,
    website_score,
    mobile_score: clamp(q.mobile),
    clarity_score: clamp(q.clarity),
    cta_score: clamp(q.cta),
    seo_score: clamp(q.seo),
    trust_score: clamp(q.trust),
    conversion_score: clamp(q.conversion),
    speed_observation:
      q.speed < 45
        ? "Feels sluggish; likely unoptimized images and render-blocking scripts."
        : "Loads acceptably, though there's headroom on images and caching.",
    top_problems,
    recommended_solution: recommended,
    audit_summary:
      recommended === 1
        ? `${lead.business_name}'s site is dated and leaks leads — weakest on ${ranked[0].label.toLowerCase()} and ${ranked[1].label.toLowerCase()}. A Website Refresh with a real quote path is the fastest win.`
        : `${lead.business_name} has a functional site but is under-marketed — thin ${ranked[0].label.toLowerCase()} and ${ranked[1].label.toLowerCase()}. A Growth System (SEO + landing page + tracked funnel) is the right next step.`,
    created_at: "",
  };
}

/** Best-effort page fetch for live-mode audits. Never throws. */
async function peekPage(url: string): Promise<string> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "AIWorkRadar-Auditor/1.0 (+https://aiworkradar.com)" },
      signal: AbortSignal.timeout(8000),
    });
    const html = await res.text();
    return html
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 2500);
  } catch {
    return "(could not fetch page)";
  }
}

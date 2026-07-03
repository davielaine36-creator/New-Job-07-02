import type { Lead, Niche } from "@/lib/radar/types";
import { getDb } from "@/lib/radar/db";
import { getSource } from "@/lib/radar/sources";
import { withRun } from "@/lib/radar/log";
import { allLeads } from "@/lib/radar/repo";
import { domainOf, id, normalizePhone, now } from "@/lib/radar/util";

export interface DiscoveryInput {
  niche: Niche;
  city: string;
  state: string;
  limit?: number;
}

export interface DiscoveryResult {
  found: number;
  inserted: number;
  duplicates: number;
  leads: Lead[];
}

/**
 * Loop 1 — Lead Discovery Agent.
 *
 * Pulls prospective businesses from the active source (mock or Google Places),
 * dedupes against everything already in the CRM (domain, phone, business name),
 * and inserts survivors as `discovered`. Source type + URL are always recorded
 * for provenance. It never scrapes Google Maps HTML — see the Places adapter.
 */
export async function runDiscovery(
  input: DiscoveryInput
): Promise<DiscoveryResult> {
  return withRun("discovery", { input: { ...input } }, async () => {
    const db = getDb();
    const source = getSource();
    const found = await source.discover({
      niche: input.niche,
      city: input.city,
      state: input.state,
      limit: input.limit ?? 12,
    });

    const existing = await allLeads();
    const domains = new Set(
      existing.map((l) => domainOf(l.website_url) ?? domainOf(l.email)).filter(Boolean)
    );
    const phones = new Set(
      existing.map((l) => normalizePhone(l.phone)).filter(Boolean)
    );
    const names = new Set(
      existing.map((l) => `${l.business_name.toLowerCase()}|${l.location_city.toLowerCase()}`)
    );

    const fresh: Lead[] = [];
    let duplicates = 0;

    for (const b of found) {
      const domain = domainOf(b.website_url) ?? domainOf(b.email);
      const phone = normalizePhone(b.phone);
      const nameKey = `${b.business_name.toLowerCase()}|${b.location_city.toLowerCase()}`;

      if (
        (domain && domains.has(domain)) ||
        (phone && phones.has(phone)) ||
        names.has(nameKey)
      ) {
        duplicates++;
        continue;
      }
      if (domain) domains.add(domain);
      if (phone) phones.add(phone);
      names.add(nameKey);

      fresh.push({
        id: id(),
        business_name: b.business_name,
        niche: b.niche,
        location_city: b.location_city,
        location_state: b.location_state,
        website_url: b.website_url,
        phone: b.phone,
        email: b.email,
        contact_page_url: b.contact_page_url,
        source_type: b.source_type,
        source_url: b.source_url,
        source_payload: b.source_payload,
        discovered_at: now(),
        last_checked_at: null,
        status: "discovered",
        score_total: null,
        score_need: null,
        score_budget: null,
        score_delivery_ease: null,
        score_contactability: null,
        score_demo_potential: null,
        score_fit: null,
        score_local: null,
        offer_level_recommended: null,
        do_not_contact: false,
        suppression_reason: null,
        next_action_at: null,
        notes: null,
      });
    }

    if (fresh.length) await db.insertMany("leads", fresh);

    return {
      output: {
        found: found.length,
        inserted: fresh.length,
        duplicates,
        source: source.kind,
      },
      result: {
        found: found.length,
        inserted: fresh.length,
        duplicates,
        leads: fresh,
      },
    };
  });
}

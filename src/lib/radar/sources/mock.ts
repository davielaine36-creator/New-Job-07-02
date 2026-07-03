import type { Niche } from "@/lib/radar/types";
import { NICHE_LABELS } from "@/lib/radar/types";
import { seededRng, slugify, domainOf } from "@/lib/radar/util";
import type { DiscoveryQuery, LeadSource, RawBusiness } from "./index";

/**
 * Mock lead source — generates a *stable* pool of plausible local businesses
 * per (niche, city). Re-running discovery returns the same pool, so the
 * dedupe logic in the discovery agent is exercised realistically instead of
 * inventing infinite new companies.
 *
 * Each business carries a hidden `_quality` block in `source_payload`. In mock
 * mode the Website Audit agent reads it (rather than crawling a real page), so
 * scores are deterministic and the full loop is reproducible.
 */
const PREFIXES = [
  "Coastal", "Bayside", "Summit", "Pacific", "Golden State", "Anchor",
  "Reliable", "Precision", "Frontline", "Evergreen", "Sunbelt", "Metro",
  "TrueLine", "Cardinal", "Harbor", "Vantage", "Ironwood", "Blue Sky",
];
const SUFFIXES = ["Co.", "Services", "& Sons", "Pros", "Group", "LLC", "Inc.", "Solutions"];

const NICHE_NOUN: Record<Niche, string> = {
  hvac: "HVAC & Air",
  plumber: "Plumbing",
  roofer: "Roofing",
  cleaning: "Cleaning",
  security: "Security",
  electrician: "Electric",
  landscaper: "Landscaping",
  pest_control: "Pest Control",
  junk_removal: "Junk Removal",
  garage_door: "Garage Door",
  locksmith: "Locksmith",
  mobile_detailing: "Auto Detailing",
  auto_shop: "Auto Repair",
  concrete_paving: "Concrete",
  gym: "Fitness",
  med_spa: "Med Spa",
  dog_grooming: "Grooming",
};

const POOL_PER_CITY = 14;

export class MockSource implements LeadSource {
  readonly kind = "mock" as const;

  async discover(q: DiscoveryQuery): Promise<RawBusiness[]> {
    const out: RawBusiness[] = [];
    for (let i = 0; i < POOL_PER_CITY && out.length < q.limit; i++) {
      out.push(this.make(q.niche, q.city, q.state, i));
    }
    return out;
  }

  private make(
    niche: Niche,
    city: string,
    state: string,
    i: number
  ): RawBusiness {
    const r = seededRng("biz", niche, city, i);
    const prefix = r.pick(PREFIXES);
    const suffix = r.pick(SUFFIXES);
    const name = `${prefix} ${NICHE_NOUN[niche]} ${suffix}`.replace(/\s+/g, " ");

    // Web presence distribution: ~18% have no site at all (great Level-1 lead),
    // the rest range from crude to decent.
    const hasSite = !r.bool(0.18);
    const slug = slugify(`${prefix}-${NICHE_LABELS[niche]}`);
    const tld = r.pick([".com", ".net", ".biz", ".co"]);
    const website = hasSite ? `https://${slug}${tld}` : null;

    // Hidden quality signals (0-100). No-site businesses score near zero.
    const base = hasSite ? r.int(20, 92) : 5;
    const quality = {
      has_site: hasSite,
      mobile: hasSite ? clamp(base + r.int(-25, 15)) : 0,
      speed: hasSite ? clamp(base + r.int(-30, 20)) : 0,
      clarity: hasSite ? clamp(base + r.int(-20, 20)) : 8,
      cta: hasSite ? clamp(base + r.int(-35, 10)) : 0,
      seo: hasSite ? clamp(base + r.int(-30, 15)) : 6,
      trust: hasSite ? clamp(base + r.int(-25, 20)) : 4,
      reviews: r.int(0, 100),
      conversion: hasSite ? clamp(base + r.int(-30, 10)) : 0,
      years_in_business: r.int(1, 34),
      has_quote_form: hasSite && r.bool(0.4),
      mobile_friendly: hasSite && r.bool(base > 55 ? 0.8 : 0.3),
    };

    const hasEmail = r.bool(0.45);
    const email = hasEmail
      ? `info@${domainOf(website) ?? `${slug}${tld}`.replace(/^https?:\/\//, "")}`
      : null;
    const contactPage = hasSite && r.bool(0.6) ? `${website}/contact` : null;

    return {
      business_name: name,
      niche,
      location_city: city,
      location_state: state,
      website_url: website,
      phone: `+1${r.int(2, 9)}${r.int(0, 9)}${r.int(0, 9)}${r.int(200, 999)}${r.int(1000, 9999)}`,
      email,
      contact_page_url: contactPage,
      source_type: "mock",
      source_url: website ?? `mock://directory/${niche}/${slugify(city)}/${i}`,
      source_payload: {
        query: `${NICHE_LABELS[niche]} ${city} ${state}`,
        rating: Number((r.int(30, 50) / 10).toFixed(1)),
        review_count: quality.reviews,
        _quality: quality,
      },
    };
  }
}

function clamp(n: number) {
  return Math.max(0, Math.min(100, n));
}

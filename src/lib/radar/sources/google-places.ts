import type { Niche } from "@/lib/radar/types";
import { NICHE_LABELS } from "@/lib/radar/types";
import type { DiscoveryQuery, LeadSource, RawBusiness } from "./index";

/**
 * Google Places (New) Text Search adapter.
 *
 * COMPLIANCE: this uses the official Places API — it never scrapes Google Maps
 * HTML, and it stores only fields the Places terms permit us to retain
 * (name, address, phone, website). Contact-page discovery beyond `websiteUri`
 * is intentionally not attempted here; that belongs to a separate, opt-in
 * enrichment step against the business's own site.
 *
 * Wire it up by setting RADAR_MODE=live and GOOGLE_PLACES_API_KEY.
 */
export class GooglePlacesSource implements LeadSource {
  readonly kind = "google_places" as const;
  constructor(private apiKey: string) {}

  async discover(q: DiscoveryQuery): Promise<RawBusiness[]> {
    const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": this.apiKey,
        "X-Goog-FieldMask":
          "places.id,places.displayName,places.nationalPhoneNumber,places.websiteUri,places.rating,places.userRatingCount,places.formattedAddress",
      },
      body: JSON.stringify({
        textQuery: `${NICHE_LABELS[q.niche]} in ${q.city}, ${q.state}`,
        maxResultCount: Math.min(q.limit, 20),
      }),
    });
    if (!res.ok) {
      throw new Error(`Places API ${res.status}: ${await res.text().catch(() => "")}`);
    }
    const data = (await res.json()) as {
      places?: {
        id: string;
        displayName?: { text?: string };
        nationalPhoneNumber?: string;
        websiteUri?: string;
        rating?: number;
        userRatingCount?: number;
        formattedAddress?: string;
      }[];
    };

    return (data.places ?? []).map((p) => ({
      business_name: p.displayName?.text ?? "Unknown business",
      niche: q.niche,
      location_city: q.city,
      location_state: q.state,
      website_url: p.websiteUri ?? null,
      phone: p.nationalPhoneNumber ?? null,
      email: null, // never fabricated; enrichment is a separate opt-in step
      contact_page_url: null,
      source_type: "google_places",
      source_url: `https://www.google.com/maps/place/?q=place_id:${p.id}`,
      source_payload: {
        place_id: p.id,
        rating: p.rating ?? null,
        review_count: p.userRatingCount ?? null,
        formatted_address: p.formattedAddress ?? null,
      },
    }));
  }
}

import type { Niche, SourceType } from "@/lib/radar/types";
import { config } from "@/lib/radar/config";
import { MockSource } from "./mock";
import { GooglePlacesSource } from "./google-places";

/** One prospective business as returned by a source, pre-dedupe/pre-insert. */
export interface RawBusiness {
  business_name: string;
  niche: Niche;
  location_city: string;
  location_state: string;
  website_url: string | null;
  phone: string | null;
  email: string | null;
  contact_page_url: string | null;
  source_type: SourceType;
  source_url: string | null;
  source_payload: Record<string, unknown> | null;
}

export interface DiscoveryQuery {
  niche: Niche;
  city: string;
  state: string;
  limit: number;
}

export interface LeadSource {
  readonly kind: SourceType;
  discover(q: DiscoveryQuery): Promise<RawBusiness[]>;
}

export function getSource(): LeadSource {
  if (config.mode === "live" && config.places.key) {
    return new GooglePlacesSource(config.places.key);
  }
  return new MockSource();
}

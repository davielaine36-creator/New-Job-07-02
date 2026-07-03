import type { LeadStatus, Niche } from "@/lib/radar/types";
import { NICHES } from "@/lib/radar/types";
import { getDb } from "@/lib/radar/db";
import { config } from "@/lib/radar/config";
import { id, now } from "@/lib/radar/util";

/**
 * Operator-tunable settings. Persisted as a single row in `system_settings`
 * (key = "radar"). The Loop Optimizer agent updates the priority/weight blocks
 * in place; the Settings page edits identity/limits/offers.
 */
export interface SenderIdentity {
  from_name: string;
  from_email: string;
  company_name: string;
  physical_address: string; // required by CAN-SPAM
  reply_to: string;
  signature: string;
}

export interface ScoringWeights {
  need: number;
  budget: number;
  delivery_ease: number;
  contactability: number;
  demo_potential: number;
  fit: number;
  local: number;
}

export interface RadarSettings {
  autonomous_mode: boolean;
  target_niches: Niche[];
  target_cities: { city: string; state: string }[];
  thresholds: {
    build_demo: number; // >= → full demo + outreach
    build_audit: number; // >= → audit/proposal + outreach
    store: number; // >= → keep for later
    // below `store` → archived
  };
  daily_send_limit: number;
  sequence_days: [number, number, number, number]; // day offsets for step 0..3
  sender: SenderIdentity;
  unsubscribe_text: string;
  booking_link: string;
  offers: {
    level1: { setup: string; monthly: string };
    level2: { setup: string; retainer: string };
  };
  scoring_weights: ScoringWeights;
  /** Optimizer-maintained multipliers (1.0 = neutral). */
  niche_priority: Partial<Record<Niche, number>>;
  city_priority: Record<string, number>;
  /** Winning subject-line variants, most-effective first. */
  subject_variants: string[];
}

export const DEFAULT_SETTINGS: RadarSettings = {
  autonomous_mode: config.autonomous,
  target_niches: [
    "hvac",
    "plumber",
    "roofer",
    "cleaning",
    "electrician",
    "landscaper",
    "garage_door",
    "security",
  ],
  target_cities: [
    { city: "San Diego", state: "CA" },
    { city: "Chula Vista", state: "CA" },
    { city: "El Cajon", state: "CA" },
    { city: "La Mesa", state: "CA" },
    { city: "Oceanside", state: "CA" },
    { city: "Carlsbad", state: "CA" },
    { city: "Escondido", state: "CA" },
  ],
  thresholds: { build_demo: 80, build_audit: 65, store: 50 },
  daily_send_limit: 40,
  sequence_days: [0, 3, 7, 14],
  sender: {
    from_name: "Alex Rivera",
    from_email: "alex@aiworkradar.com",
    company_name: "AI Work Radar Studio",
    physical_address: "123 Market St, Suite 400, San Diego, CA 92101",
    reply_to: "alex@aiworkradar.com",
    signature: "Alex Rivera · AI Work Radar Studio",
  },
  unsubscribe_text:
    "Not a fit? Reply STOP or click here and I won't email again: {{unsubscribe_url}}",
  booking_link: "https://cal.com/aiworkradar/intro",
  offers: {
    level1: { setup: "$500–$1,500", monthly: "$99–$199/mo" },
    level2: { setup: "$1,500–$5,000", retainer: "$300–$1,500/mo" },
  },
  scoring_weights: {
    need: 25,
    budget: 15,
    delivery_ease: 15,
    contactability: 15,
    demo_potential: 15,
    fit: 10,
    local: 5,
  },
  niche_priority: {},
  city_priority: {},
  subject_variants: [
    "Quick idea for {{business}}'s website",
    "{{business}} — found 3 things costing you calls",
    "Faster quote form for {{business}}?",
  ],
};

const KEY = "radar";

export async function getSettings(): Promise<RadarSettings> {
  const db = getDb();
  const row = await db.get("system_settings", KEY);
  if (!row) return DEFAULT_SETTINGS;
  // Merge so newly-added fields get defaults even for old rows.
  return deepMerge(DEFAULT_SETTINGS, row.value as Partial<RadarSettings>);
}

export async function saveSettings(
  patch: Partial<RadarSettings>
): Promise<RadarSettings> {
  const db = getDb();
  const current = await getSettings();
  const next = deepMerge(current, patch);
  const existing = await db.get("system_settings", KEY);
  if (existing) {
    await db.update("system_settings", KEY, { value: next, updated_at: now() });
  } else {
    await db.insert("system_settings", {
      id: KEY,
      key: KEY,
      value: next,
      updated_at: now(),
    });
  }
  return next;
}

/** Effective niche priority ordering (optimizer multipliers applied). */
export function orderedNiches(s: RadarSettings): Niche[] {
  return [...s.target_niches].sort(
    (a, b) => (s.niche_priority[b] ?? 1) - (s.niche_priority[a] ?? 1)
  );
}

export function cityKey(city: string, state: string) {
  return `${city}, ${state}`;
}

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function deepMerge<T>(base: T, patch: Partial<T>): T {
  if (!isObject(base) || !isObject(patch)) return (patch ?? base) as T;
  const out: Record<string, unknown> = { ...base };
  for (const [k, v] of Object.entries(patch)) {
    const bv = (base as Record<string, unknown>)[k];
    out[k] = isObject(bv) && isObject(v) ? deepMerge(bv, v) : v;
  }
  return out as T;
}

// Re-export for consumers that model status transitions off settings.
export type { LeadStatus };
export { NICHES };

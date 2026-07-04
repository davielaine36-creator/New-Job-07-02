/**
 * AI Work Radar — domain model.
 *
 * These types mirror the Supabase schema in `supabase/migrations` 1:1 so the
 * mock store and the real database are interchangeable. Everything the agents
 * read or write flows through the shapes below.
 */

// ── Enumerations ──────────────────────────────────────────────────────────

/** Target verticals. Ordering is used as a default niche priority. */
export const NICHES = [
  "hvac",
  "plumber",
  "roofer",
  "cleaning",
  "security",
  "electrician",
  "landscaper",
  "pest_control",
  "junk_removal",
  "garage_door",
  "locksmith",
  "mobile_detailing",
  "auto_shop",
  "concrete_paving",
  "gym",
  "med_spa",
  "dog_grooming",
] as const;
export type Niche = (typeof NICHES)[number];

export const NICHE_LABELS: Record<Niche, string> = {
  hvac: "HVAC",
  plumber: "Plumbing",
  roofer: "Roofing",
  cleaning: "Cleaning",
  security: "Security",
  electrician: "Electrical",
  landscaper: "Landscaping",
  pest_control: "Pest Control",
  junk_removal: "Junk Removal",
  garage_door: "Garage Door",
  locksmith: "Locksmith",
  mobile_detailing: "Mobile Detailing",
  auto_shop: "Auto Shop",
  concrete_paving: "Concrete / Paving",
  gym: "Gym",
  med_spa: "Med Spa",
  dog_grooming: "Dog Grooming",
};

/** The full pipeline. Order here is the canonical funnel order for the board. */
export const STATUSES = [
  "discovered",
  "audited",
  "scored",
  "demo_generated",
  "outreach_sent",
  "followup_1_sent",
  "followup_2_sent",
  "followup_3_sent",
  "replied",
  "interested",
  "booked",
  "proposal_sent",
  "won",
  "lost",
  "bounced",
  "opted_out",
  "suppressed",
  "archived",
] as const;
export type LeadStatus = (typeof STATUSES)[number];

export const STATUS_LABELS: Record<LeadStatus, string> = {
  discovered: "Discovered",
  audited: "Audited",
  scored: "Scored",
  demo_generated: "Demo Generated",
  outreach_sent: "Outreach Sent",
  followup_1_sent: "Follow-Up 1 Sent",
  followup_2_sent: "Follow-Up 2 Sent",
  followup_3_sent: "Follow-Up 3 Sent",
  replied: "Replied",
  interested: "Interested",
  booked: "Booked",
  proposal_sent: "Proposal Sent",
  won: "Won",
  lost: "Lost",
  bounced: "Bounced",
  opted_out: "Opted Out",
  suppressed: "Suppressed",
  archived: "Archived",
};

/** Terminal states — the loop never re-touches a lead here. */
export const TERMINAL_STATUSES: LeadStatus[] = [
  "won",
  "lost",
  "bounced",
  "opted_out",
  "suppressed",
  "archived",
];

export type OfferLevel = 1 | 2;

export const OFFER_LABELS: Record<OfferLevel, string> = {
  1: "Website Refresh",
  2: "Growth System",
};

export type Channel = "email" | "contact_form" | "linkedin";

export type OutreachStatus =
  | "queued"
  | "sent"
  | "simulated"
  | "failed"
  | "skipped";

export type ReplyType =
  | "interested"
  | "pricing_request"
  | "meeting_request"
  | "question"
  | "not_interested"
  | "unsubscribe"
  | "complaint"
  | "wrong_person"
  | "bounce";

export type SourceType =
  | "mock"
  | "google_places"
  | "public_directory"
  | "license_registry"
  | "manual_import"
  | "web_search";

export type DemoType = "level1_refresh" | "level2_growth";

export type AgentName =
  | "discovery"
  | "audit"
  | "scoring"
  | "demo"
  | "outreach"
  | "compliance"
  | "reply_classifier"
  | "optimizer";

export type AgentRunStatus = "ok" | "error" | "skipped";

// ── Rows ──────────────────────────────────────────────────────────────────

export interface Lead {
  id: string;
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
  discovered_at: string;
  last_checked_at: string | null;
  status: LeadStatus;
  score_total: number | null;
  score_need: number | null;
  score_budget: number | null;
  score_delivery_ease: number | null;
  score_contactability: number | null;
  score_demo_potential: number | null;
  score_fit: number | null;
  score_local: number | null;
  offer_level_recommended: OfferLevel | null;
  do_not_contact: boolean;
  suppression_reason: string | null;
  next_action_at: string | null;
  notes: string | null;
}

export interface Audit {
  id: string;
  lead_id: string;
  website_score: number;
  mobile_score: number;
  clarity_score: number;
  cta_score: number;
  seo_score: number;
  trust_score: number;
  conversion_score: number;
  speed_observation: string;
  top_problems: string[];
  recommended_solution: OfferLevel;
  audit_summary: string;
  created_at: string;
}

export interface Demo {
  id: string;
  lead_id: string;
  demo_type: DemoType;
  offer_level: OfferLevel;
  demo_title: string;
  demo_summary: string;
  demo_html: string;
  demo_preview_url: string | null;
  proposal_text: string;
  price_range: string;
  status: "draft" | "ready" | "shared";
  created_at: string;
}

export interface OutreachMessage {
  id: string;
  lead_id: string;
  channel: Channel;
  subject: string | null;
  body: string;
  send_status: OutreachStatus;
  sent_at: string | null;
  sequence_step: number; // 0 = first touch, 1..3 = follow-ups
  reply_detected: boolean;
  bounced: boolean;
  unsubscribe_detected: boolean;
  complaint_detected: boolean;
  created_at: string;
}

export interface Reply {
  id: string;
  lead_id: string;
  raw_reply: string;
  reply_type: ReplyType;
  summary: string;
  recommended_action: string;
  handled: boolean;
  created_at: string;
}

export interface SuppressionEntry {
  id: string;
  email: string | null;
  domain: string | null;
  phone: string | null;
  business_name: string | null;
  reason: string;
  created_at: string;
}

export interface AgentRun {
  id: string;
  agent_name: AgentName;
  lead_id: string | null;
  input: Record<string, unknown> | null;
  output: Record<string, unknown> | null;
  status: AgentRunStatus;
  error: string | null;
  duration_ms: number | null;
  created_at: string;
}

export interface SystemSetting {
  id: string;
  key: string;
  value: unknown;
  updated_at: string;
}

// ── Table registry (keeps mock + supabase adapters in lockstep) ───────────

export interface Tables {
  leads: Lead;
  audits: Audit;
  demos: Demo;
  outreach_messages: OutreachMessage;
  replies: Reply;
  suppression_list: SuppressionEntry;
  agent_runs: AgentRun;
  system_settings: SystemSetting;
}

export type TableName = keyof Tables;

export const TABLE_NAMES: TableName[] = [
  "leads",
  "audits",
  "demos",
  "outreach_messages",
  "replies",
  "suppression_list",
  "agent_runs",
  "system_settings",
];

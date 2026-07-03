-- ═══════════════════════════════════════════════════════════════════════════
-- AI Work Radar — initial schema
--
-- Mirrors src/lib/radar/types.ts 1:1 so the mock store and Supabase are
-- interchangeable. IDs are text (the app supplies UUID strings and a couple of
-- well-known keys like "radar" / "discovery_cursor"). Payloads are jsonb.
--
-- Apply with the Supabase MCP (apply_migration) or:  supabase db push
-- Access is via the service role (PostgREST), which bypasses RLS. If you expose
-- these tables to the browser, add RLS policies first.
-- ═══════════════════════════════════════════════════════════════════════════

create extension if not exists pgcrypto;

-- ── leads ──────────────────────────────────────────────────────────────────
create table if not exists public.leads (
  id                        text primary key,
  business_name             text not null,
  niche                     text not null,
  location_city             text not null,
  location_state            text not null,
  website_url               text,
  phone                     text,
  email                     text,
  contact_page_url          text,
  source_type               text not null,
  source_url                text,
  source_payload            jsonb,
  discovered_at             timestamptz not null default now(),
  last_checked_at           timestamptz,
  status                    text not null default 'discovered',
  score_total               integer,
  score_need                integer,
  score_budget              integer,
  score_delivery_ease       integer,
  score_contactability      integer,
  score_demo_potential      integer,
  score_fit                 integer,
  score_local               integer,
  offer_level_recommended   integer,
  do_not_contact            boolean not null default false,
  suppression_reason        text,
  next_action_at            timestamptz,
  notes                     text
);
create index if not exists leads_status_idx        on public.leads (status);
create index if not exists leads_niche_idx         on public.leads (niche);
create index if not exists leads_city_idx          on public.leads (location_city);
create index if not exists leads_score_idx         on public.leads (score_total desc);
create index if not exists leads_next_action_idx   on public.leads (next_action_at);

-- ── audits ─────────────────────────────────────────────────────────────────
create table if not exists public.audits (
  id                    text primary key,
  lead_id               text not null references public.leads(id) on delete cascade,
  website_score         integer not null,
  mobile_score          integer not null,
  clarity_score         integer not null,
  cta_score             integer not null,
  seo_score             integer not null,
  trust_score           integer not null,
  conversion_score      integer not null,
  speed_observation     text,
  top_problems          jsonb not null default '[]'::jsonb,
  recommended_solution  integer not null,
  audit_summary         text,
  created_at            timestamptz not null default now()
);
create index if not exists audits_lead_idx on public.audits (lead_id);

-- ── demos ──────────────────────────────────────────────────────────────────
create table if not exists public.demos (
  id                text primary key,
  lead_id           text not null references public.leads(id) on delete cascade,
  demo_type         text not null,
  offer_level       integer not null,
  demo_title        text not null,
  demo_summary      text,
  demo_html         text,
  demo_preview_url  text,
  proposal_text     text,
  price_range       text,
  status            text not null default 'ready',
  created_at        timestamptz not null default now()
);
create index if not exists demos_lead_idx on public.demos (lead_id);

-- ── outreach_messages ──────────────────────────────────────────────────────
create table if not exists public.outreach_messages (
  id                    text primary key,
  lead_id               text not null references public.leads(id) on delete cascade,
  channel               text not null,
  subject               text,
  body                  text not null,
  send_status           text not null default 'queued',
  sent_at               timestamptz,
  sequence_step         integer not null default 0,
  reply_detected        boolean not null default false,
  bounced               boolean not null default false,
  unsubscribe_detected  boolean not null default false,
  complaint_detected    boolean not null default false,
  created_at            timestamptz not null default now()
);
create index if not exists outreach_lead_idx  on public.outreach_messages (lead_id);
create index if not exists outreach_sent_idx   on public.outreach_messages (sent_at);

-- ── replies ────────────────────────────────────────────────────────────────
create table if not exists public.replies (
  id                  text primary key,
  lead_id             text not null references public.leads(id) on delete cascade,
  raw_reply           text not null,
  reply_type          text not null,
  summary             text,
  recommended_action  text,
  handled             boolean not null default false,
  created_at          timestamptz not null default now()
);
create index if not exists replies_lead_idx on public.replies (lead_id);
create index if not exists replies_type_idx on public.replies (reply_type);

-- ── suppression_list ───────────────────────────────────────────────────────
create table if not exists public.suppression_list (
  id             text primary key,
  email          text,
  domain         text,
  phone          text,
  business_name  text,
  reason         text not null,
  created_at     timestamptz not null default now()
);
create index if not exists suppression_email_idx  on public.suppression_list (email);
create index if not exists suppression_domain_idx on public.suppression_list (domain);
create index if not exists suppression_phone_idx  on public.suppression_list (phone);

-- ── agent_runs ─────────────────────────────────────────────────────────────
create table if not exists public.agent_runs (
  id           text primary key,
  agent_name   text not null,
  lead_id      text,
  input        jsonb,
  output       jsonb,
  status       text not null,
  error        text,
  duration_ms  integer,
  created_at   timestamptz not null default now()
);
create index if not exists agent_runs_name_idx on public.agent_runs (agent_name);
create index if not exists agent_runs_time_idx on public.agent_runs (created_at desc);

-- ── system_settings ────────────────────────────────────────────────────────
create table if not exists public.system_settings (
  id          text primary key,
  key         text not null,
  value       jsonb,
  updated_at  timestamptz not null default now()
);
create unique index if not exists system_settings_key_idx on public.system_settings (key);

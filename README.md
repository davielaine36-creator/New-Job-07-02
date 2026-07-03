# Laine Industries — Factory HQ

**Factory HQ** is the clean, single home for Laine Industries' autonomous
business factory: the end-to-end machine that turns a cold market into
delivered work.

```
lead finding → demos → outreach → replies → intake → project build → delivery → support
```

Its first and currently-shipping module is **AI Work Radar** — a fully
automated, **compliance-guarded** agentic system that finds local service
businesses, audits their web presence, scores fit, generates a custom
demo/proposal, runs outreach + follow-ups, classifies replies, tracks everything
in a CRM, and continuously retunes its own targeting — end to end, no manual
approval queue.

Factory HQ ships in **mock mode first**: the entire loop runs with **zero
configuration and zero real-world side effects**. Real adapters (database, AI
model, lead source, email) then switch on **one at a time**.

> **Hard guardrails, by design.** No Google Maps HTML scraping (official Places
> API only). No captcha bypass. No fake identities or fabricated relationships.
> No guaranteed-ranking claims. Every email carries sender identity, a physical
> mailing address, and a working one-click unsubscribe (CAN-SPAM). Opt-outs,
> complaints, and bounces are permanently suppressed and can never be re-contacted.

---

## Factory HQ modules

| Module | Status | Home |
|--------|--------|------|
| **AI Work Radar** — lead finding → audit → demo → outreach → replies → CRM → optimization | ✅ Shipping (mock + real adapters) | `src/lib/radar/**`, cockpit at `/ops` |
| **Client intake** — inbound reply ingestion → qualification → booking | ◐ Reply classifier ready; live inbound ingestion is the next build | `src/lib/radar/agents/reply-classifier.ts` |
| **Project delivery** — build → delivery → support | ○ Planned | — |
| **Knowledge Core** — shared context/playbooks the agents draw on | ○ Planned | — |

AI Work Radar is **one module inside Factory HQ**; the sections below document it
because it is what runs today. New modules attach to the same orchestrator,
adapters, CRM, and compliance spine.

---

## Where it runs

- **GitHub:** `davielaine36-creator/laine-industries-factory-hq` (private)
- **Vercel project:** `laine-industries-factory-hq` (Next.js preset, Node 22)
- **Domain (target):** `factory.laineindustries.co`
- **Supabase project (target):** `laine-industries-factory-hq`
- **Sentry project (target):** `laine-industries-factory-hq`

Locally it runs with nothing configured — see Quick start below.

---

## The loop

```
        ┌─────────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
        │ 1 Discovery │──▶│ 2 Audit  │──▶│ 3 Score  │──▶│ 4 Demo   │
        │  (compliant │   │ (web     │   │ (0-100,  │   │ (custom  │
        │   sources)  │   │  scoring)│   │  routing)│   │  HTML)   │
        └─────────────┘   └──────────┘   └──────────┘   └────┬─────┘
                                                             ▼
   ┌───────────┐   ┌────────────┐   ┌──────────────┐   ┌───────────┐
   │ 9 Optimize│◀──│ 8 Classify │◀──│ 6 Compliance │◀──│ 5 Outreach│
   │ (retune   │   │  replies   │   │  suppression │   │ + follow- │
   │ targeting)│   │            │   │  (hard stop) │   │   ups     │
   └───────────┘   └────────────┘   └──────────────┘   └───────────┘
```

The **orchestrator** (`runTick`) advances every eligible lead through exactly
one stage per tick. A **cron** (`/api/radar/cron`, every 15 min on Vercel) runs
ticks autonomously; in mock mode it also simulates inbound replies so the whole
machine keeps moving on its own.

---

## Quick start (mock mode — nothing to configure)

```bash
npm install
npm run dev
# open http://localhost:3000/ops
```

In the cockpit's top bar:

1. **Seed pipeline** — runs several full ticks with simulated replies and
   populates discovery → audit → score → demo → outreach → replies → CRM →
   optimization.
2. **Run tick** — advance the loop one cycle.
3. **Simulate replies** — generate more inbound replies to exercise the reply /
   compliance / optimizer half of the loop.

Or drive it from the API:

```bash
# seed a full pipeline
curl -X POST localhost:3000/api/radar/seed -d '{"ticks":6,"reset":true}'
# one tick
curl -X POST localhost:3000/api/radar/tick -d '{"force":true,"discover":true,"optimize":true}'
# dashboard metrics
curl localhost:3000/api/radar/metrics
```

Mock data persists to a gitignored `.radar-data/db.json` locally so the pipeline
survives restarts.

---

## Enabling real adapters, one at a time

Everything is behind an adapter that defaults to a mock. Flip `RADAR_MODE=live`
and fill in a block to promote it. See `.env.example` for the full list.

| Capability   | Mock (default)                    | Real adapter            | Env to set |
|--------------|-----------------------------------|-------------------------|------------|
| **Database** | in-memory + `.radar-data/db.json` | Supabase (PostgREST)    | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` |
| **AI model** | deterministic templated output    | Anthropic Messages API  | `ANTHROPIC_API_KEY`, `RADAR_AI_MODEL` |
| **Lead source** | generated business pool        | Google Places (New) API | `GOOGLE_PLACES_API_KEY` |
| **Email**    | simulated send (logged)           | Resend                  | `RADAR_EMAIL_PROVIDER=resend`, `RESEND_API_KEY`, `RADAR_FROM_EMAIL` |

**Recommended promotion order:** Supabase → Anthropic → Google Places → Resend.
Each is independent; you can, e.g., run real AI on the mock database.

### Supabase

1. Apply the schema: `supabase/migrations/0001_init.sql` (via the Supabase MCP
   `apply_migration`, `supabase db push`, or paste into the SQL editor).
2. Set `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`. The app talks to PostgREST
   over `fetch` — no client library needed.

### Autonomous vs manual

- `AUTONOMOUS_MODE=true` (default) — the cron runs the whole loop with no
  approval. There is **no review queue**.
- `AUTONOMOUS_MODE=false` — the loop won't self-run; use the per-lead buttons or
  `POST /api/radar/agents/:agent` to exercise agents individually for testing.

---

## Database tables (`supabase/migrations/0001_init.sql`)

| Table                | Purpose |
|----------------------|---------|
| `leads`              | The CRM record + all 7 sub-scores, status, offer level, suppression flags |
| `audits`             | Per-lead website scoring, top problems, recommended offer |
| `demos`              | Generated demo (self-contained HTML), proposal, price, preview URL |
| `outreach_messages`  | Every message: channel, subject/body, send status, sequence step, reply/bounce/unsub flags |
| `replies`            | Inbound replies: raw text, classified type, summary, recommended action |
| `suppression_list`   | Permanent do-not-contact (email/domain/phone/name) with reason |
| `agent_runs`         | Timed, logged execution record for **every** agent run (the audit trail) |
| `system_settings`    | Operator settings + optimizer-learned priorities |

---

## The eight agents (`src/lib/radar/agents/`)

| # | Agent | What it does |
|---|-------|--------------|
| 1 | **Discovery** | Pulls businesses from the active source, dedupes by domain/phone/name, records source provenance. Never scrapes Maps HTML. |
| 2 | **Audit** | Scores mobile/speed/clarity/CTA/SEO/trust/conversion; emits top-3 problems + recommended offer level. |
| 3 | **Scoring** | Weighted 0-100 (need 25 / budget 15 / delivery 15 / contactability 15 / demo 15 / fit 10 / local 5) with optimizer multipliers, then routes: ≥80 demo, ≥65 proposal, ≥50 store, else archive. |
| 4 | **Demo** | Generates a business-specific, self-contained HTML asset (Level 1 refreshed site / Level 2 growth plan) + proposal + price, hosted at a preview URL. |
| 5 | **Outreach** | Sends the next due message only if: score clears threshold, channel exists, not suppressed, under daily cap, and the message carries identity + address + opt-out. 4-touch sequence (day 0/3/7/14). |
| 6 | **Compliance** | Hard stop. Opt-out / complaint / bounce → permanent suppression + terminal status + sequence halt. |
| 7 | **Reply Classifier** | Classifies inbound replies and takes the mapped action (booking link, pricing, scheduling, answer, mark lost, suppress). |
| 8 | **Optimizer** | Reviews outcomes daily; retunes niche/city priorities, subject order, and selectivity; damps sources that bounce/opt-out. |

Every agent run is wrapped by `withRun(...)`, which times it and writes to
`agent_runs` (visible under **Agent Runs** in the cockpit).

---

## API

| Method / Route | Purpose |
|----------------|---------|
| `POST /api/radar/tick` | Run one full tick (`TickOptions` body) |
| `GET  /api/radar/cron` | Scheduled entry (Vercel Cron); tick + hourly optimizer + mock reply sim |
| `POST /api/radar/seed` | Seed a full pipeline (mock) |
| `POST /api/radar/simulate` | Generate simulated inbound replies (mock) |
| `POST /api/radar/reset` | Wipe all data (mock; guarded for live) |
| `GET  /api/radar/metrics` | Dashboard metrics |
| `GET/POST /api/radar/settings` | Read / update operator settings |
| `POST /api/radar/agents/:agent` | Run one agent manually (`discovery`, `audit`, `scoring`, `demo`, `outreach`, `reply_classifier`, `compliance`, `optimizer`) |
| `POST /api/radar/leads/:id/reply` | Inject an inbound reply for classification |
| `GET  /ops/demos/:id` | Public standalone demo preview (the `demo_preview_url`) |
| `GET  /unsubscribe?lead=:id` | Public one-click unsubscribe (suppresses permanently) |

Mutating/cron routes honor `RADAR_CRON_SECRET` (Bearer, `x-radar-secret`, or
`?secret=`); Vercel Cron requests are allowed automatically. With no secret set
(local mock dev) everything is permitted.

---

## The cockpit (`/ops`)

A dark, high-signal operations console (Next.js App Router, server components):

- **Dashboard** — headline metrics, conversion funnel, compliance/health gauges,
  niche mix, full pipeline distribution, recent agent runs, pipeline value.
- **Pipeline** — kanban board across all 18 funnel stages.
- **Leads** — filterable CRM table → per-lead detail (scores, audit, demo,
  outreach timeline, replies, and manual agent controls).
- **Agent Runs** — the live telemetry log.
- **Settings** — targeting, thresholds, cadence, sender identity, offer ladder,
  autonomy; shows optimizer-learned priorities read-only.

The legacy **Circle Health** marketing demo still lives at `/`, `/platform`,
`/company`, `/security`, `/insights` (its own light theme, under the `(site)`
route group) — unrelated to Radar, kept intact. Its notes moved to
`docs/circle-health-demo.md`.

---

## What works today (V1)

- Full autonomous loop, end-to-end, in mock mode: discovery → audit → score →
  demo → outreach → follow-up scheduling → reply classification → compliance
  suppression → CRM → optimization.
- Deterministic mock adapters for DB, AI, source, and email (zero-config).
- Real adapters implemented and swappable: Supabase (PostgREST), Anthropic,
  Google Places, Resend.
- All compliance guardrails enforced (identity/address/opt-out on every send,
  daily cold-send cap, suppression on opt-out/complaint/bounce, no Maps
  scraping, no fake claims).
- Self-contained HTML demo generation with hosted preview URLs.
- Cockpit UI + full REST surface + Vercel cron.

## What is stubbed / intentionally limited

- **Contact-form outreach** is drafted but **not auto-submitted** in live mode
  (auto-submitting captcha-protected forms would require captcha bypass — which
  we refuse). Email is fully automated; form-only leads are queued.
- **Live reply ingestion** (a real inbox → classifier) is not wired; the
  classifier and the `/leads/:id/reply` endpoint are ready, but an IMAP/webhook
  poller is future work. Mock mode simulates inbound replies.
- **Booking** integrates via a scheduling link; there's no calendar API sync yet.
- The **optimizer** retunes niche/city priorities and selectivity; per-subject-
  line A/B attribution is a noted next step.

## Next highest-leverage improvement

Wire **live reply ingestion** (Gmail/IMAP webhook → `recordReply`). Outbound is
already fully automated and compliant; closing the inbound loop makes the system
truly hands-off — interested prospects get booking links, and opt-outs/complaints
suppress themselves — with no operator in the path.

---

## Environment variables

Everything is optional — with nothing set, Factory HQ runs the full loop in mock
mode. See `.env.example` for the annotated, complete list. The essentials:

| Variable | Purpose |
|----------|---------|
| `RADAR_MODE` | `mock` (default) or `live` |
| `AUTONOMOUS_MODE` | `true` (default) = cron runs the whole loop, no approval queue |
| `RADAR_CRON_SECRET` | Bearer / `x-radar-secret` / `?secret=` guard on mutating + cron routes |
| `NEXT_PUBLIC_BASE_URL` | Absolute base for demo preview + unsubscribe links |
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | Real database (PostgREST over `fetch`) |
| `ANTHROPIC_API_KEY`, `RADAR_AI_MODEL` | Real AI model (Messages API over `fetch`) |
| `GOOGLE_PLACES_API_KEY` | Real lead source (official Places New Text Search) |
| `RADAR_EMAIL_PROVIDER=resend`, `RESEND_API_KEY`, `RADAR_FROM_EMAIL` | Real outbound email |
| `RADAR_ALLOW_RESET` | Guard that must be set to allow `/reset` in live mode |

---

## Deployment (Vercel)

Factory HQ is Vercel-ready with the Next.js preset (`vercel.json`).

1. Import `davielaine36-creator/laine-industries-factory-hq` as a new Vercel
   project (framework auto-detects as Next.js; Node 22).
2. Set env vars for the adapters you're promoting (start in mock mode — no vars
   needed — then add Supabase → Anthropic → Places → Resend one at a time).
3. Point `factory.laineindustries.co` at the project.
4. Deploy. The cron is already declared in `vercel.json`.

### Cron

`vercel.json` schedules `GET /api/radar/cron` every **15 minutes**. Each run
advances the loop one tick, runs the optimizer hourly, and (in mock mode)
simulates inbound replies. Vercel Cron requests are authorized automatically;
set `RADAR_CRON_SECRET` in production so no one else can trigger it.

---

## Knowledge Core

**Planned, not yet built.** The Knowledge Core will hold the shared context the
agents draw on — offer definitions, objection handling, pricing logic, brand
voice, and per-niche playbooks — so every module reasons from one source of
truth. It is listed here as the intended home; there is no `knowledge/` code in
the repo today.

---

## Compliance guardrails (enforced in code, not decorative)

- **Every send** carries sender identity + physical mailing address + working
  one-click unsubscribe (CAN-SPAM), plus `List-Unsubscribe` headers on real email.
- **Daily cold-send cap** — reply auto-responses do **not** count against it.
- **Permanent suppression** on opt-out / complaint / bounce → terminal status +
  sequence halt, with no override path inside the autonomous loop.
- **Official Places API only** — never scrapes Google Maps HTML.
- **No captcha bypass** — contact-form-only leads are queued, never auto-submitted.
- **No fabricated relationships, no fake claims, no guaranteed-ranking language.**

---

## Scripts

```bash
npm run dev        # local dev
npm run build      # production build
npm run start      # run the production build
npm run typecheck  # tsc --noEmit
npm run lint       # next lint
```

## Stack

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind · Vercel-ready.
No database client dependency (Supabase via PostgREST `fetch`); no AI SDK
dependency (Anthropic via `fetch`).

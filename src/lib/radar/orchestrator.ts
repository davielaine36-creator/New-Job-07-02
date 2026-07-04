import type { Lead, LeadStatus } from "@/lib/radar/types";
import { getDb } from "@/lib/radar/db";
import { config } from "@/lib/radar/config";
import { log } from "@/lib/radar/log";
import { getSettings, orderedNiches, saveSettings } from "@/lib/radar/settings";
import { sendsToday } from "@/lib/radar/repo";
import {
  auditLead,
  generateDemo,
  runDiscovery,
  runOptimizer,
  runOutreachStep,
  scoreLead,
} from "./agents";
import { planForScore } from "./agents/scoring";
import { now } from "@/lib/radar/util";

export interface TickOptions {
  /** Run even when AUTONOMOUS_MODE is off (manual trigger). */
  force?: boolean;
  /** Discover new leads this tick. */
  discover?: boolean;
  /** How many (niche × city) discovery queries to run this tick. */
  discoveryBatches?: number;
  /** Run the optimizer at the end (daily cadence). */
  optimize?: boolean;
  /** Per-stage processing caps to keep a tick snappy. */
  caps?: Partial<Record<"audit" | "score" | "demo" | "outreach", number>>;
}

export interface TickSummary {
  ran: boolean;
  mode: string;
  autonomous: boolean;
  discovered: number;
  audited: number;
  scored: number;
  demos: number;
  outreach: number;
  followups: number;
  archived: number;
  optimizer: boolean;
  sends_today: number;
  daily_cap: number;
  notes: string[];
}

const DEFAULT_CAPS = { audit: 30, score: 30, demo: 20, outreach: 40 };

/**
 * One tick of the autonomous factory. Advances every eligible lead through the
 * next stage of the funnel. Idempotent per lead — a lead only moves when it's
 * due (`next_action_at`) and always through exactly one stage per tick.
 */
export async function runTick(opts: TickOptions = {}): Promise<TickSummary> {
  const db = getDb();
  const settings = await getSettings();
  const caps = { ...DEFAULT_CAPS, ...opts.caps };
  const autonomous = settings.autonomous_mode && config.autonomous;
  const notes: string[] = [];

  const summary: TickSummary = {
    ran: false,
    mode: config.mode,
    autonomous,
    discovered: 0,
    audited: 0,
    scored: 0,
    demos: 0,
    outreach: 0,
    followups: 0,
    archived: 0,
    optimizer: false,
    sends_today: await sendsToday(),
    daily_cap: settings.daily_send_limit,
    notes,
  };

  if (!autonomous && !opts.force) {
    notes.push("Autonomous mode off and tick not forced — no work performed.");
    return summary;
  }
  summary.ran = true;

  // ── Stage 1: Discovery (rotates through niche × city) ────────────────────
  if (opts.discover ?? autonomous) {
    const combos = buildCombos(settings);
    if (combos.length) {
      const cursorRow = await db.get("system_settings", "discovery_cursor");
      let cursor = (cursorRow?.value as number) ?? 0;
      const batches = opts.discoveryBatches ?? 2;
      for (let i = 0; i < batches; i++) {
        const combo = combos[cursor % combos.length];
        cursor++;
        try {
          const res = await runDiscovery({
            niche: combo.niche,
            city: combo.city,
            state: combo.state,
            limit: 12,
          });
          summary.discovered += res.inserted;
        } catch (err) {
          notes.push(`Discovery error: ${(err as Error).message}`);
        }
      }
      await upsertSetting(db, "discovery_cursor", cursor);
    }
  }

  // ── Stage 2: Audit every `discovered` lead ───────────────────────────────
  for (const lead of await due(["discovered"], caps.audit)) {
    try {
      await auditLead(lead);
      summary.audited++;
    } catch (err) {
      notes.push(`Audit error (${lead.business_name}): ${(err as Error).message}`);
    }
  }

  // ── Stage 3: Score every `audited` lead ──────────────────────────────────
  for (const lead of await due(["audited"], caps.score)) {
    try {
      const { plan } = await scoreLead(lead);
      summary.scored++;
      if (plan === "archive") summary.archived++;
    } catch (err) {
      notes.push(`Scoring error (${lead.business_name}): ${(err as Error).message}`);
    }
  }

  // ── Stage 4: Demo for scored leads that clear the outreach bar & are due ──
  for (const lead of await due(["scored"], caps.demo)) {
    const plan = planForScore(lead.score_total, settings);
    if (plan !== "demo" && plan !== "proposal") continue;
    try {
      await generateDemo(lead);
      summary.demos++;
    } catch (err) {
      notes.push(`Demo error (${lead.business_name}): ${(err as Error).message}`);
    }
  }

  // ── Stage 5: Outreach — first touch + follow-ups, under the daily cap ─────
  let remaining = Math.max(0, settings.daily_send_limit - (await sendsToday()));
  const outreachStatuses: LeadStatus[] = [
    "demo_generated",
    "outreach_sent",
    "followup_1_sent",
    "followup_2_sent",
    "followup_3_sent",
  ];
  const queue = await due(outreachStatuses, Math.min(caps.outreach, remaining || caps.outreach));
  for (const lead of queue) {
    if (remaining <= 0) {
      notes.push("Daily send cap reached — remaining outreach deferred to next tick.");
      break;
    }
    try {
      const res = await runOutreachStep(lead);
      if (res.sent) {
        remaining--;
        if (lead.status === "demo_generated") summary.outreach++;
        else summary.followups++;
      }
    } catch (err) {
      notes.push(`Outreach error (${lead.business_name}): ${(err as Error).message}`);
    }
  }

  // ── Stage 9: Optimizer (daily) ───────────────────────────────────────────
  if (opts.optimize) {
    try {
      await runOptimizer();
      summary.optimizer = true;
    } catch (err) {
      notes.push(`Optimizer error: ${(err as Error).message}`);
    }
  }

  summary.sends_today = await sendsToday();
  log("tick", summary);
  return summary;
}

/** Leads in the given statuses whose next action is due (null or in the past). */
async function due(statuses: LeadStatus[], cap: number): Promise<Lead[]> {
  const db = getDb();
  const nowIso = now();
  const out: Lead[] = [];
  for (const status of statuses) {
    const rows = await db.list("leads", {
      where: { status },
      order: { column: "score_total", dir: "desc" },
    });
    for (const l of rows) {
      if (!l.next_action_at || l.next_action_at <= nowIso) out.push(l);
      if (out.length >= cap) return out;
    }
  }
  return out.slice(0, cap);
}

function buildCombos(settings: Awaited<ReturnType<typeof getSettings>>) {
  const niches = orderedNiches(settings);
  const combos: { niche: (typeof niches)[number]; city: string; state: string }[] = [];
  for (const niche of niches) {
    for (const c of settings.target_cities) {
      combos.push({ niche, city: c.city, state: c.state });
    }
  }
  return combos;
}

async function upsertSetting(
  db: ReturnType<typeof getDb>,
  key: string,
  value: unknown
) {
  const existing = await db.get("system_settings", key);
  if (existing) await db.update("system_settings", key, { value, updated_at: now() });
  else await db.insert("system_settings", { id: key, key, value, updated_at: now() });
}

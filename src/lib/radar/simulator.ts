import type { Lead, ReplyType } from "@/lib/radar/types";
import { getDb } from "@/lib/radar/db";
import { recordReply } from "./agents/reply-classifier";
import { messagesFor } from "./repo";
import { log } from "./log";

/**
 * Mock inbound-reply generator. Only used in mock mode to exercise the reply →
 * compliance → CRM → optimizer half of the loop without a real inbox. It picks
 * leads that have received a cold message, rolls a score-weighted outcome, and
 * feeds a realistic reply straight into the Reply Classifier.
 */
export interface SimulateOptions {
  /** Base probability a given eligible lead replies this pass. */
  rate?: number;
  /** Max replies to generate. */
  max?: number;
}

const REPLY_TEXTS: Record<ReplyType, string[]> = {
  interested: [
    "Hey, this actually looks great — we've been meaning to fix our site. Tell me more.",
    "Interested. That preview is way better than what we have now. What's next?",
    "Yes, let's talk. When are you free this week?",
  ],
  pricing_request: [
    "Looks good. How much does something like this run?",
    "What would you charge for the refresh? Trying to budget.",
    "Ballpark pricing? We're a small shop.",
  ],
  meeting_request: [
    "Can we hop on a quick call? Mornings are best.",
    "Happy to chat — send me a time.",
    "Let's schedule something. Do you have Thursday?",
  ],
  question: [
    "Do we own the site after or is it a rental thing?",
    "Would this work with our existing phone number and reviews?",
    "How long does it usually take to build?",
  ],
  not_interested: [
    "Thanks but we're all set right now.",
    "Not interested, we just redid our site last year.",
    "Appreciate it, pass for now.",
  ],
  wrong_person: [
    "You've got the wrong person — I don't handle the website.",
    "This isn't the owner, try info@ instead.",
  ],
  unsubscribe: [
    "Please unsubscribe me and don't email again.",
    "Take me off your list. Not interested, stop contacting us.",
    "Remove me from this. Opt out.",
  ],
  complaint: [
    "This is spam. Stop emailing me or I'll report it.",
    "How did you get my email? This is harassment, cease and desist.",
  ],
  bounce: [
    "Mailer-Daemon: delivery has failed — address not found (550 5.1.1 no such user).",
  ],
};

export async function simulateReplies(opts: SimulateOptions = {}): Promise<{
  generated: number;
  breakdown: Partial<Record<ReplyType, number>>;
}> {
  const db = getDb();
  const rate = opts.rate ?? 0.55;
  const max = opts.max ?? 25;

  const inSequence: Lead["status"][] = [
    "outreach_sent",
    "followup_1_sent",
    "followup_2_sent",
    "followup_3_sent",
  ];
  const candidates: Lead[] = [];
  for (const s of inSequence) {
    candidates.push(...(await db.list("leads", { where: { status: s } })));
  }

  const breakdown: Partial<Record<ReplyType, number>> = {};
  let generated = 0;

  for (const lead of candidates) {
    if (generated >= max) break;
    const msgs = await messagesFor(lead.id);
    const coldSent = msgs.filter(
      (m) => m.sequence_step < 90 && (m.send_status === "sent" || m.send_status === "simulated")
    );
    if (!coldSent.length) continue;
    if (coldSent.some((m) => m.reply_detected)) continue; // already replied

    // Later steps are likelier to draw a reply (they've been nudged more).
    const step = coldSent.length - 1;
    const p = Math.min(0.95, rate + step * 0.08);
    if (Math.random() > p) continue;

    const type = rollType(lead);
    const texts = REPLY_TEXTS[type];
    const text = texts[Math.floor(Math.random() * texts.length)];
    try {
      await recordReply(lead, text);
      breakdown[type] = (breakdown[type] ?? 0) + 1;
      generated++;
    } catch (err) {
      log("simulator", `reply error for ${lead.business_name}: ${(err as Error).message}`);
    }
  }

  log("simulator", `generated ${generated} replies`, breakdown);
  return { generated, breakdown };
}

/** Score-weighted outcome: better-fit leads reply more, and more positively. */
function rollType(lead: Lead): ReplyType {
  const score = lead.score_total ?? 50;
  const posBoost = (score - 50) / 100; // -0.5..+0.5
  const weights: [ReplyType, number][] = [
    ["interested", 0.16 + posBoost * 0.2],
    ["pricing_request", 0.14 + posBoost * 0.12],
    ["meeting_request", 0.1 + posBoost * 0.1],
    ["question", 0.12],
    ["not_interested", 0.28 - posBoost * 0.2],
    ["wrong_person", 0.05],
    ["unsubscribe", 0.06 - posBoost * 0.03],
    ["complaint", 0.02 - posBoost * 0.015],
    ["bounce", lead.email ? 0.03 : 0.06],
  ];
  const clean = weights.map(([t, w]) => [t, Math.max(0.001, w)] as [ReplyType, number]);
  const total = clean.reduce((a, [, w]) => a + w, 0);
  let roll = Math.random() * total;
  for (const [t, w] of clean) {
    roll -= w;
    if (roll <= 0) return t;
  }
  return "not_interested";
}

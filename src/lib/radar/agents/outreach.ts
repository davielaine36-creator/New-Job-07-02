import type { Channel, Lead, OutreachMessage } from "@/lib/radar/types";
import { NICHE_LABELS } from "@/lib/radar/types";
import { getDb } from "@/lib/radar/db";
import { getAi } from "@/lib/radar/ai";
import { config } from "@/lib/radar/config";
import { withRun } from "@/lib/radar/log";
import { getSettings, type RadarSettings } from "@/lib/radar/settings";
import { complianceFooter, getEmail } from "@/lib/radar/email";
import {
  isSuppressed,
  latestAuditFor,
  latestDemoFor,
  messagesFor,
  sendsToday,
} from "@/lib/radar/repo";
import { planForScore } from "./scoring";
import { daysFromNow, id, now } from "@/lib/radar/util";

export interface OutreachOutcome {
  sent: boolean;
  skipped_reason?: string;
  step?: number;
  message?: OutreachMessage;
}

/**
 * Loop 5 — Outreach Agent. Sends the *next due* message in the sequence for a
 * lead, but only after every guardrail passes:
 *
 *   1. score clears the outreach threshold
 *   2. a real contact channel exists
 *   3. lead is not suppressed / do-not-contact
 *   4. today's send cap isn't exceeded
 *   5. the message carries sender identity, physical address, and an opt-out
 *
 * Copy is specific to the business and its audit, never makes guarantees, and
 * never fakes a prior relationship. Fully automated for email; contact-form-only
 * leads are queued (we do not auto-submit captcha-protected forms).
 */
export async function runOutreachStep(lead: Lead): Promise<OutreachOutcome> {
  return withRun<OutreachOutcome>("outreach", { leadId: lead.id }, async () => {
    const db = getDb();
    const settings = await getSettings();

    const guard = await guardrails(lead, settings);
    if (guard) {
      return { output: { skipped: guard }, result: { sent: false, skipped_reason: guard } };
    }

    const prior = await messagesFor(lead.id);
    const sentPrior = prior.filter(
      (m) => m.send_status === "sent" || m.send_status === "simulated"
    );
    const step = sentPrior.length; // 0 = first touch, then 1..3

    // Sequence exhausted → close the loop (no reply after final touch).
    if (step > 3) {
      await db.update("leads", lead.id, {
        status: "lost",
        notes: appendNote(lead.notes, "Sequence complete, no reply — closed."),
        next_action_at: null,
      });
      return { output: { sequence: "complete" }, result: { sent: false, skipped_reason: "sequence_complete" } };
    }

    const audit = await latestAuditFor(lead.id);
    const demo = await latestDemoFor(lead.id);
    const channel: Channel = lead.email ? "email" : "contact_form";
    const unsubscribeUrl = `${config.baseUrl}/unsubscribe?lead=${lead.id}`;

    const ai = getAi();
    const hook = await ai.object<{ subject: string; opener: string }>({
      system:
        "You write short, specific, non-deceptive cold outreach for a web/marketing studio contacting local service businesses. No hype, no guarantees, no fake urgency, no fabricated relationship.",
      schemaHint: '{ "subject": string, "opener": string }',
      prompt: `Business: ${lead.business_name} (${NICHE_LABELS[lead.niche]}, ${lead.location_city}). Step ${step} of a 4-touch sequence. Audit problems: ${(audit?.top_problems ?? []).join("; ")}. Write a subject line and a one-sentence opener referencing something specific and true.`,
      mock: () => ({
        subject: renderSubject(settings, lead, step),
        opener: mockOpener(lead, audit?.top_problems ?? [], step),
      }),
    });

    const built = buildBody({
      lead,
      step,
      opener: hook.opener,
      demoUrl: demo?.demo_preview_url ?? null,
      proposal: demo?.proposal_text ?? audit?.audit_summary ?? "",
      settings,
    });
    const footer = complianceFooter(settings.sender, settings.unsubscribe_text, unsubscribeUrl);

    const subject = hook.subject;
    const text = built + footer.text;
    const html = `<div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;font-size:15px;color:#0f172a;line-height:1.6">${built
      .split("\n")
      .map((l) => (l.trim() ? `<p style="margin:0 0 12px">${escapeHtml(l)}</p>` : ""))
      .join("")}${footer.html}</div>`;

    // Send (email → real/simulated; contact-form → simulated in mock, queued in live).
    let sendStatus: OutreachMessage["send_status"];
    if (channel === "email" && lead.email) {
      const res = await getEmail().send({
        to: lead.email,
        subject,
        html,
        text,
        headers: {
          "List-Unsubscribe": `<${unsubscribeUrl}>, <mailto:${settings.sender.reply_to}?subject=unsubscribe>`,
          "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        },
      });
      sendStatus = res.status;
    } else {
      // Contact-form-only: never auto-submit protected forms.
      sendStatus = config.mode === "live" ? "queued" : "simulated";
    }

    const message: OutreachMessage = {
      id: id(),
      lead_id: lead.id,
      channel,
      subject,
      body: text,
      send_status: sendStatus,
      sent_at: sendStatus === "sent" || sendStatus === "simulated" ? now() : null,
      sequence_step: step,
      reply_detected: false,
      bounced: false,
      unsubscribe_detected: false,
      complaint_detected: false,
      created_at: now(),
    };
    await db.insert("outreach_messages", message);

    // Advance the pipeline + schedule the next touch.
    const statusByStep = [
      "outreach_sent",
      "followup_1_sent",
      "followup_2_sent",
      "followup_3_sent",
    ] as const;
    const nextStepDay = settings.sequence_days[step + 1];
    await db.update("leads", lead.id, {
      status: statusByStep[step],
      last_checked_at: now(),
      next_action_at:
        step < 3 && nextStepDay != null
          ? daysFromNow(nextStepDay - settings.sequence_days[step])
          : step < 3
            ? daysFromNow(3)
            : null,
    });

    return {
      output: { step, channel, send_status: sendStatus, subject },
      result: { sent: sendStatus === "sent" || sendStatus === "simulated", step, message },
    };
  });
}

/** Returns a skip reason string, or null if clear to send. */
async function guardrails(lead: Lead, s: RadarSettings): Promise<string | null> {
  if (await isSuppressed(lead)) return "suppressed_or_do_not_contact";
  const plan = planForScore(lead.score_total, s);
  if (plan !== "demo" && plan !== "proposal") return "below_outreach_threshold";
  if (!lead.email && !lead.contact_page_url) return "no_contact_channel";
  if ((await sendsToday()) >= s.daily_send_limit) return "daily_cap_reached";
  return null;
}

function renderSubject(s: RadarSettings, lead: Lead, step: number): string {
  const variant = s.subject_variants[step % s.subject_variants.length] ?? s.subject_variants[0];
  const base = variant.replace(/\{\{business\}\}/g, shortName(lead));
  if (step === 0) return base;
  if (step === 1) return `Re: ${base}`;
  if (step === 2) return `One idea for ${shortName(lead)}`;
  return `Should I close your file, ${shortName(lead)}?`;
}

function mockOpener(lead: Lead, problems: string[], step: number): string {
  const p = problems[0]?.toLowerCase() ?? "a few things costing you calls";
  if (step === 0)
    return `I was looking at ${lead.business_name}'s site while researching ${NICHE_LABELS[lead.niche].toLowerCase()} companies in ${lead.location_city}, and noticed ${p}.`;
  if (step === 1)
    return `Circling back on the quick preview I put together for ${lead.business_name} — no pressure, just wanted it on your radar.`;
  if (step === 2)
    return `Quick, free idea whether or not we ever work together: ${problems[1] ?? "add a one-tap quote button above the fold"}.`;
  return `I'll assume the timing isn't right and close your file after this — totally fine.`;
}

function buildBody(args: {
  lead: Lead;
  step: number;
  opener: string;
  demoUrl: string | null;
  proposal: string;
  settings: RadarSettings;
}): string {
  const { lead, step, opener, demoUrl, proposal, settings } = args;
  const lines: string[] = [`Hi ${lead.business_name} team,`, "", opener, ""];

  if (step === 0) {
    lines.push(
      `So I built a quick, no-obligation preview of what a refreshed version could look like${demoUrl ? ":" : "."}`
    );
    if (demoUrl) lines.push(demoUrl, "");
    lines.push(
      proposal ||
        "It focuses on a mobile-first layout, a clear quote button, and real trust signals."
    );
    lines.push("", `If it's useful, grab a time here and I'll walk you through it: ${settings.booking_link}`);
  } else if (step === 1) {
    if (demoUrl) lines.push(`Here's that preview again in case it got buried: ${demoUrl}`, "");
    lines.push(`Worth a 15-minute look? ${settings.booking_link}`);
  } else if (step === 2) {
    lines.push(
      "",
      `Either way, if it'd help to see the full preview: ${demoUrl ?? settings.booking_link}`
    );
  } else {
    lines.push("", `If it's ever useful down the road, here's my calendar: ${settings.booking_link}`);
  }
  return lines.join("\n");
}

function shortName(lead: Lead): string {
  return lead.business_name.split(" ").slice(0, 2).join(" ");
}
function appendNote(existing: string | null, line: string): string {
  return existing ? `${existing}\n${line}` : line;
}
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

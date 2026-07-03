import type { Lead, OutreachMessage, Reply, ReplyType } from "@/lib/radar/types";
import { getDb } from "@/lib/radar/db";
import { getAi } from "@/lib/radar/ai";
import { config } from "@/lib/radar/config";
import { withRun } from "@/lib/radar/log";
import { getSettings } from "@/lib/radar/settings";
import { getEmail } from "@/lib/radar/email";
import { applyComplianceFromReply, detectBounce, detectComplaint, detectOptOut } from "./compliance";
import { id, now } from "@/lib/radar/util";

export interface ReplyOutcome {
  reply: Reply;
  lead: Lead;
  autoReplySent: boolean;
}

/**
 * Loop 8 — Reply Classifier Agent.
 *
 * Classifies an inbound reply, records it, and executes the mapped action:
 *   interested       → send booking link, mark Interested
 *   pricing_request  → send package/pricing, mark Interested
 *   meeting_request  → send scheduling link, mark Interested
 *   question         → send a direct answer + link, mark Replied
 *   not_interested   → mark Lost, stop
 *   wrong_person     → mark Lost, stop
 *   unsubscribe      → suppress (opted out), stop
 *   complaint        → suppress, stop
 *   bounce           → mark bounced (suppress), stop
 */
export async function recordReply(lead: Lead, rawText: string): Promise<ReplyOutcome> {
  return withRun<ReplyOutcome>("reply_classifier", { leadId: lead.id, input: { len: rawText.length } }, async () => {
    const db = getDb();
    const ai = getAi();
    const settings = await getSettings();

    const classified = await ai.object<{
      reply_type: ReplyType;
      summary: string;
      recommended_action: string;
    }>({
      system:
        "You classify inbound replies to cold B2B outreach. Be conservative: any opt-out or hostility outweighs interest. Output one of: interested, pricing_request, meeting_request, question, not_interested, unsubscribe, complaint, wrong_person, bounce.",
      schemaHint: '{ "reply_type": string, "summary": string, "recommended_action": string }',
      prompt: `Reply from ${lead.business_name}:\n"""${rawText.slice(0, 1500)}"""\nClassify it.`,
      mock: () => mockClassify(rawText),
    });

    const replyType = classified.reply_type;
    const reply: Reply = {
      id: id(),
      lead_id: lead.id,
      raw_reply: rawText.slice(0, 4000),
      reply_type: replyType,
      summary: classified.summary,
      recommended_action: classified.recommended_action,
      handled: false,
      created_at: now(),
    };
    await db.insert("replies", reply);

    // Mark the relevant outreach message as having drawn a reply.
    const msgs = await db.list("outreach_messages", { where: { lead_id: lead.id } });
    const last = msgs.sort((a, b) => (a.sent_at ?? "").localeCompare(b.sent_at ?? "")).at(-1);
    if (last) await db.update("outreach_messages", last.id, { reply_detected: true });

    // Compliance-terminal replies short-circuit everything.
    const suppressed = await applyComplianceFromReply(lead, replyType, rawText);
    if (suppressed) {
      await db.update("replies", reply.id, { handled: true });
      return { output: { reply_type: replyType, action: "suppressed" }, result: { reply, lead: suppressed, autoReplySent: false } };
    }

    // Non-terminal outcomes.
    let nextStatus: Lead["status"] = "replied";
    let autoReply: string | null = null;

    if (replyType === "interested") {
      nextStatus = "interested";
      autoReply = `Great to hear from you! The easiest next step is a quick 15-minute call — here's my calendar: ${settings.booking_link}\n\nOr just reply with a couple of times that work and I'll send an invite.`;
    } else if (replyType === "pricing_request") {
      nextStatus = "interested";
      autoReply = pricingReply(settings);
    } else if (replyType === "meeting_request") {
      nextStatus = "interested";
      autoReply = `Happy to find a time. Grab whatever works best here and it'll land on both our calendars: ${settings.booking_link}`;
    } else if (replyType === "question") {
      nextStatus = "replied";
      autoReply =
        ai.kind === "anthropic"
          ? await ai.text({
              system:
                "Answer a prospect's question about a local website/marketing service honestly and briefly. No guarantees. End by offering a quick call.",
              prompt: `Question from ${lead.business_name}: "${rawText.slice(0, 800)}". Booking link: ${settings.booking_link}`,
              maxTokens: 400,
            })
          : `Good question — happy to answer. Short version: we scope the work up front with fixed pricing, and you own everything we build. If it's easier to talk it through, here's my calendar: ${settings.booking_link}`;
    } else if (replyType === "not_interested" || replyType === "wrong_person") {
      nextStatus = "lost";
    }

    let autoReplySent = false;
    if (autoReply) {
      autoReplySent = await sendAutoReply(lead, autoReply);
    }

    const updated = (await db.update("leads", lead.id, {
      status: nextStatus,
      last_checked_at: now(),
      next_action_at: null,
      notes: appendNote(lead.notes, `Reply (${replyType}): ${classified.summary}`),
    })) as Lead;
    await db.update("replies", reply.id, { handled: true });

    return {
      output: { reply_type: replyType, status: nextStatus, autoReplySent },
      result: { reply, lead: updated, autoReplySent },
    };
  });
}

function mockClassify(text: string): {
  reply_type: ReplyType;
  summary: string;
  recommended_action: string;
} {
  const t = text.toLowerCase();
  const pick = (
    reply_type: ReplyType,
    summary: string,
    action: string
  ) => ({ reply_type, summary, recommended_action: action });

  if (detectBounce(text)) return pick("bounce", "Delivery failure.", "Suppress and stop.");
  if (detectComplaint(text)) return pick("complaint", "Hostile / spam complaint.", "Suppress permanently and stop.");
  if (detectOptOut(text)) return pick("unsubscribe", "Requested to opt out.", "Suppress and stop.");
  if (/\b(price|pricing|cost|how much|quote|rates?|budget)\b/.test(t))
    return pick("pricing_request", "Asked about pricing.", "Send package pricing.");
  if (/\b(call|meet|meeting|schedule|calendar|zoom|book a time|available)\b/.test(t))
    return pick("meeting_request", "Wants to schedule.", "Send scheduling link.");
  if (/\b(not interested|no thanks|we'?re (good|all set)|already have|pass|remove)\b/.test(t))
    return pick("not_interested", "Declined.", "Mark lost and stop.");
  if (/\b(wrong (person|number)|not the owner|don'?t handle|reach out to)\b/.test(t))
    return pick("wrong_person", "Wrong contact.", "Mark lost.");
  if (/\b(interested|yes|sounds good|tell me more|let'?s talk|keen|love to)\b/.test(t))
    return pick("interested", "Expressed interest.", "Send booking link.");
  if (t.includes("?")) return pick("question", "Asked a question.", "Answer directly.");
  return pick("not_interested", "Ambiguous / low signal.", "Mark lost and stop.");
}

function pricingReply(s: {
  offers: { level1: { setup: string; monthly: string }; level2: { setup: string; retainer: string } };
  booking_link: string;
}): string {
  return [
    "Happy to share how it works — two straightforward options:",
    "",
    `• Website Refresh — ${s.offers.level1.setup} one-time (or ${s.offers.level1.monthly} maintenance). A modern, mobile-first site with a real quote path and reviews.`,
    `• Growth System — ${s.offers.level2.setup} to build, then ${s.offers.level2.retainer}. Website + local SEO + landing page + tracked lead funnel + monthly reporting.`,
    "",
    "No long contracts and you own what we build. Want to walk through which fits?",
    s.booking_link,
  ].join("\n");
}

async function sendAutoReply(lead: Lead, bodyText: string): Promise<boolean> {
  const db = getDb();
  let status: OutreachMessage["send_status"] = "simulated";
  if (config.mode === "live" && lead.email) {
    const res = await getEmail().send({
      to: lead.email,
      subject: `Re: your reply`,
      html: `<p>${bodyText.replace(/\n/g, "<br/>")}</p>`,
      text: bodyText,
    });
    status = res.status;
  }
  const msg: OutreachMessage = {
    id: id(),
    lead_id: lead.id,
    channel: lead.email ? "email" : "contact_form",
    subject: "Re: your reply",
    body: bodyText,
    send_status: status,
    sent_at: now(),
    sequence_step: 90, // 90+ = reply-handling auto-response, outside the cold sequence
    reply_detected: false,
    bounced: false,
    unsubscribe_detected: false,
    complaint_detected: false,
    created_at: now(),
  };
  await db.insert("outreach_messages", msg);
  return status === "sent" || status === "simulated";
}

function appendNote(existing: string | null, line: string): string {
  return existing ? `${existing}\n${line}` : line;
}

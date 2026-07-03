import type { Lead, LeadStatus, ReplyType } from "@/lib/radar/types";
import { getDb } from "@/lib/radar/db";
import { withRun } from "@/lib/radar/log";
import { domainOf, id, normalizePhone, now } from "@/lib/radar/util";

/**
 * Loop 6 — Compliance / Suppression Agent.
 *
 * The hard-stop of the system. Any opt-out, complaint, or bounce results in a
 * permanent suppression entry (email + domain + phone + name), flips the lead
 * to a terminal status, sets do_not_contact, and clears any scheduled follow-up
 * so nothing else can ever be sent. There is no override path in the loop.
 */

const OPTOUT_RE =
  /\b(unsubscribe|opt[\s-]?out|remove me|take me off|stop( emailing| contacting)?|do not (contact|email)|no thanks?,? (stop|remove)|leave me alone)\b/i;

const COMPLAINT_RE =
  /\b(spam|reported?|harass|lawsuit|attorney|cease and desist|f[\W_]*ck off|scam|stop bothering)\b/i;

const BOUNCE_RE =
  /\b(mailer-daemon|delivery (has )?failed|undeliverable|address not found|550|recipient .* rejected|no such user)\b/i;

export function detectOptOut(text: string): boolean {
  return OPTOUT_RE.test(text);
}
export function detectComplaint(text: string): boolean {
  return COMPLAINT_RE.test(text);
}
export function detectBounce(text: string): boolean {
  return BOUNCE_RE.test(text);
}

const STATUS_FOR: Record<string, LeadStatus> = {
  unsubscribe: "opted_out",
  complaint: "suppressed",
  bounce: "bounced",
};

/**
 * Suppress a lead. `kind` picks the terminal status; `reason` is logged. Idempotent.
 */
export async function suppressLead(
  lead: Lead,
  kind: "unsubscribe" | "complaint" | "bounce" | "manual",
  reason: string
): Promise<Lead> {
  return withRun("compliance", { leadId: lead.id, input: { kind, reason } }, async () => {
    const db = getDb();

    // Record suppression across every identifier we hold.
    await db.insert("suppression_list", {
      id: id(),
      email: lead.email?.toLowerCase() ?? null,
      domain: domainOf(lead.website_url) ?? domainOf(lead.email),
      phone: normalizePhone(lead.phone),
      business_name: lead.business_name,
      reason: `${kind}: ${reason}`.slice(0, 300),
      created_at: now(),
    });

    const status: LeadStatus = kind === "manual" ? "suppressed" : STATUS_FOR[kind];
    const updated = (await db.update("leads", lead.id, {
      status,
      do_not_contact: true,
      suppression_reason: `${kind}: ${reason}`.slice(0, 300),
      next_action_at: null,
      last_checked_at: now(),
    })) as Lead;

    // Flag any in-flight messages so reporting is accurate.
    const msgs = await db.list("outreach_messages", { where: { lead_id: lead.id } });
    for (const m of msgs) {
      const patch =
        kind === "bounce"
          ? { bounced: true }
          : kind === "unsubscribe"
            ? { unsubscribe_detected: true }
            : { complaint_detected: true };
      await db.update("outreach_messages", m.id, patch);
    }

    return { output: { status, suppressed: true }, result: updated };
  });
}

/** Map a classified reply type to a suppression action, if any. */
export async function applyComplianceFromReply(
  lead: Lead,
  replyType: ReplyType,
  raw: string
): Promise<Lead | null> {
  if (replyType === "unsubscribe") return suppressLead(lead, "unsubscribe", firstLine(raw));
  if (replyType === "complaint") return suppressLead(lead, "complaint", firstLine(raw));
  if (replyType === "bounce") return suppressLead(lead, "bounce", firstLine(raw));
  return null;
}

function firstLine(s: string): string {
  return s.split("\n")[0].slice(0, 140);
}

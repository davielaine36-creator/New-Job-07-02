import type { Lead, LeadStatus } from "@/lib/radar/types";
import { getDb } from "@/lib/radar/db";
import { domainOf, normalizePhone } from "@/lib/radar/util";

/**
 * Shared read/query helpers over the storage layer. Agents stay focused on
 * decisions; the plumbing lives here.
 */

export async function getLead(leadId: string): Promise<Lead | null> {
  return getDb().get("leads", leadId);
}

export async function updateLead(
  leadId: string,
  patch: Partial<Lead>
): Promise<Lead | null> {
  return getDb().update("leads", leadId, patch);
}

export async function leadsByStatus(status: LeadStatus): Promise<Lead[]> {
  return getDb().list("leads", { where: { status } });
}

export async function allLeads(): Promise<Lead[]> {
  return getDb().list("leads", {
    order: { column: "discovered_at", dir: "desc" },
  });
}

/**
 * Is this lead on the suppression list? Matches on email, domain, phone, or
 * exact business name — any hit means we never contact. This is the last line
 * of defense before any send.
 */
export async function isSuppressed(lead: Lead): Promise<boolean> {
  if (lead.do_not_contact) return true;
  const list = await getDb().list("suppression_list");
  const domain = domainOf(lead.website_url) ?? domainOf(lead.email);
  const phone = normalizePhone(lead.phone);
  const email = lead.email?.toLowerCase() ?? null;
  return list.some(
    (s) =>
      (email && s.email && s.email.toLowerCase() === email) ||
      (domain && s.domain && s.domain.toLowerCase() === domain) ||
      (phone && s.phone && normalizePhone(s.phone) === phone) ||
      (s.business_name &&
        s.business_name.toLowerCase() === lead.business_name.toLowerCase())
  );
}

/** A lead is contactable if it has a real channel and is not suppressed. */
export async function isContactable(lead: Lead): Promise<boolean> {
  if (await isSuppressed(lead)) return false;
  return Boolean(lead.email || lead.contact_page_url);
}

/**
 * Cold outreach sends since UTC midnight — this is what the daily cap governs.
 * Reply-handling auto-responses (sequence_step >= 90) are solicited and do NOT
 * count against the cold-send cap.
 */
export async function sendsToday(): Promise<number> {
  const msgs = await getDb().list("outreach_messages");
  const midnight = new Date();
  midnight.setUTCHours(0, 0, 0, 0);
  const floor = midnight.toISOString();
  return msgs.filter(
    (m) =>
      m.sent_at &&
      m.sent_at >= floor &&
      m.sequence_step < 90 &&
      (m.send_status === "sent" || m.send_status === "simulated")
  ).length;
}

export async function latestAuditFor(leadId: string) {
  const rows = await getDb().list("audits", {
    where: { lead_id: leadId },
    order: { column: "created_at", dir: "desc" },
    limit: 1,
  });
  return rows[0] ?? null;
}

export async function latestDemoFor(leadId: string) {
  const rows = await getDb().list("demos", {
    where: { lead_id: leadId },
    order: { column: "created_at", dir: "desc" },
    limit: 1,
  });
  return rows[0] ?? null;
}

export async function messagesFor(leadId: string) {
  return getDb().list("outreach_messages", {
    where: { lead_id: leadId },
    order: { column: "sequence_step", dir: "asc" },
  });
}

export async function repliesFor(leadId: string) {
  return getDb().list("replies", {
    where: { lead_id: leadId },
    order: { column: "created_at", dir: "asc" },
  });
}

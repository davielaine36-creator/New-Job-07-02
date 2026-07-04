import type { OutreachStatus } from "@/lib/radar/types";
import type { SenderIdentity } from "@/lib/radar/settings";
import { config } from "@/lib/radar/config";
import { ResendEmail } from "./resend";

export interface SendRequest {
  to: string;
  subject: string;
  html: string;
  text: string;
  headers?: Record<string, string>;
}

export interface SendResult {
  status: OutreachStatus;
  provider_id: string | null;
  detail?: string;
}

export interface EmailAdapter {
  readonly kind: "mock" | "resend";
  send(req: SendRequest): Promise<SendResult>;
}

/**
 * Mock email — never touches the network. Records the send as "simulated" so
 * the pipeline advances and the cockpit shows real message bodies without a
 * single real email leaving the building.
 */
class MockEmail implements EmailAdapter {
  readonly kind = "mock" as const;
  async send(req: SendRequest): Promise<SendResult> {
    console.info(`[radar/email:mock] → ${req.to} · ${req.subject}`);
    return { status: "simulated", provider_id: `sim_${Date.now()}` };
  }
}

let cached: EmailAdapter | null = null;
export function getEmail(): EmailAdapter {
  if (cached) return cached;
  const e = config.email;
  cached =
    config.mode === "live" && e.provider === "resend" && e.resendKey && e.from
      ? new ResendEmail(e.resendKey, e.from)
      : new MockEmail();
  return cached;
}

export function _resetEmailCache() {
  cached = null;
}

/**
 * CAN-SPAM compliant footer: identifiable sender, real physical address, and a
 * working opt-out. Appended to every outbound message. Never removed.
 */
export function complianceFooter(
  sender: SenderIdentity,
  unsubscribeText: string,
  unsubscribeUrl: string
): { text: string; html: string } {
  const optOut = unsubscribeText.replace("{{unsubscribe_url}}", unsubscribeUrl);
  const text = [
    "",
    "—",
    sender.signature,
    sender.company_name,
    sender.physical_address,
    "",
    optOut,
  ].join("\n");
  const html = `<hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0"/>
<p style="font-size:12px;color:#6b7280;line-height:1.6;margin:0">
${escapeHtml(sender.signature)}<br/>
${escapeHtml(sender.company_name)}<br/>
${escapeHtml(sender.physical_address)}<br/><br/>
${escapeHtml(unsubscribeText.replace("{{unsubscribe_url}}", "")).trim()}
<a href="${unsubscribeUrl}">unsubscribe</a>
</p>`;
  return { text, html };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

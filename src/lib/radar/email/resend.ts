import type { EmailAdapter, SendRequest, SendResult } from "./index";

/**
 * Resend adapter (https://resend.com) — a real transactional email sender.
 *
 * COMPLIANCE: authenticate the sending domain (SPF/DKIM/DMARC) in Resend, keep
 * the List-Unsubscribe header below intact, and respect the daily send cap
 * enforced upstream in the Outreach agent. Bounces/complaints flow back through
 * the Compliance agent into the suppression list.
 */
export class ResendEmail implements EmailAdapter {
  readonly kind = "resend" as const;
  constructor(private apiKey: string, private from: string) {}

  async send(req: SendRequest): Promise<SendResult> {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: this.from,
          to: req.to,
          subject: req.subject,
          html: req.html,
          text: req.text,
          headers: {
            // One-click unsubscribe per RFC 8058 — set by the caller.
            ...req.headers,
          },
        }),
      });
      if (!res.ok) {
        return {
          status: "failed",
          provider_id: null,
          detail: `Resend ${res.status}: ${await res.text().catch(() => "")}`,
        };
      }
      const data = (await res.json()) as { id?: string };
      return { status: "sent", provider_id: data.id ?? null };
    } catch (err) {
      return { status: "failed", provider_id: null, detail: (err as Error).message };
    }
  }
}

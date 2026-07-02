import { NextResponse } from "next/server";

/**
 * "Work With Me" enquiry endpoint.
 *
 * Delivers the enquiry to the author. By default it posts to a webhook
 * (ENQUIRY_WEBHOOK_URL — e.g. a private Slack/Discord/n8n/Zapier hook or
 * a transactional email trigger). If unset, it logs in preview mode so
 * the form is demonstrable before the channel is wired.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let payload: Record<string, unknown>;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const name = String(payload.name ?? "").trim();
  const email = String(payload.email ?? "").trim();
  const message = String(payload.message ?? "").trim();
  const budget = String(payload.budget ?? "").trim();

  // Honeypot — reject silently-successfully so bots don't learn anything.
  if (payload.company) return NextResponse.json({ ok: true });

  if (!name || !EMAIL_RE.test(email) || message.length < 10) {
    return NextResponse.json(
      { error: "Please add your name, a valid email, and a short message." },
      { status: 422 }
    );
  }

  try {
    if (process.env.ENQUIRY_WEBHOOK_URL) {
      const res = await fetch(process.env.ENQUIRY_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "enquiry",
          name,
          email,
          budget,
          message,
        }),
      });
      if (!res.ok) throw new Error(`Webhook responded ${res.status}`);
    } else {
      console.info("[enquiry] (preview)", { name, email, budget, message });
    }

    return NextResponse.json({
      ok: true,
      message: "Thank you — I'll be in touch within a few days.",
    });
  } catch (err) {
    console.error("[enquiry] delivery error:", err);
    return NextResponse.json(
      { error: "We couldn't send that just now. Please email me directly." },
      { status: 502 }
    );
  }
}

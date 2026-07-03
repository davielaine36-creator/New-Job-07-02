import { NextResponse } from "next/server";

/**
 * Demo request endpoint.
 *
 * Delivers the request to the Circle Health team. By default it posts to a
 * webhook (DEMO_WEBHOOK_URL — e.g. a private Slack/CRM/n8n/Zapier hook or a
 * transactional email trigger). If unset, it logs in preview mode so the form
 * is demonstrable before the channel is wired.
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
  const organization = String(payload.organization ?? "").trim();
  const role = String(payload.role ?? "").trim();
  const size = String(payload.size ?? "").trim();
  const message = String(payload.message ?? "").trim();

  // Honeypot — reject silently-successfully so bots don't learn anything.
  if (payload.company_url) return NextResponse.json({ ok: true });

  if (!name || !EMAIL_RE.test(email)) {
    return NextResponse.json(
      { error: "Please add your name and a valid work email." },
      { status: 422 }
    );
  }

  try {
    if (process.env.DEMO_WEBHOOK_URL) {
      const res = await fetch(process.env.DEMO_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "demo_request",
          name,
          email,
          organization,
          role,
          size,
          message,
        }),
      });
      if (!res.ok) throw new Error(`Webhook responded ${res.status}`);
    } else {
      console.info("[demo] (preview)", {
        name,
        email,
        organization,
        role,
        size,
        message,
      });
    }

    return NextResponse.json({
      ok: true,
      message:
        "Thanks — we'll be in touch within one business day to schedule your walkthrough.",
    });
  } catch (err) {
    console.error("[demo] delivery error:", err);
    return NextResponse.json(
      { error: "We couldn't send that just now. Please email hello@circlehealth.co." },
      { status: 502 }
    );
  }
}

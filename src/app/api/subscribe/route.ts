import { NextResponse } from "next/server";

/**
 * Newsletter subscription endpoint.
 *
 * Forwards a verified email to the owned newsletter system. Three modes,
 * selected by which environment variables are present:
 *
 *  1. Ghost Members  — POST to Ghost's Members API (GHOST_URL +
 *     GHOST_MEMBERS_* ). This is the recommended production path: one
 *     backend for content, membership and email.
 *  2. Generic ESP    — POST to an ESP endpoint (Beehiiv / Kit) using
 *     ESP_SUBSCRIBE_URL + ESP_API_KEY, if best-of-breed is chosen.
 *  3. Unconfigured    — accepts and logs the address so the UI works in
 *     preview; wire a provider before launch.
 *
 * Double opt-in / confirmation is handled by the provider, which is also
 * where SPF/DKIM/DMARC deliverability is configured (see README).
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let email = "";
  try {
    const body = await request.json();
    email = String(body?.email ?? "").trim().toLowerCase();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json(
      { error: "Please enter a valid email address." },
      { status: 422 }
    );
  }

  try {
    // 1. Ghost Members
    if (process.env.GHOST_URL && process.env.GHOST_MEMBERS_INTEGRATION_URL) {
      const res = await fetch(process.env.GHOST_MEMBERS_INTEGRATION_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok && res.status !== 409) {
        throw new Error(`Ghost members responded ${res.status}`);
      }
    }
    // 2. Generic ESP (Beehiiv / Kit style)
    else if (process.env.ESP_SUBSCRIBE_URL) {
      const res = await fetch(process.env.ESP_SUBSCRIBE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(process.env.ESP_API_KEY
            ? { Authorization: `Bearer ${process.env.ESP_API_KEY}` }
            : {}),
        },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error(`ESP responded ${res.status}`);
    }
    // 3. Unconfigured preview mode
    else {
      console.info(`[subscribe] (preview) captured ${email}`);
    }

    return NextResponse.json({
      ok: true,
      message: "Almost there — check your inbox to confirm.",
    });
  } catch (err) {
    console.error("[subscribe] provider error:", err);
    return NextResponse.json(
      { error: "We couldn't complete that just now. Please try again." },
      { status: 502 }
    );
  }
}

import { NextResponse } from "next/server";
import { getDb } from "@/lib/radar/db";
import { authorize, assertMockOrForced } from "@/lib/radar/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Wipe all factory data. Mock only unless force=true (and RADAR_ALLOW_RESET for Supabase). */
export async function POST(req: Request) {
  if (!authorize(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as { force?: boolean };
  try {
    assertMockOrForced(Boolean(body.force));
    await getDb().reset();
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { simulateReplies, type SimulateOptions } from "@/lib/radar/simulator";
import { authorize, assertMockOrForced } from "@/lib/radar/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Generate simulated inbound replies (mock mode). */
export async function POST(req: Request) {
  if (!authorize(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as SimulateOptions & { force?: boolean };
  try {
    assertMockOrForced(Boolean(body.force));
    const result = await simulateReplies(body);
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

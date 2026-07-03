import { NextResponse } from "next/server";
import { runTick, type TickOptions } from "@/lib/radar/orchestrator";
import { authorize } from "@/lib/radar/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Run one factory tick. Body: TickOptions (all optional). */
export async function POST(req: Request) {
  if (!authorize(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const opts = (await req.json().catch(() => ({}))) as TickOptions;
  try {
    const summary = await runTick(opts);
    return NextResponse.json(summary);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

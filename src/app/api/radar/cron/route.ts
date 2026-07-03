import { NextResponse } from "next/server";
import { runTick } from "@/lib/radar/orchestrator";
import { simulateReplies } from "@/lib/radar/simulator";
import { authorize } from "@/lib/radar/auth";
import { config } from "@/lib/radar/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Scheduled entry point (Vercel Cron → GET). Runs a full tick; once an hour it
 * also runs the optimizer (top of the hour). In mock mode it simulates inbound
 * replies so the demo keeps advancing on its own.
 */
export async function GET(req: Request) {
  if (!authorize(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const optimize = new Date().getUTCMinutes() < 10; // ~hourly optimizer pass
  try {
    const summary = await runTick({ discover: true, discoveryBatches: 2, optimize });
    let replies;
    if (config.mode === "mock") replies = await simulateReplies({ rate: 0.5, max: 15 });
    return NextResponse.json({ ok: true, summary, replies });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

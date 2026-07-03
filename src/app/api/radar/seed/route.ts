import { NextResponse } from "next/server";
import { runFactory, type RunFactoryOptions } from "@/lib/radar/seed";
import { authorize, assertMockOrForced } from "@/lib/radar/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Seed a full pipeline by running several ticks with simulated replies. */
export async function POST(req: Request) {
  if (!authorize(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as RunFactoryOptions & { force?: boolean };
  try {
    assertMockOrForced(Boolean(body.force));
    const result = await runFactory(body);
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

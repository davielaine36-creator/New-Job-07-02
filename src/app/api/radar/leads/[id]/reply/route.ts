import { NextResponse } from "next/server";
import { getLead } from "@/lib/radar/repo";
import { recordReply } from "@/lib/radar/agents";
import { authorize } from "@/lib/radar/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Inject an inbound reply for a lead and run it through the classifier. */
export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  if (!authorize(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  const body = (await req.json().catch(() => ({}))) as { text?: string };
  const lead = await getLead(id);
  if (!lead) return NextResponse.json({ error: "lead not found" }, { status: 404 });
  try {
    const result = await recordReply(lead, String(body.text ?? ""));
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

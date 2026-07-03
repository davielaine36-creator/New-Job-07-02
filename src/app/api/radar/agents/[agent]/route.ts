import { NextResponse } from "next/server";
import { getLead } from "@/lib/radar/repo";
import { authorize } from "@/lib/radar/auth";
import {
  auditLead,
  generateDemo,
  recordReply,
  runDiscovery,
  runOptimizer,
  runOutreachStep,
  scoreLead,
  suppressLead,
} from "@/lib/radar/agents";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Run a single agent manually (for testing / manual mode). This is the escape
 * hatch when AUTONOMOUS_MODE is off — the loop won't run, but each agent can be
 * exercised individually here.
 *
 * POST /api/radar/agents/:agent
 *   discovery        { niche, city, state, limit? }
 *   audit|scoring|demo|outreach  { leadId }
 *   reply_classifier { leadId, text }
 *   compliance       { leadId, reason? }
 *   optimizer        {}
 */
export async function POST(
  req: Request,
  ctx: { params: Promise<{ agent: string }> }
) {
  if (!authorize(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { agent } = await ctx.params;
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;

  try {
    switch (agent) {
      case "discovery":
        return NextResponse.json(
          await runDiscovery({
            niche: body.niche as never,
            city: String(body.city),
            state: String(body.state ?? "CA"),
            limit: body.limit ? Number(body.limit) : undefined,
          })
        );
      case "audit":
        return NextResponse.json(await auditLead(await requireLead(body)));
      case "scoring":
        return NextResponse.json(await scoreLead(await requireLead(body)));
      case "demo":
        return NextResponse.json(await generateDemo(await requireLead(body)));
      case "outreach":
        return NextResponse.json(await runOutreachStep(await requireLead(body)));
      case "reply_classifier":
        return NextResponse.json(
          await recordReply(await requireLead(body), String(body.text ?? ""))
        );
      case "compliance":
        return NextResponse.json(
          await suppressLead(await requireLead(body), "manual", String(body.reason ?? "manual"))
        );
      case "optimizer":
        return NextResponse.json(await runOptimizer());
      default:
        return NextResponse.json({ error: `unknown agent: ${agent}` }, { status: 404 });
    }
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

async function requireLead(body: Record<string, unknown>) {
  const id = String(body.leadId ?? body.lead_id ?? "");
  const lead = id ? await getLead(id) : null;
  if (!lead) throw new Error("leadId not found");
  return lead;
}

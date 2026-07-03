import { NextResponse } from "next/server";
import { getSettings, saveSettings, type RadarSettings } from "@/lib/radar/settings";
import { authorize } from "@/lib/radar/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await getSettings());
}

export async function POST(req: Request) {
  if (!authorize(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const patch = (await req.json().catch(() => ({}))) as Partial<RadarSettings>;
  try {
    const next = await saveSettings(patch);
    return NextResponse.json({ ok: true, settings: next });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

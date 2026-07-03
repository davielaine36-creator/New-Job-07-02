import { getDb } from "@/lib/radar/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Serves a generated demo as a standalone HTML page (this is the public
 * `demo_preview_url` the outreach links to). A route handler rather than a page
 * so it renders with no cockpit chrome — exactly what a prospect would see.
 */
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const demo = await getDb().get("demos", id);
  if (!demo) {
    return new Response("Demo not found", { status: 404 });
  }
  return new Response(demo.demo_html, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

/**
 * On-demand revalidation webhook for Ghost.
 *
 * Configure a Ghost webhook (post.published / post.edited / post.unpublished)
 * pointing at:
 *
 *   POST /api/revalidate?secret=$REVALIDATE_SECRET
 *
 * When an author publishes or edits in Ghost, the affected routes are
 * regenerated immediately — no wait for the ISR timer. Falls back to the
 * 60s revalidate window if the webhook isn't configured.
 */
export async function POST(request: Request) {
  const secret = new URL(request.url).searchParams.get("secret");
  if (
    !process.env.REVALIDATE_SECRET ||
    secret !== process.env.REVALIDATE_SECRET
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Revalidate the high-traffic surfaces. (Ghost's payload could be used
  // to target a single slug; refreshing the index + home is cheap.)
  for (const path of ["/", "/insights"]) {
    revalidatePath(path);
  }
  revalidatePath("/insights/[slug]", "page");

  return NextResponse.json({ revalidated: true });
}

import { config } from "@/lib/radar/config";

/**
 * Guard for mutating/cron endpoints. If RADAR_CRON_SECRET is set, callers must
 * present it (Bearer header, `x-radar-secret`, or `?secret=`). Vercel Cron
 * requests carry an `x-vercel-cron` header and are allowed through. When no
 * secret is configured (local mock dev) everything is permitted.
 */
export function authorize(req: Request): boolean {
  const secret = config.cronSecret;
  if (!secret) return true;
  if (req.headers.get("x-vercel-cron")) return true;

  const url = new URL(req.url);
  const provided =
    req.headers.get("x-radar-secret") ??
    req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ??
    url.searchParams.get("secret");
  return provided === secret;
}

/** Extra guard: block obviously destructive ops against a live database. */
export function assertMockOrForced(force: boolean): void {
  if (config.mode === "live" && !force) {
    throw new Error(
      "Refusing to run seed/simulate/reset against a live deployment. Pass force=true to override."
    );
  }
}

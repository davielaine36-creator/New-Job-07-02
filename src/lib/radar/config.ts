/**
 * AI Work Radar — runtime configuration.
 *
 * Every external dependency (database, AI model, lead sources, email) is
 * behind an adapter with a mock implementation, so the *entire* factory loop
 * runs with ZERO configuration. Set the variables below to swap a mock for a
 * real adapter one at a time.
 *
 * The two master switches:
 *   RADAR_MODE       "mock" (default) | "live"      — mock never touches the outside world
 *   AUTONOMOUS_MODE  "true" (default) | "false"     — when false, agents only run on manual trigger
 */

function env(key: string): string | undefined {
  const v = process.env[key];
  return v && v.trim() !== "" ? v.trim() : undefined;
}

function bool(key: string, fallback: boolean): boolean {
  const v = env(key);
  if (v === undefined) return fallback;
  return v === "1" || v.toLowerCase() === "true" || v.toLowerCase() === "yes";
}

export type RadarMode = "mock" | "live";

export const config = {
  /** "mock" = fully simulated, safe to run anywhere. "live" = real adapters where configured. */
  get mode(): RadarMode {
    return env("RADAR_MODE") === "live" ? "live" : "mock";
  },

  /** Master autonomy switch. When true the loop advances every lead without human approval. */
  get autonomous(): boolean {
    return bool("AUTONOMOUS_MODE", true);
  },

  /** Database adapter selection. Falls back to the in-memory/file mock when Supabase isn't wired. */
  get supabase() {
    const url = env("SUPABASE_URL") ?? env("NEXT_PUBLIC_SUPABASE_URL");
    const key =
      env("SUPABASE_SERVICE_ROLE_KEY") ??
      env("SUPABASE_SERVICE_KEY") ??
      env("SUPABASE_ANON_KEY");
    return url && key ? { url, key } : null;
  },

  /** AI provider. Without a key the deterministic mock model is used. */
  get ai() {
    return {
      key: env("ANTHROPIC_API_KEY"),
      model: env("RADAR_AI_MODEL") ?? "claude-opus-4-8",
      baseUrl: env("ANTHROPIC_BASE_URL") ?? "https://api.anthropic.com",
    };
  },

  /** Google Places (lead discovery). Without a key the mock source generates leads. */
  get places() {
    return { key: env("GOOGLE_PLACES_API_KEY") };
  },

  /** Outbound email adapter. Without config, sends are simulated. */
  get email() {
    return {
      provider: env("RADAR_EMAIL_PROVIDER"), // "resend" | "smtp" | undefined(mock)
      resendKey: env("RESEND_API_KEY"),
      from: env("RADAR_FROM_EMAIL"),
    };
  },

  /** Shared secret guarding the cron + agent trigger endpoints. */
  get cronSecret() {
    return env("RADAR_CRON_SECRET");
  },

  /** Public base URL, used to build demo preview links. */
  get baseUrl() {
    return (
      env("NEXT_PUBLIC_BASE_URL") ??
      env("NEXT_PUBLIC_SITE_URL") ??
      (env("VERCEL_URL") ? `https://${env("VERCEL_URL")}` : undefined) ??
      "http://localhost:3000"
    );
  },
} as const;

/** A quick capability snapshot for the cockpit "system" panel. */
export function capabilities() {
  return {
    mode: config.mode,
    autonomous: config.autonomous,
    db: config.supabase ? "supabase" : "mock",
    ai: config.ai.key ? "anthropic" : "mock",
    source: config.places.key ? "google-places" : "mock",
    email:
      config.email.provider && (config.email.resendKey || config.email.from)
        ? config.email.provider
        : "mock",
  } as const;
}

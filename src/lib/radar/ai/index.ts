import { config } from "@/lib/radar/config";
import { AnthropicAi } from "./anthropic";

/**
 * Model abstraction.
 *
 * Every generative agent step is expressed once and runs in both modes:
 *   - `mock` (default): the deterministic `mock()` closure produces shaped,
 *     realistic data with no network call.
 *   - live: the same request is sent to Anthropic; if the model errors or
 *     returns unparseable JSON we fall back to `mock()` so the loop never stalls.
 */
export interface TextRequest {
  system?: string;
  prompt: string;
  maxTokens?: number;
  temperature?: number;
}

export interface ObjectRequest<T> {
  system?: string;
  prompt: string;
  /** Human-readable description of the expected JSON shape (goes in the prompt). */
  schemaHint: string;
  /** Deterministic generator used in mock mode and as the live-mode fallback. */
  mock: () => T;
  maxTokens?: number;
}

export interface Ai {
  readonly kind: "mock" | "anthropic";
  text(req: TextRequest): Promise<string>;
  object<T>(req: ObjectRequest<T>): Promise<T>;
}

/** Mock model — no network. Structured calls just run the supplied generator. */
class MockAi implements Ai {
  readonly kind = "mock" as const;
  async text(req: TextRequest): Promise<string> {
    return `[[mock:${(req.prompt.slice(0, 40) || "").replace(/\s+/g, "_")}]]`;
  }
  async object<T>(req: ObjectRequest<T>): Promise<T> {
    return req.mock();
  }
}

let cached: Ai | null = null;

export function getAi(): Ai {
  if (cached) return cached;
  cached =
    config.mode === "live" && config.ai.key ? new AnthropicAi(config.ai) : new MockAi();
  return cached;
}

export function _resetAiCache() {
  cached = null;
}

/** Best-effort JSON extraction from a model response. */
export function extractJson<T>(text: string): T | null {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced ? fenced[1] : text;
  const start = candidate.search(/[[{]/);
  if (start === -1) return null;
  // Walk to the matching closing bracket.
  const open = candidate[start];
  const close = open === "{" ? "}" : "]";
  let depth = 0;
  for (let i = start; i < candidate.length; i++) {
    if (candidate[i] === open) depth++;
    else if (candidate[i] === close) {
      depth--;
      if (depth === 0) {
        try {
          return JSON.parse(candidate.slice(start, i + 1)) as T;
        } catch {
          return null;
        }
      }
    }
  }
  return null;
}

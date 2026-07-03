import type { Ai, ObjectRequest, TextRequest } from "./index";
import { extractJson } from "./index";

/**
 * Anthropic adapter — Messages API over fetch.
 *
 * Structured calls append a strict "return only JSON" instruction and parse
 * the result. Any failure (network, rate limit, bad JSON) falls back to the
 * request's deterministic `mock()` generator so an agent run still completes.
 */
export class AnthropicAi implements Ai {
  readonly kind = "anthropic" as const;
  constructor(
    private cfg: { key?: string; model: string; baseUrl: string }
  ) {}

  private async call(body: unknown): Promise<string> {
    const res = await fetch(`${this.cfg.baseUrl}/v1/messages`, {
      method: "POST",
      headers: {
        "x-api-key": this.cfg.key ?? "",
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      throw new Error(`Anthropic ${res.status}: ${await res.text().catch(() => "")}`);
    }
    const json = (await res.json()) as {
      content?: { type: string; text?: string }[];
    };
    return (json.content ?? [])
      .filter((b) => b.type === "text")
      .map((b) => b.text ?? "")
      .join("");
  }

  async text(req: TextRequest): Promise<string> {
    return this.call({
      model: this.cfg.model,
      max_tokens: req.maxTokens ?? 1024,
      temperature: req.temperature ?? 0.7,
      system: req.system,
      messages: [{ role: "user", content: req.prompt }],
    });
  }

  async object<T>(req: ObjectRequest<T>): Promise<T> {
    try {
      const out = await this.call({
        model: this.cfg.model,
        max_tokens: req.maxTokens ?? 2048,
        temperature: 0.4,
        system:
          (req.system ? req.system + "\n\n" : "") +
          `Respond with ONLY a single JSON value matching this shape:\n${req.schemaHint}\nNo prose, no code fences.`,
        messages: [{ role: "user", content: req.prompt }],
      });
      const parsed = extractJson<T>(out);
      if (parsed !== null) return parsed;
    } catch (err) {
      console.warn("[radar/ai] falling back to mock:", (err as Error).message);
    }
    return req.mock();
  }
}

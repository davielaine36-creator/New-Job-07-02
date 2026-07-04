import type { AgentName, AgentRun } from "@/lib/radar/types";
import { getDb } from "@/lib/radar/db";
import { id, now } from "@/lib/radar/util";

/**
 * Wrap an agent step so every execution is timed and written to `agent_runs`
 * — success or failure. This is the audit trail for the whole factory: the
 * cockpit "Agent Runs" view reads straight from it.
 */
export async function withRun<T>(
  agent: AgentName,
  ctx: { leadId?: string | null; input?: Record<string, unknown> },
  fn: () => Promise<{ output: Record<string, unknown>; result: T }>
): Promise<T> {
  const db = getDb();
  const start = Date.now();
  const base: Omit<AgentRun, "output" | "status" | "error" | "duration_ms"> = {
    id: id(),
    agent_name: agent,
    lead_id: ctx.leadId ?? null,
    input: ctx.input ?? null,
    created_at: now(),
  };
  try {
    const { output, result } = await fn();
    await db.insert("agent_runs", {
      ...base,
      output,
      status: "ok",
      error: null,
      duration_ms: Date.now() - start,
    });
    return result;
  } catch (err) {
    await db.insert("agent_runs", {
      ...base,
      output: null,
      status: "error",
      error: (err as Error).message?.slice(0, 500) ?? String(err),
      duration_ms: Date.now() - start,
    });
    throw err;
  }
}

export function log(scope: string, ...args: unknown[]) {
  console.info(`[radar/${scope}]`, ...args);
}

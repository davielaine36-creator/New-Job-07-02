import { runTick } from "./orchestrator";
import { simulateReplies } from "./simulator";
import { runOptimizer } from "./agents/optimizer";
import { getDb } from "./db";
import { config } from "./config";
import { log } from "./log";

export interface RunFactoryOptions {
  ticks?: number;
  reset?: boolean;
  simulate?: boolean;
  discoveryBatches?: number;
}

/**
 * Convenience driver for demos & tests: optionally wipe, then run several full
 * ticks with reply simulation interleaved and a final optimizer pass. After
 * this the whole pipeline — discovery → audit → score → demo → outreach →
 * replies → CRM → optimization — is populated. Mock mode only unless forced.
 */
export async function runFactory(opts: RunFactoryOptions = {}) {
  const ticks = opts.ticks ?? 6;
  const simulate = opts.simulate ?? config.mode === "mock";

  if (opts.reset) {
    await getDb().reset();
    log("seed", "database reset");
  }

  const perTick: unknown[] = [];
  for (let i = 0; i < ticks; i++) {
    const summary = await runTick({
      force: true,
      discover: true,
      discoveryBatches: opts.discoveryBatches ?? 3,
      optimize: false,
    });
    // After a couple of touches have gone out, start simulating inbound replies.
    let replies = { generated: 0, breakdown: {} as Record<string, number> };
    if (simulate && i >= 1) {
      replies = await simulateReplies({ rate: 0.5, max: 20 });
    }
    perTick.push({ tick: i + 1, ...summary, replies });
  }

  const optimizer = await runOptimizer();
  log("seed", `factory run complete (${ticks} ticks)`);
  return { ticks, perTick, optimizer };
}

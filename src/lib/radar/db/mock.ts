import fs from "fs";
import path from "path";
import type { TableName, Tables } from "@/lib/radar/types";
import { TABLE_NAMES } from "@/lib/radar/types";
import type { Db, ListOptions } from "./index";

type Store = { [K in TableName]: Map<string, Tables[K]> };

/**
 * In-memory store with best-effort JSON persistence.
 *
 * - A single instance is pinned to `globalThis` so it survives Next.js dev
 *   HMR (otherwise every hot reload would wipe the pipeline).
 * - On a writable filesystem it mirrors to `.radar-data/db.json` so the loop
 *   persists across restarts locally. On read-only/serverless filesystems it
 *   degrades silently to per-instance memory — perfect for a mock demo.
 */
const DATA_DIR =
  process.env.RADAR_DATA_DIR ?? path.join(process.cwd(), ".radar-data");
const DATA_FILE = path.join(DATA_DIR, "db.json");

const GLOBAL_KEY = "__radar_mock_db__";

function emptyStore(): Store {
  return Object.fromEntries(TABLE_NAMES.map((t) => [t, new Map()])) as Store;
}

function loadStore(): Store {
  const g = globalThis as Record<string, unknown>;
  if (g[GLOBAL_KEY]) return g[GLOBAL_KEY] as Store;

  const store = emptyStore();
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = JSON.parse(fs.readFileSync(DATA_FILE, "utf8")) as Record<
        string,
        unknown[]
      >;
      for (const t of TABLE_NAMES) {
        const rows = (raw[t] ?? []) as { id: string }[];
        for (const r of rows) store[t].set(r.id, r as never);
      }
    }
  } catch {
    /* corrupt or unreadable — start clean */
  }
  g[GLOBAL_KEY] = store;
  return store;
}

let persistScheduled = false;
function persist(store: Store) {
  // Debounce to one write per tick to avoid thrashing during batch inserts.
  if (persistScheduled) return;
  persistScheduled = true;
  queueMicrotask(() => {
    persistScheduled = false;
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });
      const out: Record<string, unknown[]> = {};
      for (const t of TABLE_NAMES) out[t] = [...store[t].values()];
      fs.writeFileSync(DATA_FILE, JSON.stringify(out, null, 2));
    } catch {
      /* read-only fs — memory only */
    }
  });
}

function matches<T extends TableName>(
  row: Tables[T],
  where?: Partial<Tables[T]>
): boolean {
  if (!where) return true;
  return Object.entries(where).every(
    ([k, v]) => (row as unknown as Record<string, unknown>)[k] === v
  );
}

export class MockDb implements Db {
  readonly kind = "mock" as const;
  private store = loadStore();

  async insert<T extends TableName>(table: T, row: Tables[T]) {
    this.store[table].set((row as { id: string }).id, row);
    persist(this.store);
    return row;
  }

  async insertMany<T extends TableName>(table: T, rows: Tables[T][]) {
    for (const r of rows) this.store[table].set((r as { id: string }).id, r);
    persist(this.store);
    return rows;
  }

  async get<T extends TableName>(table: T, id: string) {
    return this.store[table].get(id) ?? null;
  }

  async update<T extends TableName>(
    table: T,
    id: string,
    patch: Partial<Tables[T]>
  ) {
    const cur = this.store[table].get(id);
    if (!cur) return null;
    const next = { ...cur, ...patch };
    this.store[table].set(id, next);
    persist(this.store);
    return next;
  }

  async remove<T extends TableName>(table: T, id: string) {
    this.store[table].delete(id);
    persist(this.store);
  }

  async list<T extends TableName>(table: T, opts: ListOptions<T> = {}) {
    let rows = [...this.store[table].values()].filter((r) =>
      matches(r, opts.where)
    );
    if (opts.order) {
      const { column, dir } = opts.order;
      rows = rows.sort((a, b) => {
        const av = (a as unknown as Record<string, unknown>)[column as string];
        const bv = (b as unknown as Record<string, unknown>)[column as string];
        if (av === bv) return 0;
        const cmp = (av as number | string) < (bv as number | string) ? -1 : 1;
        return dir === "asc" ? cmp : -cmp;
      });
    }
    return opts.limit ? rows.slice(0, opts.limit) : rows;
  }

  async count<T extends TableName>(table: T, where?: Partial<Tables[T]>) {
    if (!where) return this.store[table].size;
    return [...this.store[table].values()].filter((r) => matches(r, where))
      .length;
  }

  async reset() {
    this.store = emptyStore();
    (globalThis as Record<string, unknown>)[GLOBAL_KEY] = this.store;
    persist(this.store);
  }
}

import type { TableName, Tables } from "@/lib/radar/types";
import { TABLE_NAMES } from "@/lib/radar/types";
import type { Db, ListOptions } from "./index";

/**
 * Supabase adapter over PostgREST (plain fetch — no @supabase/supabase-js
 * dependency, so nothing new to install). Point RADAR at a real project by
 * setting SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY; apply the migration in
 * `supabase/migrations/0001_init.sql` first so the tables exist.
 */
export class SupabaseDb implements Db {
  readonly kind = "supabase" as const;
  private base: string;
  private headers: Record<string, string>;

  constructor(cfg: { url: string; key: string }) {
    this.base = `${cfg.url.replace(/\/$/, "")}/rest/v1`;
    this.headers = {
      apikey: cfg.key,
      Authorization: `Bearer ${cfg.key}`,
      "Content-Type": "application/json",
    };
  }

  private async req(pathAndQuery: string, init: RequestInit = {}) {
    const res = await fetch(`${this.base}/${pathAndQuery}`, {
      ...init,
      headers: { ...this.headers, ...(init.headers as object) },
      cache: "no-store",
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Supabase ${init.method ?? "GET"} ${pathAndQuery} → ${res.status}: ${text}`);
    }
    return res;
  }

  async insert<T extends TableName>(table: T, row: Tables[T]) {
    const res = await this.req(table, {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify(row),
    });
    return ((await res.json()) as Tables[T][])[0];
  }

  async insertMany<T extends TableName>(table: T, rows: Tables[T][]) {
    if (!rows.length) return [];
    const res = await this.req(table, {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify(rows),
    });
    return (await res.json()) as Tables[T][];
  }

  async get<T extends TableName>(table: T, id: string) {
    const res = await this.req(`${table}?id=eq.${id}&limit=1`);
    const rows = (await res.json()) as Tables[T][];
    return rows[0] ?? null;
  }

  async update<T extends TableName>(
    table: T,
    id: string,
    patch: Partial<Tables[T]>
  ) {
    const res = await this.req(`${table}?id=eq.${id}`, {
      method: "PATCH",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify(patch),
    });
    const rows = (await res.json()) as Tables[T][];
    return rows[0] ?? null;
  }

  async remove<T extends TableName>(table: T, id: string) {
    await this.req(`${table}?id=eq.${id}`, { method: "DELETE" });
  }

  async list<T extends TableName>(table: T, opts: ListOptions<T> = {}) {
    const params = new URLSearchParams();
    if (opts.where) {
      for (const [k, v] of Object.entries(opts.where)) {
        params.append(k, v === null ? "is.null" : `eq.${v}`);
      }
    }
    if (opts.order) params.set("order", `${opts.order.column}.${opts.order.dir}`);
    if (opts.limit) params.set("limit", String(opts.limit));
    const res = await this.req(`${table}?${params.toString()}`);
    return (await res.json()) as Tables[T][];
  }

  async count<T extends TableName>(table: T, where?: Partial<Tables[T]>) {
    const params = new URLSearchParams({ select: "id" });
    if (where) {
      for (const [k, v] of Object.entries(where)) {
        params.append(k, v === null ? "is.null" : `eq.${v}`);
      }
    }
    const res = await this.req(`${table}?${params.toString()}`, {
      method: "HEAD",
      headers: { Prefer: "count=exact" },
    });
    const range = res.headers.get("content-range"); // "0-24/137"
    return range ? Number(range.split("/")[1]) || 0 : 0;
  }

  async reset() {
    if (process.env.RADAR_ALLOW_RESET !== "true") {
      throw new Error(
        "Refusing to reset a live Supabase database. Set RADAR_ALLOW_RESET=true to override."
      );
    }
    for (const t of TABLE_NAMES) {
      await this.req(`${t}?id=not.is.null`, { method: "DELETE" }).catch(() => {});
    }
  }
}

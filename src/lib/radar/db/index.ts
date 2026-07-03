import type { TableName, Tables } from "@/lib/radar/types";
import { config } from "@/lib/radar/config";
import { MockDb } from "./mock";
import { SupabaseDb } from "./supabase";

/**
 * Storage abstraction. The mock adapter (default) keeps the whole factory
 * runnable with no external services; the Supabase adapter is a drop-in
 * replacement that talks to PostgREST over fetch (no client dependency).
 */
export interface ListOptions<T extends TableName> {
  where?: Partial<Tables[T]>;
  order?: { column: keyof Tables[T] & string; dir: "asc" | "desc" };
  limit?: number;
}

export interface Db {
  readonly kind: "mock" | "supabase";
  insert<T extends TableName>(table: T, row: Tables[T]): Promise<Tables[T]>;
  insertMany<T extends TableName>(
    table: T,
    rows: Tables[T][]
  ): Promise<Tables[T][]>;
  get<T extends TableName>(table: T, id: string): Promise<Tables[T] | null>;
  update<T extends TableName>(
    table: T,
    id: string,
    patch: Partial<Tables[T]>
  ): Promise<Tables[T] | null>;
  remove<T extends TableName>(table: T, id: string): Promise<void>;
  list<T extends TableName>(
    table: T,
    opts?: ListOptions<T>
  ): Promise<Tables[T][]>;
  count<T extends TableName>(
    table: T,
    where?: Partial<Tables[T]>
  ): Promise<number>;
  reset(): Promise<void>;
}

let cached: Db | null = null;

export function getDb(): Db {
  if (cached) return cached;
  cached = config.supabase ? new SupabaseDb(config.supabase) : new MockDb();
  return cached;
}

/** Test/util hook — forget the cached adapter (used by mode toggles). */
export function _resetDbCache() {
  cached = null;
}

/** Small, dependency-free helpers shared across the factory. */

import { randomUUID } from "crypto";

export function id(): string {
  return randomUUID();
}

export function now(): string {
  return new Date().toISOString();
}

export function daysFromNow(days: number): string {
  return new Date(Date.now() + days * 86_400_000).toISOString();
}

export function hoursAgo(hours: number): string {
  return new Date(Date.now() - hours * 3_600_000).toISOString();
}

/** FNV-1a 32-bit hash → a stable numeric seed from any string. */
export function hashSeed(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/**
 * Deterministic mulberry32 PRNG. Given the same seed it always produces the
 * same stream — so the mock AI/audit/demo output for a given lead is stable
 * across runs (important: agents are idempotent-ish and the demo doesn't
 * reshuffle every tick).
 */
export function rng(seed: number) {
  let a = seed >>> 0;
  const next = () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    next,
    int: (min: number, max: number) => Math.floor(next() * (max - min + 1)) + min,
    pick: <T>(arr: readonly T[]): T => arr[Math.floor(next() * arr.length)],
    /** Pick n distinct items. */
    sample: <T>(arr: readonly T[], n: number): T[] => {
      const pool = [...arr];
      const out: T[] = [];
      while (out.length < n && pool.length) {
        out.push(pool.splice(Math.floor(next() * pool.length), 1)[0]);
      }
      return out;
    },
    bool: (p = 0.5) => next() < p,
  };
}

export function seededRng(...parts: (string | number)[]) {
  return rng(hashSeed(parts.join("|")));
}

export function clamp(n: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, n));
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}

export function domainOf(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const u = new URL(url.startsWith("http") ? url : `https://${url}`);
    return u.hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return null;
  }
}

export function normalizePhone(phone: string | null | undefined): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 10 ? digits.slice(-10) : digits || null;
}

/** Format cents-free USD ranges like "$500–$1,500". */
export function money(n: number): string {
  return `$${n.toLocaleString("en-US")}`;
}

export function titleCase(s: string): string {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

import { ghostConfigured, ghostSource } from "./ghost";
import { localSource } from "./local";
import type { ContentSource } from "./types";

/**
 * Backend selection.
 *
 * If Ghost credentials are present the site reads from headless Ghost;
 * otherwise it falls back to bundled local markdown. This lets the repo
 * build and preview with zero configuration, and go live against Ghost
 * by setting two environment variables — no code change.
 */
export const content: ContentSource = ghostConfigured()
  ? ghostSource
  : localSource;

export * from "./types";

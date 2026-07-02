/**
 * Content model shared by every backend adapter.
 *
 * The front-end reads only through these types, so the CMS can be
 * swapped (local markdown → headless Ghost → Sanity) without any page
 * or component change. A future "Listen" section adds an `Episode`
 * type alongside these — the same adapter pattern applies.
 */

export type ContentType = "essay" | "note";

export interface Author {
  name: string;
  role?: string;
  avatar?: string;
}

export interface PostImage {
  url: string;
  alt: string;
  width?: number;
  height?: number;
}

export interface Post {
  type: ContentType;
  slug: string;
  title: string;
  /** Short dek / excerpt used in listings and meta description. */
  excerpt: string;
  /** ISO 8601 publish date. */
  publishedAt: string;
  /** Estimated reading time in minutes (essays only, optional for notes). */
  readingTime?: number;
  featureImage?: PostImage;
  tags?: string[];
  author: Author;
  /**
   * Rendered content. For local markdown this is the raw markdown string;
   * for Ghost it is sanitised HTML. `format` tells the renderer which.
   */
  body: string;
  format: "markdown" | "html";
}

/** Minimal shape for listing pages — avoids shipping full bodies. */
export type PostSummary = Omit<Post, "body" | "format">;

/**
 * The contract every backend must satisfy. Selected at runtime in
 * `src/lib/content/index.ts` based on environment configuration.
 */
export interface ContentSource {
  listPosts(type: ContentType, limit?: number): Promise<PostSummary[]>;
  getPost(type: ContentType, slug: string): Promise<Post | null>;
  getSlugs(type: ContentType): Promise<string[]>;
}

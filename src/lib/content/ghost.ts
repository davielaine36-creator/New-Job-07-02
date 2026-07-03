import type {
  ContentSource,
  ContentType,
  Post,
  PostSummary,
} from "./types";

/**
 * Headless Ghost backend (recommended production stack).
 *
 * Uses Ghost's Content API directly over fetch — no SDK dependency, so
 * it works cleanly inside React Server Components with Next's fetch
 * caching. Configure with:
 *
 *   GHOST_URL=https://your-site.ghost.io
 *   GHOST_CONTENT_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxx
 *
 * Content mapping:
 *   - Insights are Ghost posts tagged `insight`.
 * A non-technical author publishes and edits everything in Ghost admin;
 * this front-end reads from the Content API and revalidates on a timer
 * (see `revalidate` below) or via a Ghost webhook → Next revalidate route.
 */

const GHOST_URL = process.env.GHOST_URL;
const GHOST_KEY = process.env.GHOST_CONTENT_API_KEY;
const API_VERSION = "v5.0";

// ISR window — how often published/edited content is re-fetched.
const REVALIDATE_SECONDS = 60;

export function ghostConfigured(): boolean {
  return Boolean(GHOST_URL && GHOST_KEY);
}

function tagFor(type: ContentType) {
  return type; // "insight"
}

interface GhostPost {
  slug: string;
  title: string;
  excerpt?: string;
  custom_excerpt?: string;
  html?: string;
  published_at: string;
  reading_time?: number;
  feature_image?: string;
  feature_image_alt?: string;
  tags?: { name: string; slug: string }[];
  primary_author?: { name: string; profile_image?: string };
}

function toPost(g: GhostPost, type: ContentType): Post {
  return {
    type,
    slug: g.slug,
    title: g.title,
    excerpt: g.custom_excerpt ?? g.excerpt ?? "",
    publishedAt: new Date(g.published_at).toISOString(),
    readingTime: g.reading_time,
    featureImage: g.feature_image
      ? { url: g.feature_image, alt: g.feature_image_alt ?? g.title }
      : undefined,
    tags: g.tags?.map((t) => t.name) ?? [],
    author: {
      name: g.primary_author?.name ?? "The Author",
      avatar: g.primary_author?.profile_image,
    },
    body: g.html ?? "",
    format: "html",
  };
}

async function ghostFetch(
  resource: string,
  params: Record<string, string>
): Promise<GhostPost[]> {
  const url = new URL(`${GHOST_URL}/ghost/api/content/${resource}/`);
  url.searchParams.set("key", GHOST_KEY!);
  url.searchParams.set("v", API_VERSION);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);

  const res = await fetch(url, { next: { revalidate: REVALIDATE_SECONDS } });
  if (!res.ok) {
    throw new Error(`Ghost API ${res.status}: ${await res.text()}`);
  }
  const json = (await res.json()) as { posts?: GhostPost[] };
  return json.posts ?? [];
}

export const ghostSource: ContentSource = {
  async listPosts(type, limit) {
    const posts = await ghostFetch("posts", {
      filter: `tag:${tagFor(type)}`,
      include: "tags,authors",
      limit: String(limit ?? 50),
      order: "published_at desc",
      fields:
        "slug,title,excerpt,custom_excerpt,published_at,reading_time,feature_image,feature_image_alt",
    });
    return posts.map((g) => {
      const { body: _b, format: _f, ...summary } = toPost(g, type);
      return summary as PostSummary;
    });
  },

  async getPost(type, slug) {
    const posts = await ghostFetch(`posts/slug/${slug}`, {
      include: "tags,authors",
    });
    const g = posts[0];
    return g ? toPost(g, type) : null;
  },

  async getSlugs(type) {
    const posts = await ghostFetch("posts", {
      filter: `tag:${tagFor(type)}`,
      fields: "slug",
      limit: "all",
    });
    return posts.map((g) => g.slug);
  },
};

import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import type {
  ContentSource,
  ContentType,
  Post,
  PostSummary,
} from "./types";

/**
 * Local markdown backend.
 *
 * Ships sample Insights articles so the site builds and renders with zero
 * external services. It is also the reference implementation for the
 * content contract: when Ghost is connected this file is bypassed.
 *
 * Files live in `content/<type>s/<slug>.md` with frontmatter:
 *
 *   ---
 *   title: "…"
 *   excerpt: "…"
 *   publishedAt: "2026-06-01"
 *   readingTime: 6
 *   tags: ["denials", "compliance"]
 *   author: { name: "…", role: "…" }
 *   ---
 */

const CONTENT_ROOT = path.join(process.cwd(), "content");

function dirFor(type: ContentType) {
  return path.join(CONTENT_ROOT, `${type}s`);
}

const WORDS_PER_MINUTE = 220;

function estimateReadingTime(markdown: string) {
  const words = markdown.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

async function readAll(type: ContentType): Promise<Post[]> {
  const dir = dirFor(type);
  let files: string[] = [];
  try {
    files = (await fs.readdir(dir)).filter((f) => f.endsWith(".md"));
  } catch {
    return [];
  }

  const posts = await Promise.all(
    files.map(async (file) => {
      const raw = await fs.readFile(path.join(dir, file), "utf8");
      const { data, content } = matter(raw);
      const slug = file.replace(/\.md$/, "");
      const post: Post = {
        type,
        slug,
        title: String(data.title ?? slug),
        excerpt: String(data.excerpt ?? ""),
        publishedAt: new Date(data.publishedAt ?? Date.now()).toISOString(),
        readingTime: data.readingTime ?? estimateReadingTime(content),
        featureImage: data.featureImage,
        tags: data.tags ?? [],
        author: data.author ?? { name: "The Author" },
        body: content,
        format: "markdown",
      };
      return post;
    })
  );

  return posts.sort(
    (a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt)
  );
}

export const localSource: ContentSource = {
  async listPosts(type, limit) {
    const posts = await readAll(type);
    const summaries: PostSummary[] = posts.map(
      ({ body: _body, format: _format, ...rest }) => rest
    );
    return typeof limit === "number" ? summaries.slice(0, limit) : summaries;
  },

  async getPost(type, slug) {
    const posts = await readAll(type);
    return posts.find((p) => p.slug === slug) ?? null;
  },

  async getSlugs(type) {
    const posts = await readAll(type);
    return posts.map((p) => p.slug);
  },
};

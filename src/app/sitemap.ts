import type { MetadataRoute } from "next";
import { content } from "@/lib/content";
import { site } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [essays, notes] = await Promise.all([
    content.listPosts("essay"),
    content.listPosts("note"),
  ]);

  const staticRoutes = ["", "/essays", "/notes", "/about", "/work-with-me", "/subscribe"].map(
    (path) => ({
      url: `${site.url}${path}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : 0.7,
    })
  );

  const essayRoutes = essays.map((p) => ({
    url: `${site.url}/essays/${p.slug}`,
    lastModified: new Date(p.publishedAt),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const noteRoutes = notes.map((p) => ({
    url: `${site.url}/notes/${p.slug}`,
    lastModified: new Date(p.publishedAt),
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  return [...staticRoutes, ...essayRoutes, ...noteRoutes];
}

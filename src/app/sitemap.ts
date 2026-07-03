import type { MetadataRoute } from "next";
import { content } from "@/lib/content";
import { site } from "@/lib/site";
import { assistants } from "@/lib/platform";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const insights = await content.listPosts("insight");

  const staticRoutes = [
    "",
    "/platform",
    "/security",
    "/insights",
    "/company",
    "/demo",
  ].map((path) => ({
    url: `${site.url}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.7,
  }));

  const platformRoutes = assistants.map((a) => ({
    url: `${site.url}/platform/${a.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const insightRoutes = insights.map((p) => ({
    url: `${site.url}/insights/${p.slug}`,
    lastModified: new Date(p.publishedAt),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...platformRoutes, ...insightRoutes];
}

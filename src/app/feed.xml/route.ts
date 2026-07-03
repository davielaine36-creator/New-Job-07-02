import { content } from "@/lib/content";
import { site } from "@/lib/site";

/**
 * RSS feed for Insights — the publishing surface a non-technical author
 * updates in the CMS. Kept in sync automatically via the content layer.
 */
export const revalidate = 300;

function escape(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function GET() {
  const insights = await content.listPosts("insight", 50);

  const items = insights
    .map(
      (p) => `
    <item>
      <title>${escape(p.title)}</title>
      <link>${site.url}/insights/${p.slug}</link>
      <guid isPermaLink="true">${site.url}/insights/${p.slug}</guid>
      <pubDate>${new Date(p.publishedAt).toUTCString()}</pubDate>
      <description>${escape(p.excerpt)}</description>
    </item>`
    )
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escape(site.name)} — Insights</title>
    <link>${site.url}</link>
    <description>${escape(site.description)}</description>
    <language>en</language>
    <atom:link href="${site.url}/feed.xml" rel="self" type="application/rss+xml" />${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
    },
  });
}

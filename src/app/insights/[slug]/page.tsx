import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { content } from "@/lib/content";
import { site } from "@/lib/site";
import { Container } from "@/components/container";
import { PostBody } from "@/components/post-body";
import { CTABand } from "@/components/cta-band";
import { formatDate, readingLabel } from "@/lib/format";

export const revalidate = 60;

export async function generateStaticParams() {
  const slugs = await content.getSlugs("insight");
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await content.getPost("insight", slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/insights/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      url: `${site.url}/insights/${post.slug}`,
      publishedTime: post.publishedAt,
    },
  };
}

export default async function InsightPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await content.getPost("insight", slug);
  if (!post) notFound();

  const meta = [formatDate(post.publishedAt), readingLabel(post.readingTime)]
    .filter(Boolean)
    .join(" · ");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt,
    author: { "@type": "Organization", name: post.author.name },
    publisher: { "@type": "Organization", name: site.name },
    mainEntityOfPage: `${site.url}/insights/${post.slug}`,
  };

  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Container className="pt-14 md:pt-20">
        <Link href="/insights" className="link-arrow">
          ← All insights
        </Link>

        <header className="mt-8 max-w-prose">
          <div className="flex flex-wrap gap-2">
            {post.tags?.map((tag) => (
              <span key={tag} className="chip-teal">
                {tag}
              </span>
            ))}
          </div>
          <h1 className="mt-5 font-display text-display-lg font-extrabold text-ink">
            {post.title}
          </h1>
          <p className="mt-5 text-sm text-muted">
            {post.author.name}
            {post.author.role ? ` · ${post.author.role}` : ""} · {meta}
          </p>
        </header>
      </Container>

      <Container className="py-12">
        <div className="max-w-prose border-t border-line pt-10">
          <PostBody post={post} />
        </div>
      </Container>

      <CTABand
        title="Documentation shouldn't cost you revenue"
        body="See how Circle catches necessity, coding, and compliance issues before they become denials."
      />
    </article>
  );
}

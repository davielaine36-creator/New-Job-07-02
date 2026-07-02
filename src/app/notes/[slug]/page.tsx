import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { content } from "@/lib/content";
import { site } from "@/lib/site";
import { Container } from "@/components/container";
import { PostBody } from "@/components/post-body";
import { formatDate } from "@/lib/format";

export const revalidate = 60;

export async function generateStaticParams() {
  const slugs = await content.getSlugs("note");
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await content.getPost("note", slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/notes/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      url: `${site.url}/notes/${post.slug}`,
      publishedTime: post.publishedAt,
    },
  };
}

export default async function NotePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await content.getPost("note", slug);
  if (!post) notFound();

  return (
    <Container className="pt-20 md:pt-28 pb-16">
      <Link href="/notes" className="text-sm text-ash link-underline">
        ← Notes
      </Link>

      <article className="mx-auto mt-10 max-w-prose">
        <p className="text-sm text-ash">{formatDate(post.publishedAt)}</p>
        <h1 className="mt-3 font-display text-display-md text-cream">
          {post.title}
        </h1>
        <div className="rule-gold my-10 w-16" />
        <PostBody post={post} />
      </article>
    </Container>
  );
}

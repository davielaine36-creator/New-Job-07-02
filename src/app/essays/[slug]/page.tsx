import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { content } from "@/lib/content";
import { site } from "@/lib/site";
import { Container } from "@/components/container";
import { PostBody } from "@/components/post-body";
import { SubscribeCTA } from "@/components/subscribe-cta";
import { formatDate, readingLabel } from "@/lib/format";

export const revalidate = 60;

export async function generateStaticParams() {
  const slugs = await content.getSlugs("essay");
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await content.getPost("essay", slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/essays/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      url: `${site.url}/essays/${post.slug}`,
      publishedTime: post.publishedAt,
      images: post.featureImage ? [{ url: post.featureImage.url }] : undefined,
    },
  };
}

export default async function EssayPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await content.getPost("essay", slug);
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
    author: { "@type": "Person", name: post.author.name },
    image: post.featureImage?.url,
    mainEntityOfPage: `${site.url}/essays/${post.slug}`,
  };

  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Container className="pt-20 md:pt-28">
        <Link
          href="/essays"
          className="text-sm text-ash link-underline"
        >
          ← Essays
        </Link>

        <header className="mx-auto mt-10 max-w-prose text-center">
          {post.tags?.[0] && <p className="eyebrow">{post.tags[0]}</p>}
          <h1 className="mt-5 font-display text-display-lg text-cream">
            {post.title}
          </h1>
          <p className="mt-6 text-mist">{meta}</p>
        </header>

        {post.featureImage && (
          <div className="mx-auto mt-14 max-w-4xl">
            <div className="relative aspect-[16/9] overflow-hidden rounded-xl border border-graphite">
              <Image
                src={post.featureImage.url}
                alt={post.featureImage.alt}
                fill
                priority
                sizes="(max-width: 896px) 100vw, 56rem"
                className="object-cover"
              />
            </div>
          </div>
        )}
      </Container>

      <Container className="py-16">
        <div className="mx-auto">
          <div className="rule-gold mx-auto mb-14 w-24" />
          <div className="mx-auto max-w-prose">
            <PostBody post={post} />
          </div>
        </div>
      </Container>

      <div className="rule-gold mx-auto max-w-shell" />
      <SubscribeCTA
        eyebrow="Enjoyed this?"
        heading="Get the next one by email."
        copy="Every essay lands in subscribers' inboxes the moment it's published. Join and never miss one."
      />
    </article>
  );
}

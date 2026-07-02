import Link from "next/link";
import Image from "next/image";
import type { PostSummary } from "@/lib/content";
import { formatDate, readingLabel } from "@/lib/format";
import { clsx } from "@/lib/clsx";

/**
 * Essay listing row. Type-led and space-led: a hairline divider, a date,
 * the title, and a one-line dek. Photography is optional, never filler.
 */
export function EssayCard({
  post,
  featured = false,
}: {
  post: PostSummary;
  featured?: boolean;
}) {
  const href = `/essays/${post.slug}`;
  const meta = [formatDate(post.publishedAt), readingLabel(post.readingTime)]
    .filter(Boolean)
    .join(" · ");

  return (
    <article
      className={clsx(
        "group border-t border-graphite/70 first:border-t-0",
        featured ? "py-10" : "py-8"
      )}
    >
      <Link href={href} className="grid gap-6 md:grid-cols-[1fr_auto] md:items-start">
        <div className="order-2 md:order-1">
          <p className="text-xs tracking-wide text-ash">{meta}</p>
          <h3
            className={clsx(
              "mt-3 font-display text-cream tracking-tight transition-colors duration-300 group-hover:text-champagne",
              featured ? "text-display-md" : "text-2xl md:text-[1.7rem] leading-snug"
            )}
          >
            {post.title}
          </h3>
          <p className="mt-3 max-w-xl text-mist leading-relaxed">
            {post.excerpt}
          </p>
          <span className="mt-5 inline-flex items-center gap-2 text-sm text-goldsoft transition-colors group-hover:text-champagne">
            Read essay
            <span className="transition-transform duration-500 ease-lux group-hover:translate-x-1">
              →
            </span>
          </span>
        </div>

        {post.featureImage && featured && (
          <div className="order-1 md:order-2 md:w-64 lg:w-80">
            <div className="relative aspect-[4/5] overflow-hidden rounded-lg border border-graphite">
              <Image
                src={post.featureImage.url}
                alt={post.featureImage.alt}
                fill
                sizes="(max-width: 768px) 100vw, 20rem"
                className="object-cover transition-transform duration-700 ease-lux group-hover:scale-[1.03]"
              />
            </div>
          </div>
        )}
      </Link>
    </article>
  );
}

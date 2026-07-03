import Link from "next/link";
import type { PostSummary } from "@/lib/content";
import { formatDate, readingLabel } from "@/lib/format";
import { ArrowRight } from "./icons";

/**
 * Insight listing card — clean, light, and readable. Used on /insights.
 */
export function InsightCard({ post }: { post: PostSummary }) {
  const href = `/insights/${post.slug}`;
  const meta = [formatDate(post.publishedAt), readingLabel(post.readingTime)]
    .filter(Boolean)
    .join(" · ");

  return (
    <Link href={href} className="card card-hover group flex h-full flex-col p-7">
      <div className="flex flex-wrap items-center gap-2">
        {post.tags?.slice(0, 2).map((tag) => (
          <span key={tag} className="chip-teal">
            {tag}
          </span>
        ))}
      </div>
      <h3 className="mt-5 font-display text-xl font-bold leading-snug text-ink transition-colors group-hover:text-teal">
        {post.title}
      </h3>
      <p className="mt-3 flex-1 text-sm leading-relaxed text-slate">
        {post.excerpt}
      </p>
      <div className="mt-6 flex items-center justify-between">
        <p className="text-xs text-muted">{meta}</p>
        <span className="link-arrow">
          Read
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}

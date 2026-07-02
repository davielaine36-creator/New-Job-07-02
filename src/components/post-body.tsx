import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import type { Post } from "@/lib/content";

/**
 * Renders post bodies for both backends:
 *   - Ghost   → sanitised HTML, rendered as-is (Ghost handles embeds).
 *   - Local   → markdown, parsed with GFM and raw-HTML support so an
 *     author can drop in <iframe> video or <img> figures inline.
 *
 * Raw HTML is passed through a sanitiser that additionally allows the
 * iframe/video attributes needed for embedded film and clips.
 */

const schema = {
  ...defaultSchema,
  tagNames: [
    ...(defaultSchema.tagNames ?? []),
    "iframe",
    "video",
    "source",
    "figure",
    "figcaption",
  ],
  attributes: {
    ...defaultSchema.attributes,
    iframe: [
      "src",
      "width",
      "height",
      "title",
      "allow",
      "allowfullscreen",
      "loading",
      "frameborder",
    ],
    video: ["src", "controls", "poster", "width", "height", "preload", "loop", "muted", "playsinline"],
    source: ["src", "type"],
    "*": [...(defaultSchema.attributes?.["*"] ?? []), "className", "style"],
  },
} as typeof defaultSchema;

export function PostBody({ post }: { post: Post }) {
  if (post.format === "html") {
    return (
      <div
        className="prose-lux"
        // Ghost returns pre-sanitised HTML from a trusted, owned CMS.
        dangerouslySetInnerHTML={{ __html: post.body }}
      />
    );
  }

  return (
    <div className="prose-lux">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, [rehypeSanitize, schema]]}
      >
        {post.body}
      </ReactMarkdown>
    </div>
  );
}

import Link from "next/link";
import { content } from "@/lib/content";
import { site } from "@/lib/site";
import { Container } from "@/components/container";
import { Reveal } from "@/components/reveal";
import { EssayCard } from "@/components/post-card";
import { SubscribeCTA } from "@/components/subscribe-cta";
import { NewsletterForm } from "@/components/newsletter-form";
import { formatDate } from "@/lib/format";

export default async function HomePage() {
  const [essays, notes] = await Promise.all([
    content.listPosts("essay", 4),
    content.listPosts("note", 3),
  ]);

  const [lead, ...rest] = essays;

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <Container as="section" className="pt-24 md:pt-36 pb-20 md:pb-28">
        <div className="max-w-4xl">
          <Reveal>
            <div className="flex items-center gap-4">
              <span className="rule-gold w-14" />
              <p className="eyebrow">{site.tagline}</p>
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="mt-8 font-display text-display-xl text-cream">
              Quiet power,
              <br />
              <span className="text-champagne">precisely</span> written.
            </h1>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="mt-8 max-w-xl text-lg leading-relaxed text-mist">
              {site.description}
            </p>
          </Reveal>
          <Reveal delay={0.24}>
            <div className="mt-10 flex flex-col sm:flex-row sm:items-center gap-5">
              <NewsletterForm />
            </div>
          </Reveal>
        </div>
      </Container>

      {/* ── Latest essays ────────────────────────────────────── */}
      <Container as="section" className="py-8">
        <Reveal className="flex items-end justify-between">
          <div>
            <p className="eyebrow">Latest</p>
            <h2 className="mt-3 font-display text-display-md text-cream">
              Essays
            </h2>
          </div>
          <Link
            href="/essays"
            className="hidden sm:inline-flex text-sm text-goldsoft link-underline"
          >
            The archive →
          </Link>
        </Reveal>

        <div className="mt-12">
          {lead && <EssayCard post={lead} featured />}
          <div className="mt-2">
            {rest.map((post) => (
              <EssayCard key={post.slug} post={post} />
            ))}
          </div>
          {essays.length === 0 && (
            <p className="text-mist">Essays are on their way.</p>
          )}
        </div>

        <Link
          href="/essays"
          className="mt-10 inline-flex sm:hidden text-sm text-goldsoft link-underline"
        >
          The archive →
        </Link>
      </Container>

      {/* ── Notes strip ──────────────────────────────────────── */}
      {notes.length > 0 && (
        <Container as="section" className="py-20 md:py-28">
          <div className="rule-gold mb-16" />
          <Reveal className="flex items-end justify-between">
            <div>
              <p className="eyebrow">Shorter</p>
              <h2 className="mt-3 font-display text-display-md text-cream">
                Notes
              </h2>
            </div>
            <Link
              href="/notes"
              className="hidden sm:inline-flex text-sm text-goldsoft link-underline"
            >
              All notes →
            </Link>
          </Reveal>

          <div className="mt-12 grid gap-px overflow-hidden rounded-lg border border-graphite/70 sm:grid-cols-3 bg-graphite/40">
            {notes.map((note, i) => (
              <Reveal
                as="article"
                key={note.slug}
                delay={i * 0.06}
                className="bg-obsidian p-8 transition-colors duration-500 hover:bg-onyx"
              >
                <Link href={`/notes/${note.slug}`} className="block group">
                  <p className="text-xs text-ash">
                    {formatDate(note.publishedAt)}
                  </p>
                  <h3 className="mt-3 font-display text-xl leading-snug text-cream transition-colors group-hover:text-champagne">
                    {note.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-mist line-clamp-3">
                    {note.excerpt}
                  </p>
                </Link>
              </Reveal>
            ))}
          </div>
        </Container>
      )}

      <div className="rule-gold mx-auto max-w-shell" />
      <SubscribeCTA />
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { content } from "@/lib/content";
import { Container } from "@/components/container";
import { Reveal } from "@/components/reveal";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "Notes",
  description: "Shorter observations, fragments, and rabbit holes.",
};

export default async function NotesPage() {
  const notes = await content.listPosts("note");

  return (
    <Container className="pt-24 md:pt-32 pb-10">
      <Reveal className="max-w-2xl">
        <div className="rule-gold mb-8 w-16" />
        <h1 className="font-display text-display-lg text-cream">Notes</h1>
        <p className="mt-6 text-lg leading-relaxed text-mist">
          Shorter observations, fragments, and rabbit holes. A clip with a
          caption; a paragraph worth keeping; a thread pulled loose.
        </p>
      </Reveal>

      <section className="mt-16 divide-y divide-graphite/70">
        {notes.map((note, i) => (
          <Reveal as="article" key={note.slug} delay={Math.min(i * 0.05, 0.3)}>
            <Link
              href={`/notes/${note.slug}`}
              className="group grid gap-3 py-8 md:grid-cols-[9rem_1fr] md:gap-8"
            >
              <p className="text-sm text-ash md:pt-1">
                {formatDate(note.publishedAt)}
              </p>
              <div>
                <h2 className="font-display text-2xl leading-snug text-cream transition-colors group-hover:text-champagne">
                  {note.title}
                </h2>
                <p className="mt-2 max-w-xl text-mist leading-relaxed">
                  {note.excerpt}
                </p>
              </div>
            </Link>
          </Reveal>
        ))}
        {notes.length === 0 && <p className="text-mist">No notes yet.</p>}
      </section>
    </Container>
  );
}

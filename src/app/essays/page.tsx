import type { Metadata } from "next";
import { content } from "@/lib/content";
import { Container } from "@/components/container";
import { Reveal } from "@/components/reveal";
import { EssayCard } from "@/components/post-card";

export const metadata: Metadata = {
  title: "Essays",
  description:
    "The weekly long-form archive — also the complete newsletter archive.",
};

export default async function EssaysPage() {
  const essays = await content.listPosts("essay");

  return (
    <Container className="pt-24 md:pt-32 pb-10">
      <Reveal className="max-w-2xl">
        <div className="rule-gold mb-8 w-16" />
        <h1 className="font-display text-display-lg text-cream">Essays</h1>
        <p className="mt-6 text-lg leading-relaxed text-mist">
          Weekly long-form writing. Each essay is published here and sent to
          subscribers by email — this page is the canonical archive of both.
        </p>
      </Reveal>

      <section className="mt-16">
        {essays.map((post, i) => (
          <EssayCard key={post.slug} post={post} featured={i === 0} />
        ))}
        {essays.length === 0 && (
          <p className="text-mist">The archive is being prepared.</p>
        )}
      </section>
    </Container>
  );
}

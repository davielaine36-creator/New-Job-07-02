import type { Metadata } from "next";
import { content } from "@/lib/content";
import { Container } from "@/components/container";
import { Reveal } from "@/components/reveal";
import { InsightCard } from "@/components/post-card";
import { CTABand } from "@/components/cta-band";

export const metadata: Metadata = {
  title: "Insights",
  description:
    "Perspectives on behavioral health documentation, denials, compliance, and the role of AI in the revenue cycle.",
};

export const revalidate = 60;

export default async function InsightsPage() {
  const posts = await content.listPosts("insight");

  return (
    <>
      <section className="bg-aurora">
        <Container className="pt-16 pb-14 md:pt-24 md:pb-16">
          <Reveal className="max-w-2xl">
            <p className="eyebrow">Insights</p>
            <h1 className="mt-4 font-display text-display-lg font-extrabold text-ink">
              Notes from the front line of behavioral health documentation.
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-slate">
              Practical perspectives on denials, compliance, clinician time, and
              where AI actually belongs in the revenue cycle.
            </p>
          </Reveal>
        </Container>
      </section>

      <Container as="section" className="pb-8">
        {posts.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, i) => (
              <Reveal key={post.slug} delay={(i % 3) * 0.06} className="h-full">
                <InsightCard post={post} />
              </Reveal>
            ))}
          </div>
        ) : (
          <p className="text-slate">New writing is on the way.</p>
        )}
      </Container>

      <CTABand />
    </>
  );
}

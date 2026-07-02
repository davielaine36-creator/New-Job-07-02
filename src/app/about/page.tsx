import type { Metadata } from "next";
import { site } from "@/lib/site";
import { Container } from "@/components/container";
import { Reveal } from "@/components/reveal";
import { SubscribeCTA } from "@/components/subscribe-cta";

export const metadata: Metadata = {
  title: "About",
  description: `About ${site.name} — ${site.tagline}`,
};

/**
 * Demo copy written in the brand voice. The brief specifies the client
 * will supply final About/bio text — this reads as finished rather than
 * as filler, and slots straight out when the real words arrive.
 */
export default function AboutPage() {
  return (
    <>
      <Container className="pt-24 md:pt-36 pb-8">
        <Reveal className="max-w-3xl">
          <div className="flex items-center gap-4">
            <span className="rule-gold w-14" />
            <p className="eyebrow">About</p>
          </div>
          <h1 className="mt-8 font-display text-display-lg text-cream">
            I write about the things we're too busy to notice.
          </h1>
        </Reveal>
      </Container>

      <Container className="pb-16">
        <div className="mx-auto max-w-prose prose-lux">
          <p>
            I'm Elliott Vane. Penumbra is where I think in public — long-form
            essays about culture, technology, and attention, published weekly
            and sent to a small, considered audience by email. It's the whole
            of the work in one quiet place: no feeds to chase, no algorithm to
            feed, nothing optimised for volume.
          </p>
          <p>
            The essays are the centre of it. Between them, Notes — shorter
            observations, fragments, and the occasional rabbit hole; a clip
            worth keeping, a paragraph I couldn't let go of, a thread pulled
            loose. Everything is written slowly and edited carefully, for the
            one reader who was always going to underline a sentence.
          </p>
          <blockquote>
            The intent is simple, and stubborn: to be worth reading, and worth
            keeping.
          </blockquote>
          <p>
            A podcast will join this archive in time. Until then the writing
            leads — and the newsletter is the surest way to receive it, the
            moment each piece is published. No noise. Unsubscribe whenever the
            spell breaks.
          </p>
          <p className="text-mist">— Elliott</p>
        </div>
      </Container>

      <div className="rule-gold mx-auto max-w-shell" />
      <SubscribeCTA />
    </>
  );
}

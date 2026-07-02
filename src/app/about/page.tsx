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
 * Copy here is placeholder scaffolding — the brief specifies all final
 * copy (About, bios, essays) will be supplied. Structure and rhythm are
 * production-ready; drop in the real words.
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
            A home base for a cultural-media brand.
          </h1>
        </Reveal>
      </Container>

      <Container className="pb-16">
        <div className="mx-auto max-w-prose prose-lux">
          <p>
            [Placeholder bio.] This is a space for long-form thinking about
            culture, technology, and the shape of what comes next — written
            slowly, edited carefully, and sent to a small, considered
            audience. The final copy for this page will be supplied.
          </p>
          <p>
            Essays arrive weekly. Notes appear in between — shorter
            observations, fragments, and the occasional rabbit hole. Nothing
            here is optimised for volume; everything is optimised for the one
            reader who was going to underline a sentence.
          </p>
          <blockquote>
            The intent is quiet: to be worth reading, and worth keeping.
          </blockquote>
          <p>
            A podcast will join this archive in time. Until then, the writing
            leads — and the newsletter is the surest way to receive it.
          </p>
        </div>
      </Container>

      <div className="rule-gold mx-auto max-w-shell" />
      <SubscribeCTA />
    </>
  );
}

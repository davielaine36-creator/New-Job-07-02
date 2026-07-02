import { Container } from "./container";
import { NewsletterForm } from "./newsletter-form";
import { Reveal } from "./reveal";

/**
 * The recurring subscribe band. Appears under every essay and anywhere
 * the newsletter deserves a full-width, unhurried moment.
 */
export function SubscribeCTA({
  eyebrow = "The Newsletter",
  heading = "Essays, in your inbox.",
  copy = "One long-form piece each week, sent the moment it's published. The archive lives here; the writing comes to you.",
}: {
  eyebrow?: string;
  heading?: string;
  copy?: string;
}) {
  return (
    <Container as="section" className="py-24 md:py-32">
      <Reveal className="mx-auto max-w-2xl text-center">
        <div className="rule-gold mx-auto mb-10 w-24" />
        <p className="eyebrow">{eyebrow}</p>
        <h2 className="mt-5 font-display text-display-md text-cream">
          {heading}
        </h2>
        <p className="mt-5 text-mist leading-relaxed">{copy}</p>
        <div className="mt-9 flex justify-center">
          <NewsletterForm />
        </div>
      </Reveal>
    </Container>
  );
}

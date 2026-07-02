import type { Metadata } from "next";
import { Container } from "@/components/container";
import { Reveal } from "@/components/reveal";
import { NewsletterForm } from "@/components/newsletter-form";

export const metadata: Metadata = {
  title: "Subscribe",
  description:
    "Weekly long-form essays, delivered by email from a system I own.",
};

const promises = [
  {
    t: "One essay a week",
    d: "A single long-form piece, sent the moment it's published. Never more than that.",
  },
  {
    t: "The full archive",
    d: "Everything you receive also lives on the site — canonical, searchable, permanent.",
  },
  {
    t: "No noise, ever",
    d: "No drips, no upsells, no tracking theatre. Unsubscribe in one click, anytime.",
  },
];

export default function SubscribePage() {
  return (
    <Container className="pt-24 md:pt-36 pb-24">
      <Reveal className="mx-auto max-w-2xl text-center">
        <div className="rule-gold mx-auto mb-10 w-24" />
        <p className="eyebrow">The Newsletter</p>
        <h1 className="mt-6 font-display text-display-lg text-cream">
          Essays, in your inbox.
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-mist">
          Long-form writing on culture and the future, delivered weekly from a
          system I own — not a third-party feed. Your address stays private.
        </p>
        <div className="mt-10 flex justify-center">
          <NewsletterForm />
        </div>
      </Reveal>

      <div className="mx-auto mt-24 grid max-w-4xl gap-px overflow-hidden rounded-lg border border-graphite/70 bg-graphite/40 sm:grid-cols-3">
        {promises.map((p, i) => (
          <Reveal
            key={p.t}
            delay={i * 0.08}
            className="bg-obsidian p-8"
          >
            <p className="font-display text-lg text-champagne">{p.t}</p>
            <p className="mt-3 text-sm leading-relaxed text-mist">{p.d}</p>
          </Reveal>
        ))}
      </div>
    </Container>
  );
}

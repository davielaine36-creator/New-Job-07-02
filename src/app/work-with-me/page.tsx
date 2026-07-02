import type { Metadata } from "next";
import { Container } from "@/components/container";
import { Reveal } from "@/components/reveal";
import { EnquiryForm } from "@/components/enquiry-form";

export const metadata: Metadata = {
  title: "Work With Me",
  description: "Selective collaborations, commissions, and partnerships.",
};

export default function WorkWithMePage() {
  return (
    <Container className="pt-24 md:pt-36 pb-24">
      <div className="grid gap-16 lg:grid-cols-[1fr_1.1fr] lg:gap-24">
        <Reveal>
          <div className="flex items-center gap-4">
            <span className="rule-gold w-14" />
            <p className="eyebrow">Work With Me</p>
          </div>
          <h1 className="mt-8 font-display text-display-lg text-cream">
            Selective by design.
          </h1>
          <p className="mt-8 max-w-md text-lg leading-relaxed text-mist">
            A small number of collaborations each year — commissions, essays,
            editorial partnerships, and speaking. If the fit is right, the work
            is unhurried and considered.
          </p>
          <ul className="mt-10 space-y-4 text-mist">
            {[
              "Commissioned long-form writing",
              "Editorial & brand partnerships",
              "Talks, panels & interviews",
            ].map((item) => (
              <li key={item} className="flex items-center gap-3">
                <span className="h-px w-6 bg-gold/60" />
                {item}
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="rounded-xl border border-graphite/70 bg-obsidian/60 p-8 md:p-10">
            <EnquiryForm />
          </div>
        </Reveal>
      </div>
    </Container>
  );
}

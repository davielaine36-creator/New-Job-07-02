import type { Metadata } from "next";
import { Container } from "@/components/container";
import { Reveal } from "@/components/reveal";
import { DemoForm } from "@/components/demo-form";
import { CheckIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: "Book a demo",
  description:
    "See Circle Health work against a real chart. Book a 30-minute walkthrough with our team.",
};

const points = [
  "A 30-minute walkthrough against a real (de-identified) chart",
  "See charting, review, and pre-claim scrubbing live",
  "A candid look at where your denials and clinician hours are going",
  "No slide-ware — just the product in your workflow",
];

export default function DemoPage() {
  return (
    <section className="bg-aurora">
      <Container className="grid gap-14 pt-16 pb-24 md:pt-24 lg:grid-cols-[1fr_1.05fr] lg:gap-20">
        <Reveal>
          <p className="eyebrow">Book a demo</p>
          <h1 className="mt-4 font-display text-display-lg font-extrabold text-ink">
            See Circle inside your workflow.
          </h1>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-slate">
            The fastest way to understand Circle is to watch it work. Tell us a
            little about your organization and we'll set up a walkthrough with
            the team.
          </p>

          <ul className="mt-9 space-y-4">
            {points.map((p) => (
              <li key={p} className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-aqua/15 text-aqua">
                  <CheckIcon className="h-4 w-4" />
                </span>
                <span className="text-slate">{p}</span>
              </li>
            ))}
          </ul>

          <div className="mt-10 rounded-2xl border border-line bg-white/70 p-6">
            <p className="text-sm leading-relaxed text-slate">
              Prefer email? Reach us directly at{" "}
              <a
                href="mailto:hello@circlehealth.co"
                className="font-semibold text-teal hover:text-tealdeep"
              >
                hello@circlehealth.co
              </a>
              .
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="card p-7 md:p-9">
            <DemoForm />
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

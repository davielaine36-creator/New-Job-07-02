import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/container";
import { Reveal } from "@/components/reveal";
import { CTABand } from "@/components/cta-band";
import { AssistantIcon, ArrowRight, CheckIcon } from "@/components/icons";
import { assistants, lifecycle, standards } from "@/lib/platform";

export const metadata: Metadata = {
  title: "Platform",
  description:
    "Four AI assistants — Charting, Authorization, Review, and Claims — working together inside your EMR across the intake-to-discharge lifecycle.",
};

export default function PlatformPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-aurora">
        <Container className="pt-16 pb-16 md:pt-24 md:pb-20">
          <Reveal className="max-w-3xl">
            <p className="eyebrow">The platform</p>
            <h1 className="mt-4 font-display text-display-xl font-extrabold text-ink">
              One assistant for every step from{" "}
              <span className="text-gradient">intake to discharge</span>.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate">
              Circle Health is four specialized assistants that share one
              context — the chart. They document care, assemble authorizations,
              review for compliance, and scrub claims, each handing clean work
              to the next. All inside the EMR your team already uses.
            </p>
          </Reveal>
        </Container>
      </section>

      {/* Lifecycle rail */}
      <Container as="section" className="section">
        <Reveal className="max-w-2xl">
          <p className="eyebrow">How it fits together</p>
          <h2 className="mt-4 font-display text-display-md text-ink">
            The episode of care, covered end to end.
          </h2>
        </Reveal>
        <ol className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {lifecycle.map((stage, i) => (
            <Reveal
              as="li"
              key={stage.step}
              delay={(i % 3) * 0.05}
              className="bg-white p-7"
            >
              <div className="flex items-center gap-3">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-ink text-xs font-bold text-white">
                  {i + 1}
                </span>
                <h3 className="font-display text-lg font-bold text-ink">
                  {stage.step}
                </h3>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-slate">
                {stage.body}
              </p>
            </Reveal>
          ))}
        </ol>
      </Container>

      {/* Assistant detail sections */}
      <section className="bg-mist">
        <Container className="section space-y-6">
          <Reveal className="max-w-2xl">
            <p className="eyebrow">The assistants</p>
            <h2 className="mt-4 font-display text-display-md text-ink">
              Four specialists, one shared chart.
            </h2>
          </Reveal>

          <div className="space-y-6">
            {assistants.map((a, i) => (
              <Reveal key={a.slug} delay={0.04}>
                <div className="card grid gap-8 p-8 md:grid-cols-[1.1fr_1fr] md:p-10">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-tealsoft text-teal">
                        <AssistantIcon name={a.icon} className="h-6 w-6" />
                      </span>
                      <div>
                        <span className="chip-teal">{a.stage}</span>
                      </div>
                    </div>
                    <h3 className="mt-5 font-display text-2xl font-bold text-ink">
                      {a.name}
                    </h3>
                    <p className="mt-1 font-medium text-teal">{a.tagline}</p>
                    <p className="mt-4 leading-relaxed text-slate">
                      {a.detail}
                    </p>
                    <Link
                      href={`/platform/${a.slug}`}
                      className="link-arrow mt-6"
                    >
                      Explore {a.name} <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>

                  <div className="flex flex-col justify-center gap-4 rounded-2xl bg-mist p-6">
                    <div>
                      <p className="font-display text-3xl font-extrabold text-ink">
                        {a.metric.value}
                      </p>
                      <p className="mt-1 text-sm text-muted">{a.metric.label}</p>
                    </div>
                    <ul className="space-y-3 border-t border-line pt-4">
                      {a.capabilities.map((c) => (
                        <li key={c.title} className="flex items-start gap-2.5">
                          <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-aqua" />
                          <span className="text-sm text-slate">
                            <span className="font-semibold text-ink">
                              {c.title}.
                            </span>{" "}
                            {c.body}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* Standards */}
      <Container as="section" className="section">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="eyebrow justify-center">Built on the standards you're measured by</p>
          <h2 className="mt-4 font-display text-display-md text-ink">
            The frameworks are in the software, not just the training manual.
          </h2>
        </Reveal>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          {standards.map((s) => (
            <span
              key={s}
              className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2.5 text-sm font-medium text-ink shadow-soft"
            >
              <CheckIcon className="h-4 w-4 text-teal" />
              {s}
            </span>
          ))}
        </div>
      </Container>

      <CTABand />
    </>
  );
}

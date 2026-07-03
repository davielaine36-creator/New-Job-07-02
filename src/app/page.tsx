import Link from "next/link";
import { Container } from "@/components/container";
import { Reveal } from "@/components/reveal";
import { HeroVisual } from "@/components/hero-visual";
import { AssistantCard } from "@/components/assistant-card";
import { LogoCloud } from "@/components/logo-cloud";
import { CTABand } from "@/components/cta-band";
import { ArrowRight, CheckIcon, ClockIcon, ShieldIcon, SparkIcon } from "@/components/icons";
import { assistants, lifecycle, stats, standards, testimonial } from "@/lib/platform";

const outcomes = [
  {
    icon: ClockIcon,
    title: "Give clinicians their week back",
    body: "Documentation drafts itself as care is delivered — 20+ hours a week returned to clinicians, not screens.",
  },
  {
    icon: ShieldIcon,
    title: "Stop losing earned revenue",
    body: "Real-time compliance checks and pre-claim scrubbing cut UR and claim denials before they happen.",
  },
  {
    icon: SparkIcon,
    title: "Nothing new to learn",
    body: "Circle works inside the EMR your team already uses — a Grammarly-style layer, not another system.",
  },
];

export default function HomePage() {
  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="bg-aurora">
        <Container className="grid items-center gap-14 pt-16 pb-20 md:pt-24 md:pb-28 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
          <div>
            <Reveal>
              <span className="chip-teal">
                <SparkIcon className="h-3.5 w-3.5" />
                AI for behavioral health UR &amp; QA
              </span>
            </Reveal>
            <Reveal delay={0.06}>
              <h1 className="mt-6 font-display text-display-xl font-extrabold text-ink">
                A team of AI assistants{" "}
                <span className="text-gradient">inside your EMR</span>.
              </h1>
            </Reveal>
            <Reveal delay={0.12}>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate">
                Circle Health automates charting, prior authorization,
                documentation review, and claims across the intake-to-discharge
                lifecycle — so behavioral health teams cut denials, protect
                revenue, and give clinicians their time back.
              </p>
            </Reveal>
            <Reveal delay={0.18}>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link href="/demo" className="btn-primary">
                  Book a demo <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/platform" className="btn-outline">
                  Explore the platform
                </Link>
              </div>
            </Reveal>
            <Reveal delay={0.24}>
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted">
                <span className="inline-flex items-center gap-2">
                  <CheckIcon className="h-4 w-4 text-teal" /> Works in your
                  workflow
                </span>
                <span className="inline-flex items-center gap-2">
                  <CheckIcon className="h-4 w-4 text-teal" /> HIPAA-aligned
                </span>
                <span className="inline-flex items-center gap-2">
                  <CheckIcon className="h-4 w-4 text-teal" /> Built on TJC, CARF
                  &amp; ASAM
                </span>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.15}>
            <HeroVisual />
          </Reveal>
        </Container>
      </section>

      {/* ── Trust strip ──────────────────────────────────────── */}
      <LogoCloud />

      {/* ── Outcomes ─────────────────────────────────────────── */}
      <Container as="section" className="section">
        <Reveal className="max-w-2xl">
          <p className="eyebrow">The documentation tax</p>
          <h2 className="mt-4 font-display text-display-md text-ink">
            Behavioral health runs on paperwork. Circle runs the paperwork.
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-slate">
            Every hour a clinician spends charting is an hour away from care —
            and every incomplete note is a denial waiting to happen. Circle
            closes both gaps at the source.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {outcomes.map((o, i) => (
            <Reveal key={o.title} delay={i * 0.08} className="card p-7">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-tealsoft text-teal">
                <o.icon className="h-6 w-6" />
              </span>
              <h3 className="mt-5 font-display text-lg font-bold text-ink">
                {o.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-slate">{o.body}</p>
            </Reveal>
          ))}
        </div>
      </Container>

      {/* ── Product suite ────────────────────────────────────── */}
      <section className="bg-mist">
        <Container className="section">
          <Reveal className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <p className="eyebrow">The platform</p>
              <h2 className="mt-4 font-display text-display-md text-ink">
                Four assistants. One clean chart-to-claim workflow.
              </h2>
            </div>
            <Link href="/platform" className="link-arrow">
              See the full platform <ArrowRight className="h-4 w-4" />
            </Link>
          </Reveal>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {assistants.map((a, i) => (
              <Reveal key={a.slug} delay={i * 0.06} className="h-full">
                <AssistantCard assistant={a} />
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* ── Lifecycle ────────────────────────────────────────── */}
      <Container as="section" className="section">
        <Reveal className="max-w-2xl">
          <p className="eyebrow">Intake to discharge</p>
          <h2 className="mt-4 font-display text-display-md text-ink">
            One workflow, covered end to end.
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-slate">
            The assistants work together across the whole episode of care — each
            handing clean, compliant work to the next.
          </p>
        </Reveal>

        <ol className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {lifecycle.map((stage, i) => (
            <Reveal
              as="li"
              key={stage.step}
              delay={(i % 3) * 0.06}
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

      {/* ── Stats band ───────────────────────────────────────── */}
      <section className="bg-mesh-teal">
        <Container className="py-16 md:py-20">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((s, i) => (
              <Reveal key={s.label} delay={i * 0.06} className="text-center">
                <p className="font-display text-4xl font-extrabold text-white md:text-5xl">
                  {s.value}
                </p>
                <p className="mx-auto mt-3 max-w-[15rem] text-sm leading-relaxed text-white/75">
                  {s.label}
                </p>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* ── Standards / compliance ───────────────────────────── */}
      <Container as="section" className="section">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-center lg:gap-20">
          <Reveal>
            <p className="eyebrow">Built for the standards you're held to</p>
            <h2 className="mt-4 font-display text-display-md text-ink">
              Compliance isn't a report you run. It's baked into the chart.
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-slate">
              Circle checks documentation against the frameworks your surveyors
              and payers use — as the note is written, not weeks later.
            </p>
            <Link href="/security" className="link-arrow mt-6">
              Security &amp; compliance <ArrowRight className="h-4 w-4" />
            </Link>
          </Reveal>

          <Reveal delay={0.1} className="flex flex-wrap gap-3">
            {standards.map((s) => (
              <span
                key={s}
                className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2.5 text-sm font-medium text-ink shadow-soft"
              >
                <CheckIcon className="h-4 w-4 text-teal" />
                {s}
              </span>
            ))}
          </Reveal>
        </div>
      </Container>

      {/* ── Testimonial ──────────────────────────────────────── */}
      <section className="bg-mist">
        <Container className="section">
          <Reveal className="mx-auto max-w-3xl text-center">
            <SparkIcon className="mx-auto h-8 w-8 text-teal" />
            <blockquote className="mt-6 font-display text-2xl font-semibold leading-snug text-ink md:text-[1.9rem]">
              &ldquo;{testimonial.quote}&rdquo;
            </blockquote>
            <p className="mt-6 text-sm font-medium text-muted">
              {testimonial.attribution}
            </p>
          </Reveal>
        </Container>
      </section>

      <CTABand />
    </>
  );
}

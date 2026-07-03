import Link from "next/link";
import { Container } from "@/components/container";
import { Reveal } from "@/components/reveal";
import { HeroVisual } from "@/components/hero-visual";
import { ProductShowcase } from "@/components/product-showcase";
import { AssistantCard } from "@/components/assistant-card";
import { LogoCloud } from "@/components/logo-cloud";
import { CTABand } from "@/components/cta-band";
import {
  ArrowRight,
  CheckIcon,
  ClockIcon,
  ShieldIcon,
  SparkIcon,
} from "@/components/icons";
import {
  assistants,
  lifecycle,
  stats,
  standards,
  testimonial,
} from "@/lib/platform";

export default function HomePage() {
  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-aurora">
        <div className="pointer-events-none absolute inset-0 bg-linegrid" />
        <Container className="relative grid items-center gap-14 pt-16 pb-24 md:pt-24 md:pb-28 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
          <div>
            <Reveal>
              <span className="chip-teal">
                <SparkIcon className="h-3.5 w-3.5" />
                AI for behavioral health UR &amp; QA
              </span>
            </Reveal>
            <Reveal delay={0.05}>
              <h1 className="mt-6 font-display text-display-xl font-extrabold text-ink">
                A team of AI assistants{" "}
                <span className="text-gradient">inside your EMR</span>.
              </h1>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate">
                Circle Health automates charting, prior authorization,
                documentation review, and claims across the intake-to-discharge
                lifecycle — so behavioral health teams cut denials, protect
                revenue, and give clinicians their time back.
              </p>
            </Reveal>
            <Reveal delay={0.15}>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link href="/demo" className="btn-primary">
                  Book a demo <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/platform" className="btn-outline">
                  Explore the platform
                </Link>
              </div>
            </Reveal>
            <Reveal delay={0.2}>
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

      {/* ── Product showcase (wow) ───────────────────────────── */}
      <section className="border-y border-line bg-mist">
        <Container className="section">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="eyebrow justify-center">See every chart at a glance</p>
            <h2 className="mt-4 font-display text-display-md text-ink">
              A live view of quality, compliance, and revenue — in one place.
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-slate">
              Circle scores every chart as it's written and rolls it up into a
              real-time picture your QA and UR teams can actually act on.
            </p>
          </Reveal>
          <Reveal delay={0.1} className="mx-auto mt-12 max-w-5xl">
            <ProductShowcase />
          </Reveal>
        </Container>
      </section>

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
          {[
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
          ].map((o, i) => (
            <Reveal key={o.title} delay={i * 0.08} className="card p-7">
              <span className="icon-tile-lg">
                <o.icon className="h-7 w-7" />
              </span>
              <h3 className="mt-6 font-display text-lg font-bold text-ink">
                {o.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-slate">{o.body}</p>
            </Reveal>
          ))}
        </div>
      </Container>

      {/* ── Product suite ────────────────────────────────────── */}
      <section className="border-t border-line bg-mist">
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

      {/* ── Feature row: capture ─────────────────────────────── */}
      <Container as="section" className="section">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <p className="eyebrow">Charting Assistant</p>
            <h2 className="mt-4 font-display text-display-md text-ink">
              Capture the encounter. Circle writes the chart.
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-slate">
              However your clinicians already work, Circle turns it into
              structured, compliant documentation — with coding and
              medical-necessity language built in.
            </p>
            <ul className="mt-8 space-y-4">
              {[
                "Ambient listening, dictation, typing, or file upload",
                "ASAM assessments to discharge summaries in minutes",
                "ICD-10-CM/PCS and CPT coding suggested as you write",
              ].map((t) => (
                <li key={t} className="flex items-start gap-3">
                  <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-aqua/15 text-aqua">
                    <CheckIcon className="h-4 w-4" />
                  </span>
                  <span className="text-slate">{t}</span>
                </li>
              ))}
            </ul>
            <Link href="/platform/charting" className="link-arrow mt-8">
              Explore Charting Assistant <ArrowRight className="h-4 w-4" />
            </Link>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="card p-6 shadow-card">
              <p className="text-xs font-semibold uppercase tracking-micro text-muted">
                Capture method
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2.5">
                {["Ambient listening", "Dictation", "Typing", "File upload"].map(
                  (m, i) => (
                    <span
                      key={m}
                      className={
                        i === 0
                          ? "flex items-center gap-2 rounded-xl border border-teal/30 bg-tealsoft px-3 py-2.5 text-sm font-medium text-tealdeep"
                          : "flex items-center gap-2 rounded-xl border border-line bg-white px-3 py-2.5 text-sm text-slate"
                      }
                    >
                      <span
                        className={
                          i === 0
                            ? "h-2 w-2 rounded-full bg-aqua"
                            : "h-2 w-2 rounded-full bg-line"
                        }
                      />
                      {m}
                    </span>
                  )
                )}
              </div>
              <div className="mt-4 rounded-xl border border-line bg-mist p-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-ink">
                    Generated note
                  </p>
                  <span className="chip-teal !py-1 !text-[0.62rem]">
                    Compliant
                  </span>
                </div>
                <div className="mt-3 space-y-2">
                  <div className="h-2 w-11/12 rounded bg-cloud" />
                  <div className="h-2 w-full rounded bg-cloud" />
                  <div className="h-2 w-4/5 rounded bg-tealsoft" />
                  <div className="h-2 w-2/3 rounded bg-cloud" />
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {["F10.20", "H0015", "ASAM D5"].map((c) => (
                    <span
                      key={c}
                      className="rounded-md border border-line bg-white px-2 py-0.5 text-[0.66rem] font-semibold text-slate"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </Container>

      {/* ── Lifecycle ────────────────────────────────────────── */}
      <section className="border-y border-line bg-mist">
        <Container className="section">
          <Reveal className="max-w-2xl">
            <p className="eyebrow">Intake to discharge</p>
            <h2 className="mt-4 font-display text-display-md text-ink">
              One workflow, covered end to end.
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-slate">
              The assistants work together across the whole episode of care —
              each handing clean, compliant work to the next.
            </p>
          </Reveal>

          <div className="mt-14 overflow-x-auto pb-2">
            <ol className="flex min-w-[720px] items-stretch gap-4 lg:min-w-0">
              {lifecycle.map((stage, i) => (
                <Reveal
                  as="li"
                  key={stage.step}
                  delay={i * 0.05}
                  className="relative flex-1"
                >
                  <div className="flex items-center">
                    <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal to-tealdeep text-sm font-bold text-white shadow-lift">
                      {i + 1}
                    </span>
                    {i < lifecycle.length - 1 && (
                      <span className="mx-2 h-px flex-1 bg-gradient-to-r from-teal/40 to-line" />
                    )}
                  </div>
                  <h3 className="mt-4 font-display text-base font-bold text-ink">
                    {stage.step}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate">
                    {stage.body}
                  </p>
                </Reveal>
              ))}
            </ol>
          </div>
        </Container>
      </section>

      {/* ── Stats (dark, premium) ────────────────────────────── */}
      <section className="relative overflow-hidden bg-mesh-dark">
        <div className="pointer-events-none absolute inset-0 bg-dotgrid opacity-[0.12]" />
        <Container className="relative py-20 md:py-24">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-micro text-aqua">
              The outcomes that matter
            </p>
            <h2 className="mt-4 font-display text-display-md text-white">
              Fewer denials. Cleaner claims. Time given back.
            </h2>
          </Reveal>
          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((s, i) => (
              <Reveal key={s.label} delay={i * 0.06} className="text-center">
                <p className="font-display text-4xl font-extrabold text-white md:text-5xl">
                  {s.value}
                </p>
                <p className="mx-auto mt-3 max-w-[15rem] text-sm leading-relaxed text-white/70">
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
      <section className="border-t border-line bg-mist">
        <Container className="section">
          <Reveal className="mx-auto max-w-3xl">
            <div className="card p-8 md:p-12">
              <SparkIcon className="h-8 w-8 text-teal" />
              <blockquote className="mt-6 font-display text-2xl font-semibold leading-snug text-ink md:text-[1.75rem]">
                &ldquo;{testimonial.quote}&rdquo;
              </blockquote>
              <div className="mt-8 flex items-center gap-3">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-teal to-tealdeep text-sm font-bold text-white">
                  DQ
                </span>
                <p className="text-sm text-muted">{testimonial.attribution}</p>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>

      <CTABand />
    </>
  );
}

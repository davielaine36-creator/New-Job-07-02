import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/container";
import { Reveal } from "@/components/reveal";
import { CTABand } from "@/components/cta-band";
import { AssistantIcon, ArrowRight, CheckIcon } from "@/components/icons";
import { assistants, getAssistant } from "@/lib/platform";
import { site } from "@/lib/site";

export function generateStaticParams() {
  return assistants.map((a) => ({ assistant: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ assistant: string }>;
}): Promise<Metadata> {
  const { assistant } = await params;
  const a = getAssistant(assistant);
  if (!a) return {};
  return {
    title: a.name,
    description: a.summary,
    alternates: { canonical: `/platform/${a.slug}` },
    openGraph: {
      title: `${a.name} — ${site.name}`,
      description: a.summary,
      url: `${site.url}/platform/${a.slug}`,
    },
  };
}

export default async function AssistantPage({
  params,
}: {
  params: Promise<{ assistant: string }>;
}) {
  const { assistant } = await params;
  const a = getAssistant(assistant);
  if (!a) notFound();

  const others = assistants.filter((x) => x.slug !== a.slug);

  return (
    <>
      {/* Hero */}
      <section className="bg-aurora">
        <Container className="grid items-center gap-12 pt-14 pb-16 md:pt-20 md:pb-20 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <Reveal>
              <Link href="/platform" className="link-arrow">
                ← Platform
              </Link>
            </Reveal>
            <Reveal delay={0.05}>
              <div className="mt-6 flex items-center gap-3">
                <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-tealsoft text-teal">
                  <AssistantIcon name={a.icon} className="h-7 w-7" />
                </span>
                <span className="chip-teal">{a.stage}</span>
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <h1 className="mt-6 font-display text-display-lg font-extrabold text-ink">
                {a.name}
              </h1>
              <p className="mt-2 text-lg font-medium text-teal">{a.tagline}</p>
            </Reveal>
            <Reveal delay={0.16}>
              <p className="mt-6 max-w-xl leading-relaxed text-slate">
                {a.detail}
              </p>
            </Reveal>
            <Reveal delay={0.22}>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/demo" className="btn-primary">
                  Book a demo <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/platform" className="btn-outline">
                  See the full platform
                </Link>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.15}>
            <div className="card p-8 text-center shadow-card">
              <p className="font-display text-5xl font-extrabold text-gradient">
                {a.metric.value}
              </p>
              <p className="mx-auto mt-3 max-w-xs text-sm text-slate">
                {a.metric.label}
              </p>
            </div>
          </Reveal>
        </Container>
      </section>

      {/* Capabilities */}
      <Container as="section" className="section">
        <Reveal className="max-w-2xl">
          <p className="eyebrow">What it does</p>
          <h2 className="mt-4 font-display text-display-md text-ink">
            Built for the way your team already works.
          </h2>
        </Reveal>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {a.capabilities.map((c, i) => (
            <Reveal key={c.title} delay={i * 0.07} className="card p-7">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-aqua/15 text-aqua">
                <CheckIcon className="h-5 w-5" />
              </span>
              <h3 className="mt-5 font-display text-lg font-bold text-ink">
                {c.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-slate">{c.body}</p>
            </Reveal>
          ))}
        </div>
      </Container>

      {/* Cross-sell */}
      <section className="bg-mist">
        <Container className="section">
          <Reveal className="max-w-2xl">
            <p className="eyebrow">Better together</p>
            <h2 className="mt-4 font-display text-display-md text-ink">
              The rest of the platform.
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {others.map((o, i) => (
              <Reveal key={o.slug} delay={i * 0.06}>
                <Link
                  href={`/platform/${o.slug}`}
                  className="card card-hover group flex h-full flex-col p-6"
                >
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-tealsoft text-teal">
                    <AssistantIcon name={o.icon} className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 font-display text-base font-bold text-ink">
                    {o.name}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-slate">
                    {o.summary}
                  </p>
                  <span className="link-arrow mt-4">
                    Learn more
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <CTABand />
    </>
  );
}

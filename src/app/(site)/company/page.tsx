import type { Metadata } from "next";
import { Container } from "@/components/container";
import { Reveal } from "@/components/reveal";
import { CTABand } from "@/components/cta-band";
import { LogoCloud } from "@/components/logo-cloud";
import { stats } from "@/lib/platform";

export const metadata: Metadata = {
  title: "Company",
  description:
    "Circle Health builds AI assistants for behavioral health utilization review and quality assurance — so clinicians can focus on care.",
};

const values = [
  {
    title: "Clinicians first",
    body: "Every hour we return to a clinician is a win. We measure ourselves in time given back, not features shipped.",
  },
  {
    title: "Compliance is care",
    body: "Good documentation isn't bureaucracy — it's how care gets authorized, delivered, and paid for. We take it seriously.",
  },
  {
    title: "Meet teams where they are",
    body: "We build inside the tools organizations already use. The best software is the software nobody has to think about.",
  },
  {
    title: "Earn trust with data",
    body: "We handle the most sensitive records in healthcare. Security and privacy aren't slogans here; they're the job.",
  },
];

export default function CompanyPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-aurora">
        <Container className="pt-16 pb-16 md:pt-24 md:pb-20">
          <Reveal className="max-w-3xl">
            <p className="eyebrow">Our mission</p>
            <h1 className="mt-4 font-display text-display-xl font-extrabold text-ink">
              Give behavioral health its time back.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate">
              Circle Health was built on a simple observation: the people who
              care for our most vulnerable patients spend too much of their week
              on paperwork, and their organizations lose too much earned revenue
              to preventable denials. We think AI should fix both — quietly,
              inside the workflow, without asking anyone to become a coder or a
              compliance expert.
            </p>
          </Reveal>
        </Container>
      </section>

      {/* Story */}
      <Container as="section" className="section">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.15fr] lg:gap-20">
          <Reveal>
            <p className="eyebrow">Why we exist</p>
            <h2 className="mt-4 font-display text-display-md text-ink">
              Documentation shouldn't be the reason people leave this field.
            </h2>
          </Reveal>
          <Reveal delay={0.08} className="space-y-5 text-lg leading-relaxed text-slate">
            <p>
              Behavioral health is under strain. Demand is rising, reimbursement
              is complex, and administrative burden is a leading driver of the
              burnout pushing clinicians out of the field. The documentation that
              proves medical necessity — the same documentation that keeps an
              organization solvent — often falls on the people with the least
              time to write it.
            </p>
            <p>
              We started Circle to close that gap at the source. By putting a
              team of AI assistants inside the EMR, we help organizations
              document care as it happens, catch compliance issues before they
              become denials, and protect the revenue that funds the mission.
              The result is fewer denials, cleaner claims, and clinicians who get
              their evenings back.
            </p>
          </Reveal>
        </div>

        {/* Stats */}
        <div className="mt-16 grid gap-6 rounded-2xl border border-line bg-mist p-8 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="font-display text-3xl font-extrabold text-ink md:text-4xl">
                {s.value}
              </p>
              <p className="mx-auto mt-2 max-w-[14rem] text-sm text-muted">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </Container>

      {/* Values */}
      <section className="bg-mist">
        <Container className="section">
          <Reveal className="max-w-2xl">
            <p className="eyebrow">What we believe</p>
            <h2 className="mt-4 font-display text-display-md text-ink">
              The principles behind the product.
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {values.map((v, i) => (
              <Reveal key={v.title} delay={(i % 2) * 0.06} className="card p-7">
                <h3 className="font-display text-lg font-bold text-ink">
                  {v.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-slate">
                  {v.body}
                </p>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <LogoCloud label="The teams we're proud to serve" />

      <CTABand />
    </>
  );
}

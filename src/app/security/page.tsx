import type { Metadata } from "next";
import { Container } from "@/components/container";
import { Reveal } from "@/components/reveal";
import { CTABand } from "@/components/cta-band";
import { ShieldIcon, CheckIcon } from "@/components/icons";
import { standards } from "@/lib/platform";

export const metadata: Metadata = {
  title: "Security & Compliance",
  description:
    "How Circle Health protects PHI: HIPAA alignment, encryption, least-privilege access, auditability, and a clear data posture built for behavioral health.",
};

const pillars = [
  {
    title: "HIPAA-aligned by design",
    body: "PHI is handled under a HIPAA framework end to end, governed by a Business Associate Agreement. Compliance isn't bolted on — it's the foundation the platform is built on.",
  },
  {
    title: "Encrypted in transit and at rest",
    body: "All data is encrypted using industry-standard protocols both while moving and while stored, so protected information is never exposed in the clear.",
  },
  {
    title: "Least-privilege access",
    body: "Role-based access controls ensure people and services can only reach the data they need. Access is scoped, reviewed, and revocable.",
  },
  {
    title: "Auditable by default",
    body: "Actions are logged so your compliance team has a clear, reviewable trail — the record you want when a surveyor or auditor asks.",
  },
  {
    title: "Your data stays yours",
    body: "We don't use your protected health information to train foundation models. Your clinical data works for your organization — full stop.",
  },
  {
    title: "SOC 2 on the roadmap",
    body: "We're building toward SOC 2 Type II attestation, extending the same controls into an independently verified framework.",
  },
];

export default function SecurityPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-aurora">
        <Container className="pt-16 pb-16 md:pt-24 md:pb-20">
          <Reveal className="max-w-3xl">
            <span className="chip-teal">
              <ShieldIcon className="h-3.5 w-3.5" />
              Security &amp; compliance
            </span>
            <h1 className="mt-6 font-display text-display-xl font-extrabold text-ink">
              Trusted with the most sensitive record there is.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate">
              Working inside behavioral health charts means working with the most
              sensitive data in healthcare. We treat that responsibility as the
              product's foundation — not a feature we added later.
            </p>
          </Reveal>
        </Container>
      </section>

      {/* Pillars */}
      <Container as="section" className="section">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {pillars.map((p, i) => (
            <Reveal key={p.title} delay={(i % 3) * 0.06} className="card p-7">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-tealsoft text-teal">
                <ShieldIcon className="h-5 w-5" />
              </span>
              <h3 className="mt-5 font-display text-lg font-bold text-ink">
                {p.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-slate">{p.body}</p>
            </Reveal>
          ))}
        </div>
      </Container>

      {/* Standards */}
      <section className="bg-mist">
        <Container className="section">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-center lg:gap-20">
            <Reveal>
              <p className="eyebrow">Standards &amp; frameworks</p>
              <h2 className="mt-4 font-display text-display-md text-ink">
                Aligned to what your surveyors and payers require.
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-slate">
                Circle checks documentation against the accreditation and payer
                frameworks behavioral health organizations are held to — so
                compliance is continuous, not a fire drill before a survey.
              </p>
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
      </section>

      {/* Note */}
      <Container as="section" className="section">
        <Reveal className="mx-auto max-w-2xl rounded-2xl border border-line bg-white p-8 text-center shadow-soft">
          <p className="text-sm leading-relaxed text-slate">
            Security questionnaire, BAA, or architecture review? We're glad to
            walk your team through our controls in detail. Email{" "}
            <a
              href="mailto:security@circlehealth.co"
              className="font-semibold text-teal hover:text-tealdeep"
            >
              security@circlehealth.co
            </a>
            .
          </p>
        </Reveal>
      </Container>

      <CTABand
        title="Bring your compliance team"
        body="We built Circle to pass the hard questions. Book a walkthrough and ask them."
      />
    </>
  );
}

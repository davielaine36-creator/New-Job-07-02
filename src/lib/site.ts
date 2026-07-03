/**
 * Central site configuration for the Circle Health refresh.
 * Everything brand-facing that a developer might tweak lives here so copy and
 * metadata are not scattered across the app.
 *
 * NOTE: This is a design/demo refresh built from public information about
 * Circle Health (circlehealth.co). Copy is illustrative and intended for
 * client review — final wording, logos, and legal pages are supplied at
 * kickoff.
 */
export const site = {
  name: "Circle Health",
  shortName: "Circle",
  tagline: "AI for behavioral health UR & QA",
  description:
    "Circle Health puts a team of AI assistants inside your EMR — charting, prior authorization, documentation review, and claims — so behavioral health teams reduce denials, protect revenue, and give clinicians their week back.",
  // Set NEXT_PUBLIC_SITE_URL in production (Vercel) for correct canonical/OG URLs.
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.circlehealth.co",
  email: "hello@circlehealth.co",
  nav: [
    { label: "Platform", href: "/platform" },
    { label: "Security", href: "/security" },
    { label: "Insights", href: "/insights" },
    { label: "Company", href: "/company" },
  ],
  cta: { label: "Book a demo", href: "/demo" },
  social: {
    linkedin: "https://www.linkedin.com/company/circle-health-ai",
  },
} as const;

export type Site = typeof site;

/**
 * Central site configuration. Everything brand-facing that a developer
 * might tweak lives here so copy and metadata are not scattered.
 */
export const site = {
  name: "PENUMBRA", // masthead wordmark — final brand supplied by the brand deck
  tagline: "Essays on culture, technology, and attention.",
  description:
    "Long-form essays, shorter observations, and a weekly newsletter on culture, technology, and the shape of the future — written slowly, with quiet precision.",
  // Set NEXT_PUBLIC_SITE_URL in production (Vercel) for correct canonical/OG URLs.
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com",
  author: {
    name: "Elliott Vane",
    role: "Writer & Editor",
    email: "hello@example.com",
  },
  nav: [
    { label: "Essays", href: "/essays" },
    { label: "Notes", href: "/notes" },
    { label: "About", href: "/about" },
    { label: "Work With Me", href: "/work-with-me" },
    // "Listen" (podcast) is architected for but intentionally not launched.
  ],
  social: {
    // Fill in at handoff.
    x: "",
    instagram: "",
    linkedin: "",
  },
} as const;

export type Site = typeof site;

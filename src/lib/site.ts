/**
 * Central site configuration. Everything brand-facing that a developer
 * might tweak lives here so copy and metadata are not scattered.
 */
export const site = {
  name: "AURELIA", // placeholder brand wordmark — supplied by the brand deck
  tagline: "A cultural-media brand.",
  description:
    "Long-form essays, shorter observations, and a newsletter on culture, technology, and the shape of the future — written with quiet precision.",
  // Set NEXT_PUBLIC_SITE_URL in production (Vercel) for correct canonical/OG URLs.
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com",
  author: {
    name: "The Author",
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

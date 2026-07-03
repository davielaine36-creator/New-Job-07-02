import Link from "next/link";
import { site } from "@/lib/site";
import { assistants } from "@/lib/platform";
import { Container } from "./container";
import { Logo } from "./logo";
import { ShieldIcon, CheckIcon } from "./icons";

const columns = [
  {
    heading: "Platform",
    links: [
      { label: "Overview", href: "/platform" },
      ...assistants.map((a) => ({
        label: a.name,
        href: `/platform/${a.slug}`,
      })),
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About", href: "/company" },
      { label: "Insights", href: "/insights" },
      { label: "Security", href: "/security" },
      { label: "Book a demo", href: "/demo" },
    ],
  },
];

export function SiteFooter() {
  const year = 2026; // static to avoid hydration drift; bump at handoff.

  return (
    <footer className="mt-24 border-t border-line bg-mist">
      <Container className="py-16">
        <div className="grid gap-12 md:grid-cols-[1.6fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-slate">
              A team of AI assistants inside your EMR — charting, prior
              authorization, review, and claims — built for behavioral health
              utilization review and quality assurance.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="chip">
                <ShieldIcon className="h-3.5 w-3.5 text-teal" /> HIPAA-aligned
              </span>
              <span className="chip">
                <CheckIcon className="h-3.5 w-3.5 text-teal" /> SOC 2 (roadmap)
              </span>
            </div>
          </div>

          {columns.map((col) => (
            <nav key={col.heading} className="text-sm">
              <p className="text-xs font-semibold uppercase tracking-micro text-muted">
                {col.heading}
              </p>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-slate transition-colors hover:text-teal"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-line pt-8 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {site.name}. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a
              href={site.social.linkedin}
              className="transition-colors hover:text-teal"
              target="_blank"
              rel="noopener noreferrer"
            >
              LinkedIn
            </a>
            <a
              href={`mailto:${site.email}`}
              className="transition-colors hover:text-teal"
            >
              {site.email}
            </a>
          </div>
        </div>
      </Container>
    </footer>
  );
}

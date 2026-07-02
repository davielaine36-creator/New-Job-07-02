import Link from "next/link";
import { site } from "@/lib/site";
import { Container } from "./container";
import { NewsletterForm } from "./newsletter-form";

export function SiteFooter() {
  const year = 2026; // avoids Date-based hydration drift; bump at handoff.

  return (
    <footer className="mt-24 border-t border-graphite/70 bg-void/60">
      <Container className="py-16">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr]">
          <div>
            <Link
              href="/"
              className="font-display text-lg tracking-[0.25em] text-cream"
            >
              {site.name}
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-mist">
              {site.description}
            </p>
            <div className="mt-7">
              <p className="eyebrow mb-3">Subscribe</p>
              <NewsletterForm variant="inline" />
            </div>
          </div>

          <nav className="grid grid-cols-2 gap-8 text-sm">
            <div>
              <p className="eyebrow mb-4">Read</p>
              <ul className="space-y-3">
                <li>
                  <Link href="/essays" className="link-underline">
                    Essays
                  </Link>
                </li>
                <li>
                  <Link href="/notes" className="link-underline">
                    Notes
                  </Link>
                </li>
                <li>
                  <Link href="/subscribe" className="link-underline">
                    Newsletter
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="eyebrow mb-4">More</p>
              <ul className="space-y-3">
                <li>
                  <Link href="/about" className="link-underline">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/work-with-me" className="link-underline">
                    Work With Me
                  </Link>
                </li>
                <li>
                  <a
                    href={`mailto:${site.author.email}`}
                    className="link-underline"
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </div>
          </nav>
        </div>

        <div className="rule-gold my-12" />

        <div className="flex flex-col gap-4 text-xs text-ash sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {site.name}. All rights reserved.
          </p>
          <p className="tracking-wide">
            Written from somewhere quiet. Sent from a system I own.
          </p>
        </div>
      </Container>
    </footer>
  );
}

import Link from "next/link";
import { Container } from "./container";
import { ArrowRight } from "./icons";

/**
 * The recurring "Book a demo" band. Deep teal mesh, high contrast, one clear
 * action — used at the foot of most marketing pages.
 */
export function CTABand({
  title = "See Circle inside your workflow",
  body = "A 30-minute walkthrough against a real chart. We'll show you where the hours — and the denials — go.",
}: {
  title?: string;
  body?: string;
}) {
  return (
    <Container as="section" className="py-16 md:py-20">
      <div className="relative overflow-hidden rounded-3xl bg-mesh-teal px-8 py-14 md:px-16 md:py-20 text-center">
        <div className="pointer-events-none absolute inset-0 bg-dotgrid opacity-[0.15]" />
        <div className="relative mx-auto max-w-2xl">
          <h2 className="font-display text-display-md text-white">{title}</h2>
          <p className="mt-4 text-lg leading-relaxed text-white/80">{body}</p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/demo"
              className="btn bg-white text-tealdeep hover:bg-cloud"
            >
              Book a demo <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/platform"
              className="btn border border-white/30 text-white hover:bg-white/10"
            >
              Explore the platform
            </Link>
          </div>
        </div>
      </div>
    </Container>
  );
}

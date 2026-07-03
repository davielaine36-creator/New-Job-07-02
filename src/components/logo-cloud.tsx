import { customers } from "@/lib/platform";
import { Container } from "./container";

/**
 * Customer trust strip. Text wordmarks stand in for client logos in this
 * demo — swap for supplied SVG marks at handoff.
 */
export function LogoCloud({ label = "Trusted by behavioral health teams" }: { label?: string }) {
  return (
    <Container as="section" className="py-12">
      <p className="text-center text-xs font-semibold uppercase tracking-micro text-muted">
        {label}
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-x-10 gap-y-6 md:gap-x-16">
        {customers.map((name) => (
          <span
            key={name}
            className="font-display text-lg font-bold tracking-tight text-faint transition-colors hover:text-slate"
          >
            {name}
          </span>
        ))}
      </div>
    </Container>
  );
}

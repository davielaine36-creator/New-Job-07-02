import Link from "next/link";
import { site } from "@/lib/site";
import { clsx } from "@/lib/clsx";

/**
 * Circle Health wordmark. The mark is a ring opened into a soft "C" with a
 * live aqua node — "the circle of care, closed." Pure SVG so it stays crisp
 * and themeable. Swap for the client's final logo at handoff.
 */
export function Logo({
  className,
  tone = "dark",
}: {
  className?: string;
  /** "dark" for light backgrounds, "light" for dark backgrounds. */
  tone?: "dark" | "light";
}) {
  const text = tone === "light" ? "text-white" : "text-ink";
  return (
    <Link
      href="/"
      aria-label={`${site.name} — home`}
      className={clsx("inline-flex items-center gap-2.5 group", className)}
    >
      <span className="relative inline-flex h-8 w-8 items-center justify-center">
        <svg viewBox="0 0 32 32" className="h-8 w-8" aria-hidden="true">
          <circle
            cx="16"
            cy="16"
            r="11.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeDasharray="58 30"
            transform="rotate(128 16 16)"
            className="text-teal transition-transform duration-500 ease-soft group-hover:rotate-[135deg]"
          />
          <circle cx="26" cy="12" r="3.1" className="fill-aqua" />
        </svg>
      </span>
      <span
        className={clsx(
          "font-display text-lg font-extrabold tracking-tight",
          text
        )}
      >
        Circle<span className="text-teal">Health</span>
      </span>
    </Link>
  );
}

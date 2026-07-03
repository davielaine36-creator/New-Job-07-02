import Link from "next/link";
import type { Assistant } from "@/lib/platform";
import { AssistantIcon, ArrowRight } from "./icons";

/**
 * Product card for an assistant — used on the home page and platform page.
 */
export function AssistantCard({ assistant }: { assistant: Assistant }) {
  return (
    <Link
      href={`/platform/${assistant.slug}`}
      className="card card-hover group flex flex-col p-7"
    >
      <div className="flex items-center justify-between">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-tealsoft text-teal">
          <AssistantIcon name={assistant.icon} className="h-6 w-6" />
        </span>
        <span className="chip-teal">{assistant.stage}</span>
      </div>
      <h3 className="mt-6 font-display text-xl font-bold text-ink">
        {assistant.name}
      </h3>
      <p className="mt-1 text-sm font-medium text-teal">{assistant.tagline}</p>
      <p className="mt-4 flex-1 text-sm leading-relaxed text-slate">
        {assistant.summary}
      </p>
      <span className="link-arrow mt-6">
        Learn more
        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
      </span>
    </Link>
  );
}

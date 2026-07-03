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
      className="card card-hover group relative flex h-full flex-col overflow-hidden p-7"
    >
      {/* top accent line, revealed on hover */}
      <span className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-teal to-aqua transition-transform duration-500 ease-soft group-hover:scale-x-100" />

      <div className="flex items-center justify-between">
        <span className="icon-tile">
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

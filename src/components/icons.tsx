import type { IconName } from "@/lib/platform";

type Props = { className?: string };

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  viewBox: "0 0 24 24",
};

/** Charting — a document with a rising line, "notes that write themselves". */
export function ChartIcon({ className }: Props) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
      <path d="M14 3v6h6" />
      <path d="M8 17l2.2-2.6L12 16l2.6-3.4" />
    </svg>
  );
}

/** Authorization — a shielded stamp of approval. */
export function AuthorizationIcon({ className }: Props) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <path d="M12 3l7 3v5c0 4.4-3 7.6-7 9-4-1.4-7-4.6-7-9V6z" />
      <path d="M9 12l2 2 4-4.5" />
    </svg>
  );
}

/** Review — a magnifier over a checklist. */
export function ReviewIcon({ className }: Props) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <path d="M4 5h9M4 9h6M4 13h5" />
      <circle cx="15.5" cy="14.5" r="4" />
      <path d="M18.5 17.5L21 20" />
    </svg>
  );
}

/** Claims — a clean receipt with a check. */
export function ClaimsIcon({ className }: Props) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <path d="M6 3h12v18l-3-2-3 2-3-2-3 2z" />
      <path d="M9 8h6M9 12h6" />
    </svg>
  );
}

export function ShieldIcon({ className }: Props) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <path d="M12 3l7 3v5c0 4.4-3 7.6-7 9-4-1.4-7-4.6-7-9V6z" />
    </svg>
  );
}

export function ClockIcon({ className }: Props) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 1.8" />
    </svg>
  );
}

export function SparkIcon({ className }: Props) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" />
    </svg>
  );
}

export function CheckIcon({ className }: Props) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <path d="M4.5 12.5l4.5 4.5L19.5 6.5" />
    </svg>
  );
}

export function ArrowRight({ className }: Props) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

const map: Record<IconName, (p: Props) => React.ReactElement> = {
  chart: ChartIcon,
  authorization: AuthorizationIcon,
  review: ReviewIcon,
  claims: ClaimsIcon,
  shield: ShieldIcon,
  clock: ClockIcon,
  spark: SparkIcon,
};

export function AssistantIcon({
  name,
  className,
}: {
  name: IconName;
  className?: string;
}) {
  const Cmp = map[name];
  return <Cmp className={className} />;
}

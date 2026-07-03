import { CheckIcon, SparkIcon } from "./icons";

/**
 * A stylized, pure-CSS mock of Circle working inside an EMR chart: the note on
 * the left, the live compliance panel on the right. Illustrative — it sells
 * the "assistant inside your workflow" idea without shipping a real screenshot.
 */
export function HeroVisual() {
  const checks = [
    { label: "Medical necessity documented", ok: true },
    { label: "ICD-10 ↔ CPT aligned", ok: true },
    { label: "ASAM dimensions complete", ok: true },
    { label: "Prior auth criteria: add LOC detail", ok: false },
  ];

  return (
    <div className="relative">
      {/* soft glow */}
      <div className="pointer-events-none absolute -inset-6 rounded-[2rem] bg-aqua/10 blur-2xl" />

      <div className="relative card overflow-hidden p-0 shadow-card">
        {/* window chrome */}
        <div className="flex items-center gap-2 border-b border-line bg-mist px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-line" />
          <span className="h-2.5 w-2.5 rounded-full bg-line" />
          <span className="h-2.5 w-2.5 rounded-full bg-line" />
          <span className="ml-3 truncate text-xs text-muted">
            EMR · Progress Note — session 14
          </span>
        </div>

        <div className="grid gap-0 sm:grid-cols-[1.15fr_1fr]">
          {/* note body */}
          <div className="border-b border-line p-5 sm:border-b-0 sm:border-r">
            <p className="text-[0.7rem] font-semibold uppercase tracking-micro text-muted">
              Draft note
            </p>
            <div className="mt-3 space-y-2">
              <div className="h-2.5 w-11/12 rounded bg-cloud" />
              <div className="h-2.5 w-full rounded bg-cloud" />
              <div className="h-2.5 w-4/5 rounded bg-cloud" />
              <div className="h-2.5 w-full rounded bg-tealsoft" />
              <div className="h-2.5 w-3/4 rounded bg-cloud" />
              <div className="h-2.5 w-10/12 rounded bg-cloud" />
              <div className="h-2.5 w-2/3 rounded bg-cloud" />
            </div>
            <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-tealsoft px-3 py-1.5 text-xs font-semibold text-tealdeep">
              <SparkIcon className="h-3.5 w-3.5" />
              Drafted by Circle
            </div>
          </div>

          {/* compliance panel */}
          <div className="p-5">
            <div className="flex items-center justify-between">
              <p className="text-[0.7rem] font-semibold uppercase tracking-micro text-muted">
                Compliance
              </p>
              <span className="chip-teal">Live</span>
            </div>

            {/* score ring */}
            <div className="mt-4 flex items-center gap-4">
              <div className="relative h-16 w-16 shrink-0">
                <svg viewBox="0 0 36 36" className="h-16 w-16 -rotate-90">
                  <circle
                    cx="18"
                    cy="18"
                    r="15.5"
                    fill="none"
                    className="stroke-cloud"
                    strokeWidth="3.5"
                  />
                  <circle
                    cx="18"
                    cy="18"
                    r="15.5"
                    fill="none"
                    className="stroke-aqua"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeDasharray="97.4"
                    strokeDashoffset="7.8"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center font-display text-base font-extrabold text-ink">
                  92
                </span>
              </div>
              <p className="text-xs leading-relaxed text-slate">
                Chart scored against{" "}
                <span className="font-semibold text-ink">TJC, CARF & payer</span>{" "}
                standards in real time.
              </p>
            </div>

            {/* checklist */}
            <ul className="mt-5 space-y-2.5">
              {checks.map((c) => (
                <li key={c.label} className="flex items-start gap-2.5 text-xs">
                  <span
                    className={
                      c.ok
                        ? "mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-aqua/15 text-aqua"
                        : "mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-sky/15 text-sky"
                    }
                  >
                    {c.ok ? (
                      <CheckIcon className="h-3 w-3" />
                    ) : (
                      <span className="text-[10px] font-bold">!</span>
                    )}
                  </span>
                  <span className={c.ok ? "text-slate" : "font-medium text-ink"}>
                    {c.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

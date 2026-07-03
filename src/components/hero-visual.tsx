import {
  ChartIcon,
  ReviewIcon,
  ClaimsIcon,
  AuthorizationIcon,
  CheckIcon,
  SparkIcon,
  ClockIcon,
} from "./icons";

/**
 * A realistic mock of the Circle app working inside a chart: slim product
 * sidebar, a live note with an AI-inserted line and suggestion, and a
 * real-time compliance rail — with two floating stat cards for depth.
 * Illustrative; swap for a real (de-identified) screenshot at launch.
 */
export function HeroVisual() {
  const checks = [
    { label: "Medical necessity documented", ok: true },
    { label: "ASAM dimensions complete", ok: true },
    { label: "ICD-10 ↔ CPT aligned", ok: true },
    { label: "Prior auth: add level-of-care detail", ok: false },
  ];

  return (
    <div className="relative">
      {/* ambient glow */}
      <div className="pointer-events-none absolute -inset-8 -z-10 rounded-[2.5rem] bg-aqua/10 blur-3xl" />

      <div className="relative overflow-hidden rounded-3xl border border-line bg-white shadow-float">
        {/* window chrome */}
        <div className="flex items-center gap-2 border-b border-line bg-mist px-4 py-3">
          <span className="h-3 w-3 rounded-full bg-[#f2b8b5]" />
          <span className="h-3 w-3 rounded-full bg-[#f7d9a0]" />
          <span className="h-3 w-3 rounded-full bg-[#bfe3c8]" />
          <span className="mx-auto flex items-center gap-1.5 rounded-md bg-white px-3 py-1 text-[0.68rem] text-muted shadow-soft">
            <span className="h-1.5 w-1.5 rounded-full bg-aqua" /> app.circlehealth.co
          </span>
        </div>

        <div className="flex">
          {/* product sidebar */}
          <div className="hidden w-14 shrink-0 flex-col items-center gap-1 border-r border-line bg-mist py-4 sm:flex">
            <span className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-teal text-white">
              <SparkIcon className="h-4 w-4" />
            </span>
            {[ChartIcon, AuthorizationIcon, ReviewIcon, ClaimsIcon].map((Icon, i) => (
              <span
                key={i}
                className={
                  i === 0
                    ? "inline-flex h-9 w-9 items-center justify-center rounded-lg bg-tealsoft text-teal"
                    : "inline-flex h-9 w-9 items-center justify-center rounded-lg text-faint"
                }
              >
                <Icon className="h-5 w-5" />
              </span>
            ))}
          </div>

          {/* main + rail */}
          <div className="min-w-0 flex-1">
            <div className="grid sm:grid-cols-[1.25fr_1fr]">
              {/* note */}
              <div className="border-b border-line p-5 sm:border-b-0 sm:border-r">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-cloud text-[0.7rem] font-bold text-ink">
                      JR
                    </span>
                    <div className="leading-tight">
                      <p className="text-xs font-semibold text-ink">
                        Progress Note
                      </p>
                      <p className="text-[0.68rem] text-muted">Session 14 · IOP</p>
                    </div>
                  </div>
                  <span className="rounded-md bg-cloud px-2 py-1 text-[0.62rem] font-semibold text-muted">
                    Draft
                  </span>
                </div>

                <div className="mt-4 space-y-2.5 text-[0.72rem] leading-relaxed text-slate">
                  <p>
                    <span className="font-semibold text-ink">S:</span> Client
                    reports reduced cravings and improved sleep over the past
                    week…
                  </p>
                  <p>
                    <span className="font-semibold text-ink">O:</span> Engaged,
                    euthymic affect. PHQ-9 down from 16 to 11.
                  </p>
                  {/* AI-inserted line */}
                  <p className="rounded-md bg-tealsoft/70 px-2 py-1.5 text-tealdeep">
                    <span className="font-semibold">A:</span> Continued medical
                    necessity supported by ASAM Dimension 5 risk…
                  </p>
                  <p>
                    <span className="font-semibold text-ink">P:</span> Maintain
                    IOP level of care; next review in 7 days.
                  </p>
                </div>

                <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-teal px-3 py-1.5 text-[0.68rem] font-semibold text-white">
                  <SparkIcon className="h-3.5 w-3.5" />
                  Drafted &amp; coded by Circle
                </div>
              </div>

              {/* compliance rail */}
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <p className="text-[0.66rem] font-semibold uppercase tracking-micro text-muted">
                    Compliance
                  </p>
                  <span className="chip-teal !px-2.5 !py-1 !text-[0.6rem]">
                    Live
                  </span>
                </div>

                <div className="mt-4 flex items-center gap-3">
                  <div className="relative h-16 w-16 shrink-0">
                    <svg viewBox="0 0 36 36" className="h-16 w-16 -rotate-90">
                      <circle cx="18" cy="18" r="15.5" fill="none" className="stroke-cloud" strokeWidth="3.6" />
                      <circle
                        cx="18"
                        cy="18"
                        r="15.5"
                        fill="none"
                        className="stroke-aqua"
                        strokeWidth="3.6"
                        strokeLinecap="round"
                        strokeDasharray="97.4"
                        strokeDashoffset="7.8"
                      />
                    </svg>
                    <span className="absolute inset-0 flex flex-col items-center justify-center leading-none">
                      <span className="font-display text-lg font-extrabold text-ink">92</span>
                      <span className="text-[0.52rem] font-semibold text-muted">SCORE</span>
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {["TJC", "CARF", "ASAM", "Payer"].map((s) => (
                      <span
                        key={s}
                        className="rounded-md border border-line bg-white px-1.5 py-0.5 text-[0.58rem] font-semibold text-slate"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <ul className="mt-4 space-y-2">
                  {checks.map((c) => (
                    <li key={c.label} className="flex items-start gap-2 text-[0.68rem]">
                      <span
                        className={
                          c.ok
                            ? "mt-px inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-aqua/15 text-aqua"
                            : "mt-px inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600"
                        }
                      >
                        {c.ok ? (
                          <CheckIcon className="h-3 w-3" />
                        ) : (
                          <span className="text-[9px] font-bold">!</span>
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
      </div>

      {/* floating stat cards */}
      <div className="badge-float absolute -right-3 -top-5 hidden animate-float sm:flex">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-aqua/15 text-aqua">
          <ClaimsIcon className="h-5 w-5" />
        </span>
        <div className="leading-tight">
          <p className="font-display text-lg font-extrabold text-ink">↓ 34%</p>
          <p className="text-[0.62rem] text-muted">claim denials</p>
        </div>
      </div>

      <div
        className="badge-float absolute -bottom-6 -left-6 hidden animate-float lg:flex"
        style={{ animationDelay: "1.5s" }}
      >
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-teal/10 text-teal">
          <ClockIcon className="h-5 w-5" />
        </span>
        <div className="leading-tight">
          <p className="font-display text-lg font-extrabold text-ink">20+ hrs</p>
          <p className="text-[0.62rem] text-muted">saved / clinician / wk</p>
        </div>
      </div>
    </div>
  );
}

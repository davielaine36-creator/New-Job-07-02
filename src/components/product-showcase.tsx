import { CheckIcon, ClaimsIcon, ReviewIcon, ClockIcon } from "./icons";

/**
 * A wide "QA dashboard" mock — KPI tiles above a live chart-review table with
 * compliance scores and status badges. The centerpiece product visual that
 * makes the platform feel real. Illustrative data.
 */
export function ProductShowcase() {
  const kpis = [
    { icon: ReviewIcon, label: "Charts reviewed today", value: "1,284", tone: "teal" },
    { icon: CheckIcon, label: "Avg. compliance score", value: "94.6", tone: "aqua" },
    { icon: ClaimsIcon, label: "Denial rate", value: "3.1%", tone: "teal" },
    { icon: ClockIcon, label: "Clinician hrs saved / wk", value: "21.4", tone: "aqua" },
  ];

  const rows = [
    { id: "Progress note · IOP", who: "J. Rivera", score: 96, status: "Ready", ok: true },
    { id: "ASAM assessment", who: "M. Cole", score: 91, status: "Ready", ok: true },
    { id: "Discharge summary", who: "A. Nguyen", score: 78, status: "Needs LOC detail", ok: false },
    { id: "Treatment plan review", who: "S. Patel", score: 99, status: "Ready", ok: true },
    { id: "Prior auth packet", who: "D. Brooks", score: 88, status: "In review", ok: true },
  ];

  return (
    <div className="relative">
      <div className="pointer-events-none absolute -inset-6 -z-10 rounded-[2.5rem] bg-gradient-to-tr from-teal/10 via-transparent to-sky/10 blur-2xl" />
      <div className="overflow-hidden rounded-3xl border border-line bg-white shadow-float">
        {/* app top bar */}
        <div className="flex items-center justify-between border-b border-line bg-mist px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-teal text-white">
              <ReviewIcon className="h-3.5 w-3.5" />
            </span>
            <p className="text-sm font-semibold text-ink">Quality &amp; UR dashboard</p>
          </div>
          <div className="hidden items-center gap-2 sm:flex">
            <span className="rounded-md bg-white px-2.5 py-1 text-[0.66rem] font-medium text-muted shadow-soft">
              This week
            </span>
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-cloud text-[0.62rem] font-bold text-ink">
              QA
            </span>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          {/* KPI tiles */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {kpis.map((k) => (
              <div key={k.label} className="rounded-2xl border border-line bg-white p-4">
                <span
                  className={
                    k.tone === "aqua"
                      ? "inline-flex h-8 w-8 items-center justify-center rounded-lg bg-aqua/15 text-aqua"
                      : "inline-flex h-8 w-8 items-center justify-center rounded-lg bg-tealsoft text-teal"
                  }
                >
                  <k.icon className="h-4 w-4" />
                </span>
                <p className="mt-3 font-display text-2xl font-extrabold text-ink">
                  {k.value}
                </p>
                <p className="mt-0.5 text-[0.72rem] leading-tight text-muted">
                  {k.label}
                </p>
              </div>
            ))}
          </div>

          {/* table */}
          <div className="mt-4 overflow-hidden rounded-2xl border border-line">
            <div className="hidden grid-cols-[1.6fr_1fr_0.8fr_1.1fr] gap-2 border-b border-line bg-mist px-4 py-2.5 text-[0.66rem] font-semibold uppercase tracking-wide text-muted sm:grid">
              <span>Chart</span>
              <span>Clinician</span>
              <span>Score</span>
              <span>Status</span>
            </div>
            {rows.map((r) => (
              <div
                key={r.id}
                className="grid grid-cols-[1.6fr_0.8fr_1.1fr] items-center gap-2 border-b border-line px-4 py-3 last:border-0 sm:grid-cols-[1.6fr_1fr_0.8fr_1.1fr]"
              >
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-ink">{r.id}</p>
                </div>
                <p className="hidden truncate text-xs text-slate sm:block">{r.who}</p>
                <div className="flex items-center gap-2">
                  <span className="hidden h-1.5 w-12 overflow-hidden rounded-full bg-cloud sm:block">
                    <span
                      className={r.ok ? "block h-full rounded-full bg-aqua" : "block h-full rounded-full bg-amber-400"}
                      style={{ width: `${r.score}%` }}
                    />
                  </span>
                  <span className="text-xs font-bold text-ink">{r.score}</span>
                </div>
                <span
                  className={
                    r.ok
                      ? "inline-flex w-fit items-center gap-1 rounded-full bg-aqua/12 px-2.5 py-1 text-[0.66rem] font-semibold text-tealdeep"
                      : "inline-flex w-fit items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-[0.66rem] font-semibold text-amber-700"
                  }
                >
                  {r.ok && <CheckIcon className="h-3 w-3" />}
                  {r.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

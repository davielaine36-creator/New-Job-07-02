import Link from "next/link";
import { allLeads } from "@/lib/radar/repo";
import { NICHE_LABELS } from "@/lib/radar/types";
import type { LeadStatus, Niche } from "@/lib/radar/types";
import { ScorePill, StatusBadge } from "../_components/ui";
import { clsx } from "@/lib/clsx";

export const dynamic = "force-dynamic";

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; niche?: string; q?: string }>;
}) {
  const sp = await searchParams;
  let leads = await allLeads();

  if (sp.status) leads = leads.filter((l) => l.status === sp.status);
  if (sp.niche) leads = leads.filter((l) => l.niche === sp.niche);
  if (sp.q) {
    const q = sp.q.toLowerCase();
    leads = leads.filter(
      (l) =>
        l.business_name.toLowerCase().includes(q) ||
        l.location_city.toLowerCase().includes(q)
    );
  }

  const niches = [...new Set((await allLeads()).map((l) => l.niche))];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="r-eyebrow">CRM</p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight">Leads</h1>
        </div>
        <form className="flex items-center gap-2" action="/ops/leads">
          <input
            name="q"
            defaultValue={sp.q ?? ""}
            placeholder="Search business or city…"
            className="r-input w-56"
          />
          {sp.status && <input type="hidden" name="status" value={sp.status} />}
          <button className="r-btn-outline">Search</button>
        </form>
      </div>

      {/* Niche filter chips */}
      <div className="flex flex-wrap gap-1.5">
        <FilterChip label="All niches" href="/ops/leads" active={!sp.niche} />
        {niches.map((n) => (
          <FilterChip
            key={n}
            label={NICHE_LABELS[n as Niche]}
            href={`/ops/leads?niche=${n}`}
            active={sp.niche === n}
          />
        ))}
      </div>

      <div className="r-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border-radar-line text-[11px] uppercase tracking-wide text-radar-faint">
                <th className="px-4 py-2.5 font-semibold">Business</th>
                <th className="px-4 py-2.5 font-semibold">Niche</th>
                <th className="px-4 py-2.5 font-semibold">City</th>
                <th className="px-4 py-2.5 font-semibold">Status</th>
                <th className="px-4 py-2.5 text-right font-semibold">Score</th>
                <th className="px-4 py-2.5 font-semibold">Offer</th>
                <th className="px-4 py-2.5 font-semibold">Contact</th>
              </tr>
            </thead>
            <tbody>
              {leads.slice(0, 300).map((l) => (
                <tr
                  key={l.id}
                  className="border-b border-radar-line/50 transition-colors hover:bg-radar-raised"
                >
                  <td className="px-4 py-2.5">
                    <Link href={`/ops/leads/${l.id}`} className="font-semibold text-radar-ink hover:text-radar-signal">
                      {l.business_name}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5 text-radar-mute">{NICHE_LABELS[l.niche]}</td>
                  <td className="px-4 py-2.5 text-radar-mute">{l.location_city}</td>
                  <td className="px-4 py-2.5"><StatusBadge status={l.status as LeadStatus} /></td>
                  <td className="px-4 py-2.5 text-right"><ScorePill score={l.score_total} /></td>
                  <td className="px-4 py-2.5 text-radar-mute">
                    {l.offer_level_recommended ? (l.offer_level_recommended === 1 ? "Refresh" : "Growth") : "—"}
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="flex gap-1.5">
                      {l.email && <Dot title="email" tone="signal" />}
                      {l.contact_page_url && <Dot title="form" tone="cyan" />}
                      {l.phone && <Dot title="phone" tone="faint" />}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {leads.length === 0 && (
          <p className="px-4 py-8 text-center text-[13px] text-radar-faint">No leads match.</p>
        )}
      </div>
      {leads.length > 300 && (
        <p className="text-[12px] text-radar-faint">Showing first 300 of {leads.length}.</p>
      )}
    </div>
  );
}

function FilterChip({ label, href, active }: { label: string; href: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={clsx(
        "rounded-md border px-2.5 py-1 text-[11.5px] font-medium transition-colors",
        active
          ? "border-radar-signal/40 bg-radar-signal/10 text-radar-signal"
          : "border-radar-line text-radar-mute hover:text-radar-ink hover:border-radar-line-strong"
      )}
    >
      {label}
    </Link>
  );
}

function Dot({ title, tone }: { title: string; tone: "signal" | "cyan" | "faint" }) {
  const c = { signal: "bg-radar-signal", cyan: "bg-radar-cyan", faint: "bg-radar-faint" }[tone];
  return <span title={title} className={clsx("mt-1 inline-block h-2 w-2 rounded-full", c)} />;
}

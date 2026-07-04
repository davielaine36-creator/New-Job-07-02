"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { NICHES, NICHE_LABELS } from "@/lib/radar/types";
import type { Niche } from "@/lib/radar/types";
import type { RadarSettings } from "@/lib/radar/settings";
import { clsx } from "@/lib/clsx";

/**
 * Operator settings. Everything that shapes targeting, sending limits, sender
 * identity (CAN-SPAM), the offer ladder, and autonomy lives here. The optimizer
 * also writes to niche/city priority — shown read-only at the bottom.
 */
export function SettingsForm({ initial }: { initial: RadarSettings }) {
  const router = useRouter();
  const [s, setS] = useState<RadarSettings>(initial);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [cityText, setCityText] = useState(
    initial.target_cities.map((c) => `${c.city}, ${c.state}`).join("\n")
  );

  function set<K extends keyof RadarSettings>(key: K, value: RadarSettings[K]) {
    setS((prev) => ({ ...prev, [key]: value }));
  }

  async function save() {
    setSaving(true);
    setMsg(null);
    const target_cities = cityText
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
      .map((l) => {
        const [city, state] = l.split(",").map((x) => x.trim());
        return { city, state: state ?? "CA" };
      });
    try {
      const res = await fetch("/api/radar/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...s, target_cities }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "failed");
      setMsg("✓ Saved");
      router.refresh();
    } catch (err) {
      setMsg(`✗ ${(err as Error).message}`);
    } finally {
      setSaving(false);
    }
  }

  function toggleNiche(n: Niche) {
    set(
      "target_niches",
      s.target_niches.includes(n)
        ? s.target_niches.filter((x) => x !== n)
        : [...s.target_niches, n]
    );
  }

  return (
    <div className="space-y-6">
      {/* Autonomy */}
      <Card title="Autonomy">
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={s.autonomous_mode}
            onChange={(e) => set("autonomous_mode", e.target.checked)}
            className="h-4 w-4 accent-[#3DF5A0]"
          />
          <span className="text-[13px]">
            Autonomous mode — run the full loop on the cron without approval
          </span>
        </label>
        <p className="mt-2 text-[11px] text-radar-faint">
          Note: the server env var <span className="font-mono">AUTONOMOUS_MODE</span> is the hard
          master switch; this toggle is the in-app override stored in settings.
        </p>
      </Card>

      {/* Targeting */}
      <Card title="Target niches">
        <div className="flex flex-wrap gap-1.5">
          {NICHES.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => toggleNiche(n)}
              className={clsx(
                "rounded-md border px-2.5 py-1 text-[11.5px] font-medium transition-colors",
                s.target_niches.includes(n)
                  ? "border-radar-signal/40 bg-radar-signal/10 text-radar-signal"
                  : "border-radar-line text-radar-mute hover:border-radar-line-strong"
              )}
            >
              {NICHE_LABELS[n]}
            </button>
          ))}
        </div>
      </Card>

      <Card title="Target cities">
        <label className="r-label">One per line — “City, ST”</label>
        <textarea
          value={cityText}
          onChange={(e) => setCityText(e.target.value)}
          rows={6}
          className="r-input font-mono"
        />
      </Card>

      {/* Thresholds + limits */}
      <Card title="Scoring thresholds & limits">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Num label="Build demo ≥" value={s.thresholds.build_demo} onChange={(v) => set("thresholds", { ...s.thresholds, build_demo: v })} />
          <Num label="Build audit ≥" value={s.thresholds.build_audit} onChange={(v) => set("thresholds", { ...s.thresholds, build_audit: v })} />
          <Num label="Store ≥" value={s.thresholds.store} onChange={(v) => set("thresholds", { ...s.thresholds, store: v })} />
          <Num label="Daily send cap" value={s.daily_send_limit} onChange={(v) => set("daily_send_limit", v)} />
        </div>
        <div className="mt-4">
          <label className="r-label">Follow-up cadence (days for step 0–3)</label>
          <div className="flex gap-2">
            {s.sequence_days.map((d, i) => (
              <input
                key={i}
                type="number"
                value={d}
                onChange={(e) => {
                  const next = [...s.sequence_days] as [number, number, number, number];
                  next[i] = Number(e.target.value);
                  set("sequence_days", next);
                }}
                className="r-input w-20"
              />
            ))}
          </div>
        </div>
      </Card>

      {/* Sender identity */}
      <Card title="Sender identity (CAN-SPAM)">
        <div className="grid gap-3 md:grid-cols-2">
          <Text label="From name" value={s.sender.from_name} onChange={(v) => set("sender", { ...s.sender, from_name: v })} />
          <Text label="From email" value={s.sender.from_email} onChange={(v) => set("sender", { ...s.sender, from_email: v })} />
          <Text label="Company name" value={s.sender.company_name} onChange={(v) => set("sender", { ...s.sender, company_name: v })} />
          <Text label="Reply-to" value={s.sender.reply_to} onChange={(v) => set("sender", { ...s.sender, reply_to: v })} />
          <div className="md:col-span-2">
            <Text label="Physical mailing address (required)" value={s.sender.physical_address} onChange={(v) => set("sender", { ...s.sender, physical_address: v })} />
          </div>
          <Text label="Signature" value={s.sender.signature} onChange={(v) => set("sender", { ...s.sender, signature: v })} />
          <Text label="Booking link" value={s.booking_link} onChange={(v) => set("booking_link", v)} />
        </div>
        <div className="mt-3">
          <Text label="Unsubscribe line (use {{unsubscribe_url}})" value={s.unsubscribe_text} onChange={(v) => set("unsubscribe_text", v)} />
        </div>
      </Card>

      {/* Offers */}
      <Card title="Offer ladder">
        <div className="grid gap-3 md:grid-cols-2">
          <Text label="Level 1 setup" value={s.offers.level1.setup} onChange={(v) => set("offers", { ...s.offers, level1: { ...s.offers.level1, setup: v } })} />
          <Text label="Level 1 monthly" value={s.offers.level1.monthly} onChange={(v) => set("offers", { ...s.offers, level1: { ...s.offers.level1, monthly: v } })} />
          <Text label="Level 2 setup" value={s.offers.level2.setup} onChange={(v) => set("offers", { ...s.offers, level2: { ...s.offers.level2, setup: v } })} />
          <Text label="Level 2 retainer" value={s.offers.level2.retainer} onChange={(v) => set("offers", { ...s.offers, level2: { ...s.offers.level2, retainer: v } })} />
        </div>
      </Card>

      {/* Optimizer output (read-only) */}
      <Card title="Optimizer-learned priorities (read-only)">
        {Object.keys(s.niche_priority).length === 0 ? (
          <p className="text-[12px] text-radar-faint">No learned priorities yet — run the optimizer.</p>
        ) : (
          <div className="grid grid-cols-2 gap-x-6 gap-y-1 md:grid-cols-3">
            {Object.entries(s.niche_priority).map(([n, mult]) => (
              <div key={n} className="flex items-center justify-between text-[12px]">
                <span className="text-radar-mute">{NICHE_LABELS[n as Niche] ?? n}</span>
                <span className={clsx("font-mono", (mult ?? 1) >= 1 ? "text-radar-signal" : "text-radar-amber")}>
                  ×{(mult ?? 1).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      <div className="sticky bottom-4 flex items-center gap-3">
        <button onClick={save} disabled={saving} className="r-btn-primary">
          {saving ? "Saving…" : "Save settings"}
        </button>
        {msg && (
          <span className={clsx("font-mono text-[12px]", msg.startsWith("✗") ? "text-radar-rose" : "text-radar-signal")}>
            {msg}
          </span>
        )}
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="r-panel p-5">
      <h2 className="mb-3 text-sm font-bold">{title}</h2>
      {children}
    </section>
  );
}
function Text({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="r-label">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} className="r-input" />
    </div>
  );
}
function Num({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <label className="r-label">{label}</label>
      <input type="number" value={value} onChange={(e) => onChange(Number(e.target.value))} className="r-input" />
    </div>
  );
}

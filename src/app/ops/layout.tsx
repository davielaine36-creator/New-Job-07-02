import Link from "next/link";
import type { Metadata } from "next";
import { capabilities } from "@/lib/radar/config";
import { clsx } from "@/lib/clsx";
import { SideNav } from "./_components/side-nav";
import { ControlBar } from "./_components/control-bar";

export const metadata: Metadata = {
  title: "Operations Cockpit",
};

/**
 * The AI Work Radar cockpit shell — a dark, high-signal operations console.
 * Sidebar navigation, a live capability/mode strip, and the manual control bar.
 */
export default function OpsLayout({ children }: { children: React.ReactNode }) {
  const cap = capabilities();
  return (
    <div className="radar min-h-screen">
      <div className="mx-auto flex min-h-screen max-w-[1500px]">
        {/* Sidebar */}
        <aside className="hidden w-60 shrink-0 flex-col border-r border-radar-line bg-radar-surface/60 px-4 py-5 md:flex">
          <Link href="/ops" className="mb-7 flex items-center gap-2.5 px-2">
            <span className="relative flex h-7 w-7 items-center justify-center rounded-md bg-radar-signal/15">
              <span className="h-2.5 w-2.5 rounded-full bg-radar-signal animate-pulse-signal" />
            </span>
            <span className="font-display text-[15px] font-extrabold tracking-tight text-radar-ink">
              AI Work Radar
            </span>
          </Link>
          <SideNav />
          <div className="mt-auto space-y-2 pt-6">
            <CapRow label="Mode" value={cap.mode} tone={cap.mode === "live" ? "amber" : "cyan"} />
            <CapRow label="Autonomy" value={cap.autonomous ? "ON" : "OFF"} tone={cap.autonomous ? "signal" : "faint"} />
            <CapRow label="Database" value={cap.db} />
            <CapRow label="Model" value={cap.ai} />
            <CapRow label="Source" value={cap.source} />
            <CapRow label="Email" value={cap.email} />
          </div>
        </aside>

        {/* Main */}
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 border-b border-radar-line bg-radar-bg/85 px-5 py-3 backdrop-blur">
            <div className="flex items-center gap-3">
              <span className="md:hidden font-display text-sm font-extrabold">AI Work Radar</span>
              <LiveTag autonomous={cap.autonomous} mode={cap.mode} />
            </div>
            <ControlBar mode={cap.mode} />
          </header>
          <main className="flex-1 px-5 py-6">{children}</main>
        </div>
      </div>
    </div>
  );
}

function CapRow({
  label,
  value,
  tone = "mute",
}: {
  label: string;
  value: string;
  tone?: "mute" | "signal" | "cyan" | "amber" | "faint";
}) {
  const toneClass = {
    mute: "text-radar-mute",
    signal: "text-radar-signal",
    cyan: "text-radar-cyan",
    amber: "text-radar-amber",
    faint: "text-radar-faint",
  }[tone];
  return (
    <div className="flex items-center justify-between rounded-md border border-radar-line bg-radar-raised px-2.5 py-1.5">
      <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-radar-faint">
        {label}
      </span>
      <span className={clsx("font-mono text-[11px] font-semibold", toneClass)}>{value}</span>
    </div>
  );
}

function LiveTag({ autonomous, mode }: { autonomous: boolean; mode: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-radar-line bg-radar-surface px-3 py-1">
      <span
        className={clsx(
          "h-2 w-2 rounded-full",
          autonomous ? "bg-radar-signal animate-pulse-signal" : "bg-radar-faint"
        )}
      />
      <span className="font-mono text-[11px] font-semibold text-radar-mute">
        {autonomous ? "AUTONOMOUS" : "MANUAL"} · {mode.toUpperCase()}
      </span>
    </span>
  );
}

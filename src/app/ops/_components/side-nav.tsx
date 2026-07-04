"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "@/lib/clsx";

const ITEMS = [
  { href: "/ops", label: "Dashboard", icon: "◧", exact: true },
  { href: "/ops/pipeline", label: "Pipeline", icon: "▤" },
  { href: "/ops/leads", label: "Leads", icon: "☰" },
  { href: "/ops/runs", label: "Agent Runs", icon: "⟳" },
  { href: "/ops/settings", label: "Settings", icon: "⚙" },
];

export function SideNav() {
  const path = usePathname();
  return (
    <nav className="flex flex-col gap-1">
      {ITEMS.map((it) => {
        const active = it.exact ? path === it.href : path.startsWith(it.href);
        return (
          <Link
            key={it.href}
            href={it.href}
            className={clsx(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors",
              active
                ? "bg-radar-overlay text-radar-ink"
                : "text-radar-mute hover:text-radar-ink hover:bg-radar-raised"
            )}
          >
            <span
              className={clsx(
                "text-base leading-none",
                active ? "text-radar-signal" : "text-radar-faint"
              )}
            >
              {it.icon}
            </span>
            {it.label}
          </Link>
        );
      })}
    </nav>
  );
}

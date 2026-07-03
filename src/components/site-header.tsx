"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { site } from "@/lib/site";
import { clsx } from "@/lib/clsx";
import { Logo } from "./logo";

export function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile menu on navigation.
  useEffect(() => setOpen(false), [pathname]);

  return (
    <header
      className={clsx(
        "sticky top-0 z-40 transition-all duration-300 ease-soft",
        scrolled
          ? "bg-white/85 backdrop-blur-md border-b border-line"
          : "bg-transparent border-b border-transparent"
      )}
    >
      <div className="mx-auto flex max-w-shell items-center justify-between px-6 md:px-10 h-[4.5rem]">
        <Logo />

        <nav className="hidden md:flex items-center gap-8">
          {site.nav.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "text-sm font-medium transition-colors duration-200",
                  active ? "text-teal" : "text-slate hover:text-ink"
                )}
              >
                {item.label}
              </Link>
            );
          })}
          <Link href={site.cta.href} className="btn-primary !px-5 !py-2.5">
            {site.cta.label}
          </Link>
        </nav>

        <button
          onClick={() => setOpen((v) => !v)}
          className="md:hidden text-ink p-2 -mr-2"
          aria-expanded={open}
          aria-label="Toggle menu"
        >
          <span className="block w-6 space-y-[5px]">
            <span
              className={clsx(
                "block h-0.5 rounded bg-current transition-transform duration-300",
                open && "translate-y-[7px] rotate-45"
              )}
            />
            <span
              className={clsx(
                "block h-0.5 rounded bg-current transition-opacity duration-300",
                open && "opacity-0"
              )}
            />
            <span
              className={clsx(
                "block h-0.5 rounded bg-current transition-transform duration-300",
                open && "-translate-y-[7px] -rotate-45"
              )}
            />
          </span>
        </button>
      </div>

      {/* Mobile drawer */}
      <div
        className={clsx(
          "md:hidden overflow-hidden border-t bg-white transition-[max-height] duration-500 ease-soft",
          open ? "max-h-96 border-line" : "max-h-0 border-transparent"
        )}
      >
        <nav className="flex flex-col px-6 py-3">
          {site.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="py-3 text-slate hover:text-ink text-base border-b border-line last:border-0"
            >
              {item.label}
            </Link>
          ))}
          <Link href={site.cta.href} className="btn-primary mt-4 mb-2">
            {site.cta.label}
          </Link>
        </nav>
      </div>
    </header>
  );
}

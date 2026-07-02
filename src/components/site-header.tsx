"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { site } from "@/lib/site";
import { clsx } from "@/lib/clsx";

export function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile menu on navigation.
  useEffect(() => setOpen(false), [pathname]);

  return (
    <header
      className={clsx(
        "sticky top-0 z-40 transition-all duration-500 ease-lux",
        scrolled
          ? "bg-void/80 backdrop-blur-md border-b border-graphite/80"
          : "bg-transparent border-b border-transparent"
      )}
    >
      <div className="mx-auto flex max-w-shell items-center justify-between px-6 md:px-10 h-[4.5rem]">
        <Link
          href="/"
          className="font-display text-lg tracking-[0.25em] text-cream hover:text-champagne transition-colors"
          aria-label={`${site.name} — home`}
        >
          {site.name}
        </Link>

        <nav className="hidden md:flex items-center gap-9">
          {site.nav.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "text-sm tracking-wide transition-colors duration-300",
                  active ? "text-champagne" : "text-mist hover:text-cream"
                )}
              >
                {item.label}
              </Link>
            );
          })}
          <Link href="/subscribe" className="btn-gold !px-5 !py-2 text-xs">
            Subscribe
          </Link>
        </nav>

        <button
          onClick={() => setOpen((v) => !v)}
          className="md:hidden text-cream p-2 -mr-2"
          aria-expanded={open}
          aria-label="Toggle menu"
        >
          <span className="block w-6 space-y-[5px]">
            <span
              className={clsx(
                "block h-px bg-current transition-transform duration-300",
                open && "translate-y-[6px] rotate-45"
              )}
            />
            <span
              className={clsx(
                "block h-px bg-current transition-opacity duration-300",
                open && "opacity-0"
              )}
            />
            <span
              className={clsx(
                "block h-px bg-current transition-transform duration-300",
                open && "-translate-y-[6px] -rotate-45"
              )}
            />
          </span>
        </button>
      </div>

      {/* Mobile drawer */}
      <div
        className={clsx(
          "md:hidden overflow-hidden border-t border-graphite/60 bg-void/95 backdrop-blur-md transition-[max-height] duration-500 ease-lux",
          open ? "max-h-96" : "max-h-0"
        )}
      >
        <nav className="flex flex-col px-6 py-4">
          {site.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="py-3 text-mist hover:text-cream text-base border-b border-graphite/40 last:border-0"
            >
              {item.label}
            </Link>
          ))}
          <Link href="/subscribe" className="btn-gold mt-5 mb-2">
            Subscribe
          </Link>
        </nav>
      </div>
    </header>
  );
}

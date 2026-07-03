import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

/**
 * Marketing shell — the public Circle Health demo site.
 *
 * Lives in its own route group so it keeps its light "clinical calm" chrome
 * (header + footer) while the AI Work Radar operations cockpit under /ops runs
 * an entirely separate dark shell from the same Next.js app.
 */
export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-canvas text-slate">
      <SiteHeader />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}

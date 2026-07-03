import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

/**
 * Root shell for the whole app. Deliberately minimal: it only wires fonts and
 * the base stylesheet, then hands off to route-group layouts.
 *
 *   (site)/  → the light Circle Health marketing demo (its own header/footer)
 *   ops/     → the AI Work Radar operations cockpit (dark shell)
 *
 * Keeping chrome out of the root lets those two experiences look nothing alike
 * while sharing one deployment.
 */
const display = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["500", "600", "700", "800"],
});

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "AI Work Radar — Autonomous client-acquisition factory",
    template: "%s · AI Work Radar",
  },
  description:
    "AI Work Radar is an autonomous, compliance-guarded client-acquisition factory for local service businesses: discovery → audit → score → demo → outreach → follow-up → CRM → optimization.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#07090c",
  colorScheme: "light dark",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${sans.variable} ${mono.variable}`}
    >
      <body className="min-h-screen">{children}</body>
    </html>
  );
}

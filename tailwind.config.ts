import type { Config } from "tailwindcss";

/**
 * Design tokens for "futuristic dark-luxury minimalism".
 *
 * Palette philosophy:
 *  - void / obsidian / onyx  → deep cosmic off-black backgrounds
 *  - ivory / cream           → warm reading surface for long-form content
 *  - champagne / gold        → thin-line jewellery accents, used sparingly
 *
 * Colour + finish are governed by this brief; the supplied brand deck
 * governs structure, voice, typographic feel and layout language.
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        void: "#0c0b0a",      // warm off-black — page base (reads luxury, not SaaS)
        obsidian: "#12100e",  // primary surface
        onyx: "#1a1713",      // raised surface / cards
        graphite: "#262019",  // warm hairline dividers, subtle fills
        ivory: "#f4efe6",     // warm reading text
        cream: "#efe7d8",     // headline text on dark
        mist: "#a9a39a",      // muted body / captions
        ash: "#6b675f",       // faint metadata
        champagne: "#d8bd8a", // primary gold accent
        gold: "#c9a86a",      // deeper gold for borders / rules
        goldsoft: "#8a7550",  // low-emphasis gold
      },
      fontFamily: {
        // Recommended premium licences live in the README; these
        // high-quality stand-ins ship so the site builds out of the box.
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      fontSize: {
        "display-xl": ["clamp(3rem, 8vw, 6.5rem)", { lineHeight: "0.98", letterSpacing: "-0.03em" }],
        "display-lg": ["clamp(2.4rem, 5.5vw, 4.25rem)", { lineHeight: "1.02", letterSpacing: "-0.025em" }],
        "display-md": ["clamp(1.9rem, 3.5vw, 2.75rem)", { lineHeight: "1.08", letterSpacing: "-0.02em" }],
      },
      letterSpacing: {
        micro: "0.28em",
      },
      maxWidth: {
        prose: "42rem",
        shell: "78rem",
      },
      transitionTimingFunction: {
        lux: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.9s cubic-bezier(0.22, 1, 0.36, 1) both",
        shimmer: "shimmer 8s linear infinite",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;

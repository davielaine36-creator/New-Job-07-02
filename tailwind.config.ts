import type { Config } from "tailwindcss";

/**
 * Design tokens for the Circle Health refresh.
 *
 * Brand direction — "clinical calm": a trustworthy healthtech system built on
 * clean white surfaces, a confident medical teal, a deep teal-navy ink, and a
 * bright aqua used for the "compliant / positive" moments (checks, highlights).
 * The feel is precise and reassuring — software a clinician trusts with a chart.
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Ink & text
        ink: "#0A2A33", // deep teal-navy — headlines & primary text
        slate: "#3F5A64", // body copy
        muted: "#67818B", // captions / secondary
        faint: "#9BAFB6", // metadata / disabled

        // Brand
        teal: "#0E857A", // primary brand
        tealdeep: "#0A5F57", // hover / pressed / deep fills
        tealsoft: "#E4F2F0", // tinted chips & surfaces
        aqua: "#1FB8A6", // bright positive accent (checks, highlights)
        sky: "#2E77C9", // occasional secondary accent (data / AI)

        // Surfaces
        canvas: "#FFFFFF", // base page
        mist: "#F3F8F7", // alt section background
        cloud: "#E9F2F0", // raised tint / subtle fills
        line: "#DBE7E5", // hairline borders

        // ── AI Work Radar cockpit (dark "dark factory" console) ──────────
        // A serious, high-signal operations UI: near-black carbon surfaces,
        // a phosphor-green "signal" accent for live/positive states, and a
        // small status ramp used across the pipeline and metrics.
        radar: {
          bg: "#07090C", // page base — near black with a cool cast
          surface: "#0C1016", // panels / cards
          raised: "#111722", // raised rows, inputs
          overlay: "#161E2B", // popovers, hover fills
          line: "#1E2836", // hairline borders
          "line-strong": "#2A3646",
          ink: "#EAF1F8", // primary text
          mute: "#9DB0C4", // secondary text
          faint: "#5C6E82", // metadata / disabled
          signal: "#3DF5A0", // primary accent — live / positive / go
          "signal-deep": "#12B877",
          cyan: "#38E1FF", // data / AI accent
          amber: "#FFC24B", // caution / pending
          rose: "#FF5D73", // error / suppressed / lost
          violet: "#9C7CFF", // demos / creative
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      fontSize: {
        "display-xl": [
          "clamp(2.6rem, 6vw, 4.5rem)",
          { lineHeight: "1.03", letterSpacing: "-0.03em" },
        ],
        "display-lg": [
          "clamp(2.1rem, 4.5vw, 3.25rem)",
          { lineHeight: "1.07", letterSpacing: "-0.025em" },
        ],
        "display-md": [
          "clamp(1.7rem, 3vw, 2.35rem)",
          { lineHeight: "1.12", letterSpacing: "-0.02em" },
        ],
      },
      letterSpacing: {
        micro: "0.18em",
      },
      maxWidth: {
        prose: "42rem",
        shell: "80rem",
      },
      borderRadius: {
        xl: "0.9rem",
        "2xl": "1.35rem",
        "3xl": "1.9rem",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(10, 42, 51, 0.04), 0 6px 20px -12px rgba(10, 42, 51, 0.12)",
        card: "0 2px 6px rgba(10, 42, 51, 0.05), 0 18px 40px -24px rgba(10, 42, 51, 0.18)",
        lift: "0 8px 24px -8px rgba(14, 133, 122, 0.28)",
        float:
          "0 4px 12px rgba(10, 42, 51, 0.06), 0 30px 60px -28px rgba(10, 42, 51, 0.30)",
        glow: "0 0 0 1px rgba(31,184,166,0.12), 0 24px 70px -30px rgba(31, 184, 166, 0.55)",
      },
      transitionTimingFunction: {
        soft: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        "pulse-signal": {
          "0%, 100%": { opacity: "1", boxShadow: "0 0 0 0 rgba(61,245,160,0.5)" },
          "50%": { opacity: "0.7", boxShadow: "0 0 0 6px rgba(61,245,160,0)" },
        },
        "sweep": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) both",
        float: "float 6s ease-in-out infinite",
        "pulse-signal": "pulse-signal 2s ease-in-out infinite",
        sweep: "sweep 1.6s ease-in-out infinite",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;

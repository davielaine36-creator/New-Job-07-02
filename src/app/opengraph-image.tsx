import { ImageResponse } from "next/og";
import { site } from "@/lib/site";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = `${site.name} — ${site.tagline}`;

// Default social card — light, clean, and on-brand: teal mark, ink headline,
// aqua underline. Mirrors the site so shared links feel of a piece.
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background:
            "radial-gradient(60% 60% at 15% 0%, #e4f2f0 0%, #ffffff 60%)",
          color: "#0A2A33",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <svg width="48" height="48" viewBox="0 0 32 32">
            <circle
              cx="16"
              cy="16"
              r="11"
              fill="none"
              stroke="#0E857A"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray="55 30"
              transform="rotate(128 16 16)"
            />
            <circle cx="26" cy="12" r="4" fill="#1FB8A6" />
          </svg>
          <div style={{ display: "flex", fontSize: 34, fontWeight: 800 }}>
            <span>Circle</span>
            <span style={{ color: "#0E857A" }}>Health</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <div style={{ fontSize: 66, lineHeight: 1.04, maxWidth: 960, fontWeight: 800 }}>
            A team of AI assistants inside your EMR.
          </div>
          <div style={{ width: 160, height: 6, background: "#1FB8A6", borderRadius: 6 }} />
        </div>

        <div style={{ fontSize: 26, color: "#3F5A64" }}>
          AI for behavioral health UR &amp; QA
        </div>
      </div>
    ),
    size
  );
}

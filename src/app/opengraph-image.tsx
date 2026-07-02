import { ImageResponse } from "next/og";
import { site } from "@/lib/site";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = `${site.name} — ${site.tagline}`;

// Default social card. Deep void, a hairline gold rule, and the wordmark —
// the same restraint as the site, so shared links feel of a piece.
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
            "radial-gradient(120% 80% at 50% -10%, #0d0d12 0%, #050506 60%)",
          color: "#efe7d8",
          fontFamily: "Georgia, serif",
        }}
      >
        <div
          style={{
            fontSize: 26,
            letterSpacing: 10,
            color: "#d8bd8a",
            textTransform: "uppercase",
          }}
        >
          {site.name}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ width: 120, height: 1, background: "#c9a86a" }} />
          <div style={{ fontSize: 72, lineHeight: 1.05, maxWidth: 900 }}>
            Quiet power, precisely written.
          </div>
        </div>
        <div style={{ fontSize: 24, color: "#a9a39a" }}>{site.tagline}</div>
      </div>
    ),
    size
  );
}

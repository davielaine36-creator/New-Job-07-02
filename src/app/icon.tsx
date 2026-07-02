import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

// Wordmark initial in champagne on the void — a small, consistent mark.
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0c0b0a",
          color: "#d8bd8a",
          fontSize: 40,
          fontFamily: "Georgia, serif",
          fontWeight: 500,
        }}
      >
        A
      </div>
    ),
    size
  );
}

import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

// The Circle mark: an open teal ring with a live aqua node, on white.
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
          background: "#ffffff",
        }}
      >
        <svg width="52" height="52" viewBox="0 0 32 32">
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
      </div>
    ),
    size
  );
}

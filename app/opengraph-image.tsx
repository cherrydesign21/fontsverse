import { ImageResponse } from "next/og";

export const runtime     = "edge";
export const alt         = "FontsVerse — The Open Font Platform";
export const size        = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#ffffff",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          position: "relative",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Gradient top bar */}
        <div
          style={{
            position: "absolute",
            top: 0, left: 0, right: 0, height: 7,
            background: "linear-gradient(135deg,#8ECAE6,#219EBC,#023047,#FFB703,#FB8500)",
          }}
        />

        <p style={{ fontSize: 20, color: "#9ca3af", letterSpacing: "4px", textTransform: "uppercase", fontWeight: 700, margin: "0 0 28px" }}>
          Open Font Platform
        </p>

        <h1 style={{ fontSize: 84, fontWeight: 900, color: "#030712", lineHeight: 0.95, margin: "0 0 36px", letterSpacing: "-3px" }}>
          Fonts that work{"\n"}everywhere.
        </h1>

        <p style={{ fontSize: 28, color: "#6b7280", maxWidth: 640, lineHeight: 1.5, margin: 0 }}>
          Upload, host, and integrate custom fonts into any framework — for free.
        </p>

        <p style={{ position: "absolute", bottom: 60, left: 80, fontSize: 22, color: "#d1d5db", fontWeight: 600, margin: 0 }}>
          fontsverse.vercel.app
        </p>
      </div>
    ),
    { ...size },
  );
}

import { ImageResponse } from "next/og";
export const alt = "Open24 — Find places. Keep exploring.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 70,
        background: "#E8F4FD",
        color: "#0A2540",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ fontSize: 42, fontWeight: 700, letterSpacing: -2 }}>
          open24.
        </div>
        <div
          style={{
            fontSize: 20,
            padding: "12px 22px",
            borderRadius: 99,
            background: "#FF6B6B",
            color: "#0A2540",
          }}
        >
          Your world, always open.
        </div>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          fontSize: 90,
          lineHeight: 1.05,
          fontWeight: 500,
          letterSpacing: -5,
        }}
      >
        <div>Find places.</div>
        <div>Keep exploring.</div>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: 23,
          color: "#0A2540",
        }}
      >
        <div>Local places. Open possibilities.</div>
        <div>Qarshi, Uzbekistan</div>
      </div>
    </div>,
    size,
  );
}

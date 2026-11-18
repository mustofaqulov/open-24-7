import { ImageResponse } from "next/og";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";
export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0A2540",
      }}
    >
      <svg width="115" height="140" viewBox="0 0 24 28" fill="none">
        <path
          d="M21 11c0 7-9 15-9 15S3 18 3 11a9 9 0 1 1 18 0Z"
          stroke="#E8F4FD"
          strokeWidth="1.8"
        />
        <circle cx="12" cy="11" r="3" stroke="#E8F4FD" strokeWidth="1.8" />
      </svg>
    </div>,
    size,
  );
}

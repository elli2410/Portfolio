import { ImageResponse } from "next/og";

export const alt = "Elliah Rain Panopio — CS Student Portfolio";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "#ffffff",
          color: "#0a0a0a",
        }}
      >
        <div style={{ fontSize: 28, color: "#525252", marginBottom: 24 }}>
          Computer Science Student · Open to internships
        </div>
        <div style={{ fontSize: 96, fontWeight: 700, lineHeight: 1.05 }}>
          Elliah Rain Panopio
        </div>
        <div style={{ fontSize: 34, color: "#404040", marginTop: 32 }}>
          Web development · Android · Machine learning
        </div>
      </div>
    ),
    size,
  );
}

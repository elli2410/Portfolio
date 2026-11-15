import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";

export const alt = "Elliah Rain Panopio — CS Student Portfolio";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Deterministic "windows" so the card looks the same on every build.
const WINDOWS = Array.from({ length: 70 }, (_, i) => {
  const r = (n: number) => {
    const v = Math.sin(i * 91.7 + n * 37.1) * 43758.5453;
    return v - Math.floor(v);
  };
  return {
    x: Math.round((r(1) * 1180) / 12) * 12,
    y: 300 + Math.round((r(2) * 260) / 12) * 12,
    c: ["#ffd36a", "#38f0ff", "#ff3fd0", "#ffb347"][Math.floor(r(3) * 4)],
  };
});

export default async function OpengraphImage() {
  const font = await readFile(
    path.join(
      process.cwd(),
      "node_modules/@fontsource/silkscreen/files/silkscreen-latin-700-normal.woff",
    ),
  );

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 80px 70px",
          background: "linear-gradient(#03051a, #0c1a4a 50%, #2a3a88 82%, #59489e)",
          fontFamily: "PressStart",
        }}
      >
        {WINDOWS.map((w, i) => (
          <div key={i} style={{ position: "absolute", left: w.x, top: w.y, width: 8, height: 12, background: w.c, opacity: 0.8 }} />
        ))}
        {/* neon sun and street */}
        <div style={{ position: "absolute", right: 90, top: 60, width: 120, height: 120, background: "#ff3fd0", borderRadius: 60, boxShadow: "0 0 80px 10px rgba(255,63,208,0.5)" }} />
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 56, background: "#070a26", display: "flex" }} />
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 56, height: 4, background: "#38f0ff", display: "flex" }} />

        <div style={{ display: "flex", fontSize: 20, color: "#38f0ff", marginBottom: 36, fontFamily: "PressStart" }}>
          CS STUDENT · OPEN TO INTERNSHIPS
        </div>
        <div style={{ display: "flex", flexDirection: "column", fontSize: 64, lineHeight: 1.3, color: "#ffffff" }}>
          <div style={{ display: "flex", textShadow: "6px 6px 0 #ff3fd0" }}>Elliah Rain</div>
          <div style={{ display: "flex", textShadow: "6px 6px 0 #ff3fd0" }}>Panopio</div>
        </div>
        <div style={{ display: "flex", fontSize: 22, color: "#e6f6ff", marginTop: 40, fontFamily: "PressStart" }}>
          Web · Android · Machine learning
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: "PressStart", data: font, style: "normal", weight: 700 }],
    },
  );
}

import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";

export const alt = "Elliah Rain Panopio — CS Student Portfolio";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Deterministic "stars" so the card looks the same on every build.
const STARS = Array.from({ length: 46 }, (_, i) => {
  const r = (n: number) => {
    const s = Math.sin(i * 91.7 + n * 37.1) * 43758.5453;
    return s - Math.floor(s);
  };
  return { x: Math.round(r(1) * 1180 / 8) * 8, y: Math.round(r(2) * 400 / 8) * 8, s: r(3) > 0.85 ? 8 : 4 };
}).filter((st) => !(st.x < 820 && st.y > 100 && st.y < 450)); // keep stars off the text

export default async function OpengraphImage() {
  const font = await readFile(
    path.join(
      process.cwd(),
      "node_modules/@fontsource/press-start-2p/files/press-start-2p-latin-400-normal.woff",
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
          background: "linear-gradient(#06051c, #171348 45%, #3c2a85 80%, #733d96)",
          fontFamily: "PressStart",
        }}
      >
        {STARS.map((st, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: st.x,
              top: st.y,
              width: st.s,
              height: st.s,
              background: i % 5 === 0 ? "#b9bfff" : "#ffffff",
            }}
          />
        ))}

        {/* moon */}
        <div
          style={{
            position: "absolute",
            right: 90,
            top: 60,
            width: 96,
            height: 96,
            background: "#fff3c8",
            borderRadius: 48,
            boxShadow: "0 0 0 16px rgba(185,168,255,0.18)",
          }}
        />

        {/* ground */}
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 64, background: "#17402f", display: "flex" }} />
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 64, height: 8, background: "#2e7a4e", display: "flex" }} />
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 16, height: 40, background: "#5d5a80", display: "flex" }} />

        <div style={{ display: "flex", fontSize: 20, color: "#bdb5dc", marginBottom: 36, fontFamily: "PressStart" }}>
          CS STUDENT · OPEN TO INTERNSHIPS
        </div>
        <div style={{ display: "flex", flexDirection: "column", fontSize: 64, lineHeight: 1.3, color: "#f2c14e" }}>
          <div style={{ display: "flex", textShadow: "6px 6px 0 #3a2a8a" }}>Elliah Rain</div>
          <div style={{ display: "flex", textShadow: "6px 6px 0 #3a2a8a" }}>Panopio</div>
        </div>
        <div style={{ display: "flex", fontSize: 22, color: "#f4ecd8", marginTop: 40, fontFamily: "PressStart" }}>
          Web · Android · Machine learning
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: "PressStart", data: font, style: "normal", weight: 400 }],
    },
  );
}

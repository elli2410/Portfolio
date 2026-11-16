import Image from "next/image";
import { MAIL, PLAY, PixelSprite } from "./PixelSprite";

/**
 * The red rooftop billboard. Everything on the face is "projected" onto it:
 * no cards, just light on metal. A second, smaller LED panel hangs from the
 * same crossbeam and carries the RDDPDS detection preview.
 */
export default function Hero() {
  return (
    <header id="top" className="bb-stage">
      <div className="bb-rig">
        {/* catwalk + floodlights above the face */}
        <div className="bb-gantry" aria-hidden="true">
          <span className="bb-flood" style={{ left: "12%" }} />
          <span className="bb-flood" style={{ left: "38%" }} />
          <span className="bb-flood" style={{ left: "64%" }} />
          <span className="bb-flood" style={{ left: "88%" }} />
        </div>

        <div className="bb-frame">
          <div className="bb-face">
            <div className="bb-grid">
              <div className="bb-copy">
                <p className="bb-kicker">&gt; Computer Science Student · Open to internships</p>
                <h1 className="bb-title">Hi, I&apos;m Elli.</h1>
                <p className="bb-lead">
                  I turn ideas into software through web development, machine learning, and a
                  curiosity for solving real-world problems.
                </p>
                <p className="bb-sub">
                  Elliah Rain Panopio — 4th-year CS student at National University Laguna, looking
                  for a software or frontend internship.
                </p>
                <div className="bb-ctas">
                  <a href="#work" className="bb-cta">
                    <PixelSprite rows={PLAY} size={2} />
                    View my work
                  </a>
                  <a href="#contact" className="bb-cta bb-cta-alt">
                    <PixelSprite rows={MAIL} size={2} />
                    Get in touch
                  </a>
                </div>
              </div>

              <figure className="bb-portrait">
                <div className="bb-photo">
                  <Image
                    src="/photo.jpeg"
                    alt="Elli"
                    fill
                    sizes="(min-width: 800px) 240px, 110px"
                    priority
                    className="object-cover"
                  />
                </div>
                <figcaption>
                  ELLI<span className="bb-hide-sm"> · 4TH-YEAR CS</span>
                </figcaption>
              </figure>
            </div>
            <span className="bb-tag" aria-hidden="true">
              ELLI-DEV · AD-00 · 24H
            </span>
          </div>
        </div>

        {/* a small LED panel hung from the crossbeam: the RDDPDS preview */}
        <div className="bb-under">
        <span className="bb-leg bb-leg-l" aria-hidden="true" />
        <span className="bb-leg bb-leg-r" aria-hidden="true" />
        <section aria-label="Thesis preview" className="bb-ticker">
          <span className="bb-hang bb-hang-l" aria-hidden="true" />
          <span className="bb-hang bb-hang-r" aria-hidden="true" />
          <div className="bb-ticker-face">
            <p className="bb-ticker-head">
              <span>SCANNING FOR DECEPTIVE PATTERNS</span> — a preview of how RDDPDS, my thesis
              project, flags manipulative UI in real time
            </p>
            <div className="bb-ticker-grid">
              <div className="relative h-44">
                <div className="px-layer left-3 top-3" />
                <div className="px-layer left-9 top-9 !border-[#4a5ad0]" />
                <div className="px-layer stack-flag left-[3.75rem] top-[3.75rem] !bg-[#0a0a2c] !border-[var(--px-pink)] p-2">
                  <div className="mb-2 h-2 w-1/2 bg-[var(--px-edge-dim)]" />
                  <div className="h-4 w-2/3 bg-[var(--px-pink)]" />
                </div>
                <span className="absolute left-3 top-[9.6rem] whitespace-nowrap text-base text-[var(--px-muted)]">
                  layer 3 — flagged
                </span>
              </div>

              <div className="px-term border-l-4 border-[var(--px-edge-dim)] py-2 pl-5">
                <p className="log-line log-1 mb-2 text-[var(--px-muted)]">10:41:05 scanning layer 1...</p>
                <p className="log-line log-2 mb-2 text-[var(--px-muted)]">10:41:06 scanning layer 2...</p>
                <p className="log-line log-3 mb-2 text-[var(--px-muted)]">10:41:07 scanning layer 3...</p>
                <p className="log-line log-4 mb-2 font-semibold text-[var(--px-pink)]">
                  10:41:09 match — confirmshaming
                </p>
                <p className="log-line log-5 mb-2 text-[var(--px-cyan)]">10:41:09 CDS score: 0.94</p>
                <p className="log-line log-6 text-[var(--px-gold)]">
                  10:41:10 flag raised{" "}
                  <span className="cursor-blink inline-block h-3.5 w-2 bg-[var(--px-gold)] align-[-2px]" />
                </p>
              </div>
            </div>
          </div>
        </section>
        </div>
      </div>
    </header>
  );
}

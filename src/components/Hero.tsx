import Image from "next/image";
import { MAIL, PLAY, PixelSprite } from "./PixelSprite";

export default function Hero() {
  return (
    <>
      <header
        id="top"
        className="relative flex min-h-[100svh] flex-col px-6 pb-44 pt-24 sm:pb-40 sm:pt-32"
      >
        <div className="mx-auto w-full max-w-5xl">
          <div className="px-panel p-6 sm:p-10">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-[1fr_auto] sm:items-center sm:gap-12">
              {/* Right on desktop, first on mobile: portrait */}
              <div className="order-first flex items-end gap-5 sm:order-last sm:flex-col sm:items-center sm:gap-6">
                <div className="px-frame relative aspect-square w-24 shrink-0 sm:w-56">
                  <Image
                    src="/photo.jpeg"
                    alt="Elli"
                    fill
                    sizes="(min-width: 640px) 224px, 96px"
                    priority
                    className="object-cover"
                  />
                </div>
                <p className="px-nameplate">
                  ELLI
                  <span className="hidden sm:inline"> · 4TH-YEAR CS</span>
                </p>
              </div>

              {/* Identity + pitch */}
              <div>
                <p className="mb-5 text-base text-[var(--px-gold)] sm:text-lg">
                  Computer Science Student · Open to internships
                </p>
                <h1 className="px-title text-[clamp(1.6rem,5.4vw,3.2rem)]">Hi, I&apos;m Elli.</h1>
                <p className="mt-6 max-w-xl text-lg text-[var(--px-ink)] sm:text-xl">
                  I turn ideas into software through web development, machine learning, and a
                  curiosity for solving real-world problems.
                </p>
                <p className="mt-4 max-w-lg text-base text-[var(--px-muted)] sm:text-lg">
                  Elliah Rain Panopio — 4th-year CS student at National University Laguna, looking
                  for a software or frontend internship.
                </p>
                <div className="mt-9 flex flex-wrap gap-x-6 gap-y-5">
                  <a href="#work" className="px-btn">
                    <PixelSprite rows={PLAY} size={2} />
                    View my work
                  </a>
                  <a href="#contact" className="px-btn px-btn-ghost">
                    <PixelSprite rows={MAIL} size={2} />
                    Get in touch
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Supporting proof: live preview of the RDDPDS detection concept */}
      <section aria-label="Thesis preview" className="px-6 pb-8">
        <div className="px-panel mx-auto max-w-5xl p-6 sm:p-8">
          <p className="mb-6 text-sm text-[var(--px-muted)] sm:text-base">
            <span className="text-[var(--px-pink)]">SCANNING FOR DECEPTIVE PATTERNS</span> — a
            preview of how RDDPDS, my thesis project, flags manipulative UI in real time
          </p>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 sm:items-center">
            <div className="relative h-48">
              <div className="px-layer left-3 top-3" />
              <div className="px-layer left-9 top-9 !border-[#5a4fb5]" />
              <div className="px-layer stack-flag left-[3.75rem] top-[3.75rem] !bg-[#14103a] !border-[var(--px-pink)] p-2">
                <div className="mb-2 h-2 w-1/2 bg-[var(--px-edge-dim)]" />
                <div className="h-4 w-2/3 bg-[var(--px-pink)]" />
              </div>
              <span className="absolute left-3 top-[10.4rem] whitespace-nowrap text-sm text-[var(--px-muted)]">
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
    </>
  );
}

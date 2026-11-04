import Image from "next/image";
import { FiArrowRight, FiMail } from "react-icons/fi";

export default function Hero() {
  return (
    <header
      id="top"
      className="grid-texture flex min-h-screen flex-col justify-center border-b border-neutral-200 pt-16"
    >
      <div className="mx-auto max-w-5xl px-6">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-[1.3fr_0.7fr] sm:items-center">
          {/* Left: identity + pitch */}
          <div>
            <p className="mb-4 font-mono text-sm text-neutral-600">
              Computer Science Student · Open to internships
            </p>
            <h1 className="text-5xl font-semibold leading-tight text-black sm:text-6xl">
              Hi, I&apos;m Elli.
            </h1>
            <p className="mt-5 max-w-xl text-xl text-neutral-700">
              I turn ideas into software through web development, machine learning, and a
              curiosity for solving real-world problems.
            </p>
            <p className="mt-4 max-w-lg text-neutral-600">
              Elliah Rain Panopio — 4th-year CS student at National University Laguna, looking
              for a software or frontend internship.
            </p>
            <div className="mt-9 flex flex-wrap gap-4">
              <a
                href="#work"
                className="inline-flex items-center gap-2 rounded-md bg-black px-5 py-3 font-mono text-sm font-medium text-white"
              >
                View my work
                <FiArrowRight className="h-4 w-4" />
              </a>
              <a
                href="#contact"
                className="inline-flex items-center gap-2 rounded-md border border-neutral-300 px-5 py-3 font-mono text-sm text-black"
              >
                <FiMail className="h-4 w-4" />
                Get in touch
              </a>
            </div>
          </div>

          {/* Right: photo */}
          <div className="glass-panel relative aspect-square w-full max-w-[280px] justify-self-center overflow-hidden rounded-2xl sm:justify-self-end">
            <Image
              src="/photo.jpeg"
              alt="Elli"
              fill
              sizes="280px"
              priority
              className="object-cover"
            />
          </div>
        </div>

        {/* Supporting proof: live preview of the RDDPDS detection concept */}
        <div className="mt-16 rounded-xl border border-neutral-200 bg-white/70 p-6 sm:p-8">
          <p className="mb-5 font-mono text-xs text-neutral-600">
            SCANNING FOR DECEPTIVE PATTERNS — a preview of how RDDPDS, my thesis project,
            flags manipulative UI in real time
          </p>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 sm:items-center">
            <div className="relative h-44">
              <div className="absolute left-3 top-3 h-24 w-32 rounded-md border border-neutral-300" />
              <div className="absolute left-8 top-8 h-24 w-32 rounded-md border border-neutral-400" />
              <div className="stack-flag absolute left-14 top-14 h-24 w-32 rounded-md border border-dashed border-neutral-900 bg-white/90 p-2">
                <div className="mb-2 h-1.5 w-1/2 rounded bg-neutral-300" />
                <div className="h-3.5 w-2/3 rounded bg-neutral-900" />
              </div>
              <span className="absolute left-3 top-[164px] whitespace-nowrap font-mono text-[11px] text-neutral-600">
                layer 3 — flagged
              </span>
            </div>

            <div className="border-l border-neutral-200 pl-5 font-mono text-xs">
              <p className="log-line log-1 mb-1.5 text-neutral-500">
                10:41:05 scanning layer 1...
              </p>
              <p className="log-line log-2 mb-1.5 text-neutral-500">
                10:41:06 scanning layer 2...
              </p>
              <p className="log-line log-3 mb-1.5 text-neutral-500">
                10:41:07 scanning layer 3...
              </p>
              <p className="log-line log-4 mb-1.5 font-medium text-neutral-900">
                10:41:09 match — confirmshaming
              </p>
              <p className="log-line log-5 mb-1.5 text-neutral-700">
                10:41:09 CDS score: 0.94
              </p>
              <p className="log-line log-6 text-neutral-700">
                10:41:10 flag raised{" "}
                <span className="cursor-blink inline-block h-2.5 w-1.5 bg-neutral-900 align-[-1px]" />
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

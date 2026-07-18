import { FiArrowRight, FiMail } from "react-icons/fi";

export default function Hero() {
  return (
    <header
      id="top"
      className="grid-texture flex min-h-screen flex-col justify-center border-b border-neutral-800 pt-16"
    >
      <div className="mx-auto max-w-5xl px-6">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-[1.3fr_0.7fr] sm:items-center">
          {/* Left: identity + pitch */}
          <div>
            <p className="mb-4 font-mono text-sm text-neutral-500">
              Portfolio — Computer Science Student
            </p>
            <h1 className="text-5xl font-semibold leading-tight text-white sm:text-6xl">
              Hi, I&apos;m Elli.
            </h1>
            <p className="mt-5 max-w-xl text-xl text-neutral-300">
              I turn ideas into software through web development, 
              machine learning, and a curiosity for solving real-world problems.
            </p>
            <p className="mt-4 max-w-lg text-neutral-500">
              I'm a Computer Science student passionate about building software that 
              solves real-world problems. I enjoy developing full-stack web applications, 
              experimenting with machine learning and computer vision, and continuously 
              improving my skills through personal and academic projects. I'm always looking 
              for opportunities to learn new technologies and create applications that are both 
              practical and user-friendly.
            </p>
            <div className="mt-9 flex flex-wrap gap-4">
              <a
                href="#work"
                className="inline-flex items-center gap-2 rounded-md bg-white px-5 py-3 font-mono text-sm font-medium text-black"
              >
                View my work
                <FiArrowRight className="h-4 w-4" />
              </a>
              <a
                href="#contact"
                className="inline-flex items-center gap-2 rounded-md border border-neutral-700 px-5 py-3 font-mono text-sm text-white"
              >
                <FiMail className="h-4 w-4" />
                Get in touch
              </a>
            </div>
          </div>

          {/* Right: photo slot */}
          <div className="glass-panel flex aspect-square w-full max-w-[280px] items-center justify-center justify-self-center rounded-2xl sm:justify-self-end">
            {/*
              Replace this block with a real <img> or Next.js <Image> tag once
              you have a photo, e.g.:
              <img src="/your-photo.jpg" alt="Elli" className="h-full w-full rounded-2xl object-cover" />
            */}
            <div className="glass-panel flex aspect-square w-full max-w-[280px] items-center justify-center justify-self-center overflow-hidden rounded-2xl sm:justify-self-end">
              <img
                src="/photo.jpeg"
                alt="Elli"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Supporting proof: live preview of the RDDPDS detection concept */}
        <div className="mt-16 rounded-xl border border-neutral-800 bg-black/40 p-6 sm:p-8">
          <p className="mb-5 font-mono text-xs text-neutral-500">
            SCANNING FOR DECEPTIVE PATTERNS — a preview of how RDDPDS, my
            thesis project, flags manipulative UI in real time
          </p>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 sm:items-center">
            <div className="relative h-44">
              <div className="absolute left-3 top-3 h-24 w-32 rounded-md border border-neutral-700" />
              <div className="absolute left-8 top-8 h-24 w-32 rounded-md border border-neutral-500" />
              <div className="stack-flag absolute left-14 top-14 h-24 w-32 rounded-md border border-dashed border-neutral-100 bg-black/80 p-2">
                <div className="mb-2 h-1.5 w-1/2 rounded bg-neutral-700" />
                <div className="h-3.5 w-2/3 rounded bg-neutral-100" />
              </div>
              <span className="absolute left-3 top-[164px] whitespace-nowrap font-mono text-[11px] text-neutral-500">
                layer 3 — flagged
              </span>
            </div>

            <div className="border-l border-neutral-800 pl-5 font-mono text-xs">
              <p className="log-line log-1 mb-1.5 text-neutral-600">
                10:41:05 scanning layer 1...
              </p>
              <p className="log-line log-2 mb-1.5 text-neutral-600">
                10:41:06 scanning layer 2...
              </p>
              <p className="log-line log-3 mb-1.5 text-neutral-600">
                10:41:07 scanning layer 3...
              </p>
              <p className="log-line log-4 mb-1.5 font-medium text-neutral-100">
                10:41:09 match — confirmshaming
              </p>
              <p className="log-line log-5 mb-1.5 text-neutral-400">
                10:41:09 CDS score: 0.94
              </p>
              <p className="log-line log-6 text-neutral-400">
                10:41:10 flag raised{" "}
                <span className="cursor-blink inline-block h-2.5 w-1.5 bg-neutral-100 align-[-1px]" />
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

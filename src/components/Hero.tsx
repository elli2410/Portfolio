export default function Hero() {
  return (
    <header
      id="top"
      className="flex min-h-screen flex-col justify-center border-b border-neutral-800 pt-16"
    >
      <div className="mx-auto max-w-3xl px-6">
        <p className="mb-6 font-mono text-sm text-teal-400">
          SCANNING FOR DECEPTIVE PATTERNS — STATUS: ACTIVE
        </p>
        <h1 className="max-w-2xl text-5xl font-semibold leading-tight sm:text-6xl">
          Building systems that <span className="text-amber-400">catch what shouldn&apos;t</span> be there.
        </h1>
        <p className="mt-6 max-w-lg text-lg text-neutral-400">
          Hi, I&apos;m Elli — a Computer Science student building real-time detection
          systems, ML pipelines, and interfaces that people actually trust.
        </p>
        <div className="mt-9 flex flex-wrap gap-4">
          <a
            href="#work"
            className="rounded-md bg-amber-400 px-5 py-3 font-mono text-sm font-medium text-black"
          >
            View my work
          </a>
          <a
            href="#contact"
            className="rounded-md border border-neutral-700 px-5 py-3 font-mono text-sm text-white"
          >
            Get in touch
          </a>
        </div>
      </div>
    </header>
  );
}

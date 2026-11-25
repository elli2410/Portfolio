const EMAIL = "elliahpanopio27@gmail.com";

export default function Contact() {
  return (
    <section id="contact" className="py-24">
      <div className="mx-auto max-w-3xl px-6">
        <p className="mb-2 font-mono text-sm text-neutral-900">04 / CONTACT</p>
        <h2 className="mb-4 text-3xl font-semibold">Let&apos;s talk</h2>
        <p className="mb-8 max-w-xl text-neutral-600">
          I&apos;m looking for a software or frontend internship. If you think I&apos;d be a
          good fit, I&apos;d love to hear from you.
        </p>
        <div className="flex flex-wrap gap-4">
          <a
            href={`mailto:${EMAIL}`}
            className="rounded-md bg-black px-5 py-3 font-mono text-sm font-medium text-white transition motion-safe:hover:-translate-y-0.5 hover:bg-neutral-700 hover:shadow-lg"
          >
            Email me
          </a>
          <a
            href="https://drive.google.com/file/d/1gno3XVqbv3FEp7sxsRNCpn3mCdqeAPFV/view?usp=drive_link"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md border border-neutral-300 px-5 py-3 font-mono text-sm text-black transition motion-safe:hover:-translate-y-0.5 hover:border-black hover:bg-black hover:text-white hover:shadow-lg"
          >
            Resume
          </a>
          <a
            href="https://github.com/elli2410"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md border border-neutral-300 px-5 py-3 font-mono text-sm text-black transition motion-safe:hover:-translate-y-0.5 hover:border-black hover:bg-black hover:text-white hover:shadow-lg"
          >
            GitHub
          </a>
          <a
            href="https://www.linkedin.com/in/elliah-rain-s-panopio-b6a839328"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md border border-neutral-300 px-5 py-3 font-mono text-sm text-black transition motion-safe:hover:-translate-y-0.5 hover:border-black hover:bg-black hover:text-white hover:shadow-lg"
          >
            LinkedIn
          </a>
        </div>
        <p className="mt-6 font-mono text-xs text-neutral-500">{EMAIL}</p>
      </div>
    </section>
  );
}

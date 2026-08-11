export default function Contact() {
  return (
    <section id="contact" className="py-24">
      <div className="mx-auto max-w-3xl px-6">
        <p className="mb-2 font-mono text-sm text-neutral-100">04 / CONTACT</p>
        <h2 className="mb-8 text-3xl font-semibold">Let&apos;s talk</h2>
        <div className="flex flex-wrap gap-4">
          <a
            href="elliahrnpnp@gmail.com"
            className="rounded-md bg-white px-5 py-3 font-mono text-sm font-medium text-black"
          >
            Email me
          </a>
          <a
            href="#"
            className="rounded-md border border-neutral-700 px-5 py-3 font-mono text-sm text-white"
          >
            GitHub
          </a>
          <a
            href="#"
            className="rounded-md border border-neutral-700 px-5 py-3 font-mono text-sm text-white"
          >
            LinkedIn
          </a>
        </div>
      </div>
    </section>
  );
}

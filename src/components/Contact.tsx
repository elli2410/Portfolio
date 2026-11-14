const EMAIL = "elliahpanopio27@gmail.com";

const links = [
  { label: "Resume", href: "/resume.pdf" },
  { label: "GitHub", href: "https://github.com/elli2410" },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/elliah-rain-s-panopio-b6a839328",
  },
];

export default function Contact() {
  return (
    <section id="contact" className="px-6 pb-44 pt-24 sm:pb-52">
      <div className="mx-auto max-w-3xl">
        <div className="px-plate mb-14">
          <p className="px-eyebrow mb-3">04 / CONTACT</p>
          <h2 className="px-title text-[clamp(1.1rem,3.4vw,1.75rem)]">Let&apos;s talk</h2>
        </div>

        <div className="px-panel p-6 sm:p-10">
          <p className="mb-9 max-w-xl text-lg text-[var(--px-ink)] sm:text-xl">
            I&apos;m looking for a software or frontend internship. If you think I&apos;d be a
            good fit, I&apos;d love to hear from you.
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-5">
            <a href={`mailto:${EMAIL}`} className="px-btn">
              Email me
            </a>
            {links.map((l) => (
              <a
                key={l.label}
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                className="px-btn px-btn-ghost"
              >
                {l.label}
              </a>
            ))}
          </div>
          <p className="mt-8 text-base text-[var(--px-muted)]">{EMAIL}</p>
        </div>
      </div>
    </section>
  );
}

const EMAIL = "elliahpanopio27@gmail.com";

const links = [
  { label: "Resume", href: "/resume.pdf", tone: "cyan" },
  { label: "GitHub", href: "https://github.com/elli2410", tone: "amber" },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/elliah-rain-s-panopio-b6a839328",
    tone: "green",
  },
];

/**
 * A wall kiosk at street level, next to the ramen stall: a lit header, a small
 * screen with the message, and a console of arcade buttons.
 */
export default function Contact() {
  return (
    <section id="contact" className="ks-section">
      <div className="ks">
        <span className="ks-bolt ks-bolt-tl" aria-hidden="true" />
        <span className="ks-bolt ks-bolt-tr" aria-hidden="true" />
        <span className="ks-conduit" aria-hidden="true" />

        <div className="ks-head">
          <p className="ks-eyebrow">04 / CONTACT</p>
          <h2 className="ks-title">Let&apos;s talk</h2>
        </div>

        <div className="ks-screen">
          <p className="ks-msg">
            I&apos;m looking for a software or frontend internship. If you think I&apos;d be a good
            fit, I&apos;d love to hear from you.
          </p>
          <p className="ks-mail">
            &gt; {EMAIL}
            <span className="cursor-blink ks-caret" aria-hidden="true" />
          </p>
        </div>

        <div className="ks-console">
          <a href={`mailto:${EMAIL}`} className="ks-key ks-pink">
            <span className="ks-cap" aria-hidden="true" />
            <span className="ks-label">Email me</span>
          </a>
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`ks-key ks-${l.tone}`}
            >
              <span className="ks-cap" aria-hidden="true" />
              <span className="ks-label">{l.label}</span>
            </a>
          ))}
        </div>
        <div className="ks-grille" aria-hidden="true" />
      </div>
    </section>
  );
}

"use client";

import Image from "next/image";
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import {
  SiAndroidstudio,
  SiGit,
  SiGithub,
  SiFigma,
  SiJavascript,
  SiLinux,
  SiMysql,
  SiNodedotjs,
  SiPhp,
  SiPostgresql,
  SiPython,
  SiReact,
  SiTailwindcss,
  SiTypescript,
} from "react-icons/si";
import { FaJava } from "react-icons/fa6";
import { projects } from "@/data/projects";

export type PanelId = "hero" | "about" | "skills" | "projects" | "contact";

type PanelState = { id: PanelId; ox: number; oy: number; delay: number } | null;

const EMAIL = "elliahpanopio27@gmail.com";
const LINKS = [
  { label: "Resume", href: "/resume.pdf" },
  { label: "GitHub", href: "https://github.com/elli2410" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/elliah-rain-s-panopio-b6a839328" },
];

const SKILLS = [
  { icon: SiReact, label: "React", color: "#61DAFB" },
  { icon: SiTypescript, label: "TypeScript", color: "#5B9CF0" },
  { icon: SiJavascript, label: "JavaScript", color: "#F7DF1E" },
  { icon: SiNodedotjs, label: "Node.js", color: "#8CC84B" },
  { icon: SiTailwindcss, label: "Tailwind", color: "#38BDF8" },
  { icon: SiPython, label: "Python", color: "#5AA9E6" },
  { icon: FaJava, label: "Java", color: "#F89820" },
  { icon: SiPhp, label: "PHP", color: "#9AA5E0" },
  { icon: SiMysql, label: "MySQL", color: "#4F9BD1" },
  { icon: SiPostgresql, label: "PostgreSQL", color: "#6F9FD8" },
  { icon: SiAndroidstudio, label: "Android Studio", color: "#3DDC84" },
  { icon: SiLinux, label: "Linux", color: "#FCC624" },
  { icon: SiGit, label: "Git", color: "#F5694E" },
  { icon: SiGithub, label: "GitHub", color: "#F0F0F0" },
  { icon: SiFigma, label: "Figma", color: "#FF7262" },
];

const TITLES: Record<PanelId, string> = {
  hero: "Introduction",
  about: "About me",
  skills: "My skills and tools",
  projects: "My projects",
  contact: "Contact",
};

/* --------------------------------------------------------------- shell */

function Shell({
  panel,
  onClose,
  children,
}: {
  panel: NonNullable<PanelState>;
  onClose: () => void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.focus();
  }, []);
  // the panel grows out of the prop that was clicked
  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.transformOrigin = `${panel.ox - r.left}px ${panel.oy - r.top}px`;
  }, [panel.ox, panel.oy]);
  const style: CSSProperties = {};
  return (
    <div className={`pn-backdrop pn-bd-${panel.id}`} onClick={onClose} role="presentation">
      <div
        ref={box}
        className={`pn pn-${panel.id}`}
        role="dialog"
        aria-modal="true"
        aria-label={TITLES[panel.id]}
        style={style}
        onClick={(e) => e.stopPropagation()}
      >
        <button ref={ref} type="button" className="pn-close" onClick={onClose} aria-label="Close">
          <svg viewBox="0 0 7 7" shapeRendering="crispEdges" aria-hidden="true">
            <path d="M0 0h2v1h1v1h1V1h1V0h2v2H6v1H5v1h1v1h1v2H5V6H4V5H3v1H2v1H0V5h1V4h1V3H1V2H0z" fill="currentColor" />
          </svg>
        </button>
        {children}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- panels */

function Hero({ onOpen, onGo }: { onOpen: (id: PanelId) => void; onGo: (p: number) => void }) {
  return (
    <div className="pn-hero-grid">
      <div className="pn-copy">
        <p className="pn-kicker">&gt; Computer Science Student · Open to internships</p>
        <h2 className="pn-title">Hi, I&apos;m Elli.</h2>
        <p className="pn-lead">
          I turn ideas into software through web development, machine learning, and a curiosity for
          solving real-world problems.
        </p>
        <p className="pn-sub">
          Elliah Rain Panopio — 4th-year CS student at National University Laguna, looking for a
          software or frontend internship.
        </p>
        <div className="pn-ctas">
          <button
            type="button"
            className="pn-cta"
            onClick={() => {
              onGo(1);
              onOpen("projects");
            }}
          >
            View my work
          </button>
          <button
            type="button"
            className="pn-cta pn-cta-alt"
            onClick={() => {
              onGo(1);
              onOpen("contact");
            }}
          >
            Get in touch
          </button>
        </div>
      </div>
      <figure className="pn-portrait">
        <div className="pn-photo">
          <Image src="/photo.jpeg" alt="Elli" fill sizes="220px" className="object-cover" priority />
        </div>
        <figcaption>ELLI · 4TH-YEAR CS</figcaption>
      </figure>
    </div>
  );
}

function About() {
  return (
    <div className="pn-about-grid">
      <figure className="pn-portrait pn-portrait-sm">
        <div className="pn-photo">
          <Image src="/photo.jpeg" alt="Elli" fill sizes="160px" className="object-cover" priority />
        </div>
      </figure>
      <div className="pn-copy">
        <p className="pn-kicker">03 / ABOUT</p>
        <h2 className="pn-title">A bit about me</h2>
        <div className="pn-text">
          <p>
            I originally chose Computer Science because I was curious about how software is built,
            not just how to use it. What started as an interest in computers and gaming quickly grew
            into a desire to understand what happens behind the scenes and create things from
            scratch.
          </p>
          <p>
            I enjoy the process of turning an idea into a working application. Whether it&apos;s a web
            app, an Android project, or experimenting with machine learning, seeing the final product
            come together is what keeps me motivated to learn.
          </p>
          <p>
            Outside of school, you&apos;ll usually find me building small side projects, reading about
            new technologies, or gaming. In team projects, I&apos;m often the quiet one who enjoys
            debugging problems and making sure everything works as expected.
          </p>
        </div>
      </div>
    </div>
  );
}

function Vending() {
  const [pick, setPick] = useState<number | null>(null);
  const [drop, setDrop] = useState(0);
  const code = (i: number) => `${String.fromCharCode(65 + Math.floor(i / 5))}${(i % 5) + 1}`;
  const chosen = pick === null ? null : SKILLS[pick];
  return (
    <div className="vm">
      <div className="vm-sign">
        <span className="vm-eyebrow">02 / TOOLKIT</span>
        <h2 className="vm-title">Skills</h2>
        <span className="vm-open">VEND-O-MAT · 24H</span>
      </div>
      <div className="vm-body">
        <div className="vm-glass">
          <ul className="vm-grid">
            {SKILLS.map(({ icon: Icon, label, color }, i) => (
              <li key={label}>
                <button
                  type="button"
                  className={`vm-slot ${pick === i ? "is-picked" : ""}`}
                  onClick={() => {
                    setPick(i);
                    setDrop((n) => n + 1);
                  }}
                  aria-label={`${label}, slot ${code(i)}`}
                >
                  <span className="vm-code">{code(i)}</span>
                  <Icon className="vm-icon" style={{ color }} aria-hidden="true" />
                  <span className="vm-label">{label}</span>
                  <span className="vm-coil" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        </div>
        <aside className="vm-side">
          <div className="vm-display" aria-live="polite">
            <span>{chosen ? "DISPENSING" : "SELECT"}</span>
            <b>{pick === null ? "--" : code(pick)}</b>
            <small>{chosen ? chosen.label : "tap a slot"}</small>
          </div>
          <div className="vm-keys" aria-hidden="true">
            {["1", "2", "3", "4", "5", "A", "B", "C", "OK"].map((k) => (
              <i key={k}>{k}</i>
            ))}
          </div>
          <div className="vm-coin" aria-hidden="true">
            <span />
            <small>INSERT COIN</small>
          </div>
        </aside>
      </div>
      <div className="vm-flap">
        <span>PUSH · TAKE SKILL</span>
        {chosen && (
          <span key={drop} className="vm-dropped" style={{ color: chosen.color }} aria-hidden="true">
            <chosen.icon />
          </span>
        )}
      </div>
    </div>
  );
}

function Pc() {
  const [i, setI] = useState(0);
  const p = projects[i];
  const [clock, setClock] = useState("");
  useEffect(() => {
    const f = () =>
      setClock(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false }));
    f();
    const id = window.setInterval(f, 15000);
    return () => window.clearInterval(id);
  }, []);
  return (
    <div className="os">
      <div className="os-bar">
        <span className="os-logo">ELLI-OS</span>
        <span className="os-path">C:\\PROJECTS\\</span>
        <span className="os-clock">{clock}</span>
      </div>
      <div className="os-body">
        <ul className="os-files" aria-label="Project files">
          {projects.map((pr, k) => (
            <li key={pr.title}>
              <button
                type="button"
                className={`os-file ${k === i ? "is-on" : ""}`}
                onClick={() => setI(k)}
                aria-pressed={k === i}
              >
                <svg viewBox="0 0 9 10" shapeRendering="crispEdges" aria-hidden="true">
                  <path d="M0 0h6l3 3v7H0z" fill="currentColor" />
                  <path d="M6 0v3h3" fill="#05061c" opacity=".5" />
                </svg>
                <span>{pr.title.split(" — ")[0].split(" – ")[0]}</span>
              </button>
            </li>
          ))}
        </ul>
        <article className="os-win">
          <div className="os-win-bar">
            <span>{p.title.split(" — ")[0]}.exe</span>
            <i aria-hidden="true" />
          </div>
          <div className="os-win-body">
            <p className="os-tag">{p.tag}</p>
            <h2 className="os-title">{p.title}</h2>
            <p className="os-desc">{p.description}</p>
            <ul className="os-stack" aria-label="Tech stack">
              {p.stack.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
            <div className="os-links">
              {p.repoUrl && (
                <a href={p.repoUrl} target="_blank" rel="noopener noreferrer" className="pn-cta">
                  View repo
                </a>
              )}
              {p.caseStudyUrl && (
                <a href={p.caseStudyUrl} target="_blank" rel="noopener noreferrer" className="pn-cta pn-cta-alt">
                  Case study
                </a>
              )}
              {p.repoNote && <span className="os-note">{p.repoNote}</span>}
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}

function Radio() {
  return (
    <div className="rd">
      <span className="rd-antenna" aria-hidden="true" />
      <span className="rd-knob" aria-hidden="true" />
      <div className="rd-body">
        <div className="rd-top" aria-hidden="true">
          <span className="rd-led" />
          <span className="rd-speaker" />
        </div>
        <div className="rd-lcd">
          <p className="rd-head">04 / CONTACT · CH-07</p>
          <p className="rd-msg">
            I&apos;m looking for a software or frontend internship. If you think I&apos;d be a good fit, I&apos;d love to hear from you.
          </p>
          <ul className="rd-menu">
            <li>
              <a href={`mailto:${EMAIL}`}>
                <span aria-hidden="true">&gt;</span> {EMAIL}
              </a>
            </li>
            {LINKS.map((l) => (
              <li key={l.label}>
                <a
                  href={l.href}
                  target={l.href.startsWith("http") ? "_blank" : undefined}
                  rel={l.href.startsWith("http") ? "noopener noreferrer" : undefined}
                >
                  <span aria-hidden="true">&gt;</span> {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className="rd-pad" aria-hidden="true">
          <span className="rd-dpad" />
          <span className="rd-keys">
            {Array.from({ length: 12 }, (_, i) => (
              <i key={i} />
            ))}
          </span>
          <span className="rd-timer">88:88</span>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- export */

export default function Panels({
  panel,
  onClose,
  onOpen,
  onGo,
}: {
  panel: PanelState;
  onClose: () => void;
  onOpen: (id: PanelId) => void;
  onGo: (p: number) => void;
}) {
  const id = panel?.id ?? null;

  // Escape closes; the page behind stops scrolling while a panel is open.
  useEffect(() => {
    if (!id) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const html = document.documentElement;
    const timer = window.setTimeout(() => {
      html.style.overflow = "hidden";
    }, panel?.delay ?? 0);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.clearTimeout(timer);
      html.style.overflow = "";
    };
  }, [id, onClose, panel?.delay]);

  if (!panel) return null;
  return (
    <Shell key={panel.id} panel={panel} onClose={onClose}>
      {panel.id === "hero" && <Hero onOpen={onOpen} onGo={onGo} />}
      {panel.id === "about" && <About />}
      {panel.id === "skills" && <Vending />}
      {panel.id === "projects" && <Pc />}
      {panel.id === "contact" && <Radio />}
    </Shell>
  );
}

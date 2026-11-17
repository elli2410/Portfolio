"use client";

type Target = "home" | "about" | "projects" | "contact";

const ITEMS: { id: Target; label: string; icon?: boolean }[] = [
  { id: "home", label: "Home", icon: true },
  { id: "about", label: "About" },
  { id: "projects", label: "Projects" },
  { id: "contact", label: "Contact" },
];

/** A star glyph, drawn on a 9x9 pixel grid. */
function Star() {
  return (
    <svg className="nav-star" viewBox="0 0 9 9" shapeRendering="crispEdges" aria-hidden="true">
      <path d="M4 0h1v3h1v1h3v1H6v1H5v3H4V6H3V5H0V4h3V3h1z" fill="#c9b4ff" />
      <path d="M4 3h1v1h1v1H5v1H4V5H3V4h1z" fill="#ffffff" />
    </svg>
  );
}

function House() {
  return (
    <svg className="nav-house" viewBox="0 0 9 8" shapeRendering="crispEdges" aria-hidden="true">
      <path d="M4 0h1v1h1v1h1v1h1v1H7v4H5V6H4v2H2V4H1V3h1V2h1V1h1z" fill="currentColor" />
    </svg>
  );
}

export default function Nav({
  section,
  onNav,
}: {
  section: "home" | "projects" | "contact";
  onNav: (t: Target) => void;
}) {
  return (
    <header className="nav">
      <button type="button" className="nav-brand" onClick={() => onNav("home")} aria-label="Elli dev, back to the top">
        <Star />
        <span>ELLI·DEV</span>
        <i aria-hidden="true" />
      </button>
      <nav aria-label="Main">
        <ul>
          {ITEMS.map((it) => {
            const active = it.id === section || (it.id === "home" && section === "home");
            return (
              <li key={it.id}>
                <button
                  type="button"
                  className={`nav-btn ${active && it.id !== "about" ? "is-active" : ""}`}
                  aria-current={active && it.id !== "about" ? "page" : undefined}
                  onClick={() => onNav(it.id)}
                >
                  {it.icon && <House />}
                  {it.label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}

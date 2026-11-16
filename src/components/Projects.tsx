import { projects } from "@/data/projects";
import { ARROW, PixelSprite } from "./PixelSprite";

// Each ad screen has its own colour of light.
const TINTS = ["#ff3fd0", "#38f0ff", "#ff2a4a", "#ffb02e"];

/**
 * Four commercial LED screens bolted onto the walls of two buildings. Each
 * lives on its own facade slab (corrugated metal, a cornice, a pipe, an AC
 * unit), so nothing floats: it is all hardware hanging off the architecture.
 */
export default function Projects() {
  return (
    <section id="work" className="fx-section">
      <div className="fx-sign">
        <p className="fx-sign-eyebrow">01 / FEATURED WORK</p>
        <h2 className="fx-sign-title">Projects &amp; Works</h2>
      </div>

      <div className="fx-street">
        {projects.map((project, i) => {
          const tint = TINTS[i % TINTS.length];
          return (
            <article
              key={project.title}
              className={`fx-slab ${i % 2 === 0 ? "fx-left" : "fx-right"}`}
              style={{ ["--ad" as string]: tint }}
            >
              <span className="fx-cornice" aria-hidden="true" />
              <span className="fx-pipe" aria-hidden="true" />
              <span className="fx-cable" aria-hidden="true" />
              <span className="fx-ac" aria-hidden="true" />

              {/* brackets that hold the screen off the wall, and the lamp that lights it */}
              <span className="fx-arm fx-arm-l" aria-hidden="true" />
              <span className="fx-arm fx-arm-r" aria-hidden="true" />
              <span className="fx-lamp" aria-hidden="true" />

              <div className="fx-screen">
                <div className="fx-bar">
                  <span>AD-{String(i + 1).padStart(2, "0")}</span>
                  <span className="fx-live">ON AIR</span>
                </div>
                <div className="fx-body">
                  <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                    <h3 className="fx-title">{project.title}</h3>
                    <span className="px-tag">{project.tag}</span>
                  </div>
                  <p className="fx-desc">{project.description}</p>
                  <div className="mb-6 flex flex-wrap gap-x-3 gap-y-3">
                    {project.stack.map((item) => (
                      <span key={item} className="px-chip">
                        {item}
                      </span>
                    ))}
                  </div>
                  {project.repoUrl ? (
                    <a
                      href={project.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${project.title} — view repository`}
                      className="fx-cta"
                    >
                      Repo
                      <PixelSprite rows={ARROW} size={2} />
                    </a>
                  ) : (
                    project.repoNote && <span className="fx-note">{project.repoNote}</span>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

import { projects } from "@/data/projects";
import { ARROW, PixelSprite } from "./PixelSprite";

export default function Projects() {
  return (
    <section id="work" className="px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="px-plate mb-14">
          <p className="px-eyebrow mb-3">01 / FEATURED WORK</p>
          <h2 className="px-title text-[clamp(1.1rem,3.2vw,1.7rem)]">Projects &amp; Works</h2>
        </div>

        <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
          {projects.map((project, i) => (
            <div
              key={project.title}
              className="px-panel px-card px-screen flex flex-col justify-between overflow-hidden p-6 sm:p-8"
            >
              <div>
                <div className="px-screen-bar">
                  <span>AD-{String(i + 1).padStart(2, "0")}</span>
                  <span className="px-live">ON AIR</span>
                </div>
                <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
                  <h3 className="text-2xl leading-tight text-[var(--px-ink)] sm:text-[1.8rem]">
                    {project.title}
                  </h3>
                  <span className="px-tag">{project.tag}</span>
                </div>
                <p className="mb-6 text-xl text-[var(--px-muted)] sm:text-2xl">
                  {project.description}
                </p>
                <div className="mb-7 flex flex-wrap gap-x-3 gap-y-3">
                  {project.stack.map((item) => (
                    <span key={item} className="px-chip">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                {project.repoUrl ? (
                  <a
                    href={project.repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${project.title} — view repository`}
                    className="px-btn px-btn-sm px-btn-ghost"
                  >
                    Repo
                    <PixelSprite rows={ARROW} size={2} />
                  </a>
                ) : (
                  project.repoNote && (
                    <span className="inline-block text-xl text-[var(--px-muted)] opacity-80">
                      {project.repoNote}
                    </span>
                  )
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

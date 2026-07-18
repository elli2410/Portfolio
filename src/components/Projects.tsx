import { projects } from "@/data/projects";

const bentoSlots = ["bento-a", "bento-b", "bento-c", "bento-d", "bento-e", "bento-f"];

export default function Projects() {
  const emptyCount = 6 - projects.length;

  return (
    <section id="work" className="border-b border-neutral-800 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <p className="mb-2 font-mono text-sm text-neutral-100">01 / FEATURED WORK</p>
        <h2 className="mb-14 text-3xl font-semibold">Projects</h2>

        <div className="bento-grid">
          {projects.map((project, i) => (
            <div
              key={project.title}
              className={`glass-panel ${bentoSlots[i]} flex flex-col justify-between rounded-xl p-6 sm:p-7`}
            >
              <div>
                <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                  <h3 className="text-lg font-semibold sm:text-xl">{project.title}</h3>
                  <span className="whitespace-nowrap rounded-full border border-neutral-400 px-3 py-1 font-mono text-xs text-neutral-400">
                    {project.tag}
                  </span>
                </div>
                <p className="mb-5 text-sm text-neutral-400 sm:text-base">
                  {project.description}
                </p>
                <div className="mb-5 flex flex-wrap gap-2">
                  {project.stack.map((item, index) => (
                    <span
                      key={`${item}-${index}`}
                      className="rounded bg-white/5 px-2.5 py-1 font-mono text-xs text-neutral-400"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex gap-5 text-sm">
                {project.caseStudyUrl && (
                  <a href={project.caseStudyUrl} className="text-neutral-100">
                    Case study →
                  </a>
                )}
                {project.repoUrl && (
                  <a href={project.repoUrl} className="text-neutral-100">
                    Repo →
                  </a>
                )}
              </div>
            </div>
          ))}

          {Array.from({ length: emptyCount }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className={`glass-panel-empty ${bentoSlots[projects.length + i]} flex flex-col items-center justify-center rounded-xl p-6 text-center`}
            >
              <p className="font-mono text-xs text-neutral-600">SLOT {projects.length + i + 1}</p>
              <p className="mt-2 text-sm text-neutral-600">More work in progress</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

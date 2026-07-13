import { projects } from "@/data/projects";

export default function Projects() {
  return (
    <section id="work" className="border-b border-neutral-800 py-24">
      <div className="mx-auto max-w-3xl px-6">
        <p className="mb-2 font-mono text-sm text-amber-400">01 / FEATURED WORK</p>
        <h2 className="mb-14 text-3xl font-semibold">Projects</h2>

        <div className="flex flex-col gap-6">
          {projects.map((project) => (
            <div
              key={project.title}
              className="rounded-lg border border-neutral-800 bg-neutral-900 p-8"
            >
              <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                <h3 className="text-xl font-semibold">{project.title}</h3>
                <span className="whitespace-nowrap rounded-full border border-teal-400 px-3 py-1 font-mono text-xs text-teal-400">
                  {project.tag}
                </span>
              </div>
              <p className="mb-5 max-w-xl text-neutral-400">{project.description}</p>
              <div className="mb-5 flex flex-wrap gap-2">
                {project.stack.map((item, index) => (
                  <span
                    key={`${item}-${index}`}
                    className="rounded bg-neutral-800 px-2.5 py-1 font-mono text-xs text-neutral-400"
                  >
                    {item}
                  </span>
                ))}
              </div>
              <div className="flex gap-5 text-sm">
                {project.caseStudyUrl && (
                  <a href={project.caseStudyUrl} className="text-amber-400">
                    Case study →
                  </a>
                )}
                {project.repoUrl && (
                  <a href={project.repoUrl} className="text-amber-400">
                    Repo →
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

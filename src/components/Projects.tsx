import { projects } from "@/data/projects";

export default function Projects() {
  return (
    <section id="work" className="border-b border-neutral-200 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <p className="mb-2 font-mono text-sm text-neutral-900">01 / FEATURED WORK</p>
        <h2 className="mb-14 text-3xl font-semibold">Projects & Works</h2>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {projects.map((project) => (
            <div
              key={project.title}
              className="glass-panel flex flex-col justify-between rounded-xl p-6 sm:p-7"
            >
              <div>
                <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                  <h3 className="text-lg font-semibold sm:text-xl">{project.title}</h3>
                  <span className="whitespace-nowrap rounded-full border border-neutral-500 px-3 py-1 font-mono text-xs text-neutral-600">
                    {project.tag}
                  </span>
                </div>
                <p className="mb-5 text-sm text-neutral-600 sm:text-base">
                  {project.description}
                </p>
                <div className="mb-5 flex flex-wrap gap-2">
                  {project.stack.map((item) => (
                    <span
                      key={item}
                      className="rounded bg-black/5 px-2.5 py-1 font-mono text-xs text-neutral-700"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex gap-5 text-sm">
                {project.repoUrl ? (
                  <a
                    href={project.repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-neutral-900 underline-offset-4 hover:underline"
                  >
                    Repo →
                  </a>
                ) : (
                  project.repoNote && (
                    <span className="font-mono text-xs text-neutral-500">
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

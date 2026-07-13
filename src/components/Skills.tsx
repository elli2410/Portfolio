const skillGroups = [
  { title: "Languages", items: ["Python", "TypeScript / JavaScript", "Java / Kotlin"] },
  { title: "ML / CV", items: ["YOLO / Object Detection", "Logistic Regression", "MediaPipe"] },
  { title: "Frontend", items: ["React", "Tailwind CSS", "shadcn/ui"] },
  { title: "Other", items: ["Android Studio", "Git / GitHub", "Security-conscious dev"] },
];

export default function Skills() {
  return (
    <section id="skills" className="border-b border-neutral-800 py-24">
      <div className="mx-auto max-w-3xl px-6">
        <p className="mb-2 font-mono text-sm text-amber-400">02 / TOOLKIT</p>
        <h2 className="mb-14 text-3xl font-semibold">Skills</h2>

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {skillGroups.map((group) => (
            <div key={group.title}>
              <h4 className="mb-3 font-mono text-xs uppercase tracking-wide text-teal-400">
                {group.title}
              </h4>
              <ul className="space-y-1 text-sm text-neutral-400">
                {group.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

import {
  SiPython,
  SiTypescript,
  SiJavascript,
  SiReact,
  SiMongodb,
  SiExpress,
  SiNodedotjs,
  SiTailwindcss,
  SiKotlin,
  SiGit,
  SiGithub,
  SiAndroidstudio,
} from "react-icons/si";

const skillGroups = [
  { title: "Languages", items: ["Python", "TypeScript / JavaScript", "Java / Kotlin"] },
  { title: "ML / CV", items: ["YOLO / Object Detection", "Logistic Regression", "MediaPipe"] },
  { title: "Frontend", items: ["React", "Tailwind CSS", "shadcn/ui"] },
  { title: "Other", items: ["Android Studio", "Git / GitHub", "Security-conscious dev"] },
];

const iconStack = [
  { icon: SiPython, label: "Python", color: "#3776AB" },
  { icon: SiTypescript, label: "TypeScript", color: "#3178C6" },
  { icon: SiJavascript, label: "JavaScript", color: "#F7DF1E" },
  { icon: SiReact, label: "React", color: "#61DAFB" },
  { icon: SiNodedotjs, label: "Node.js", color: "#339933" },
  { icon: SiExpress, label: "Express", color: "#F5F5F5" },
  { icon: SiMongodb, label: "MongoDB", color: "#47A248" },
  { icon: SiTailwindcss, label: "Tailwind", color: "#06B6D4" },
  { icon: SiKotlin, label: "Kotlin", color: "#7F52FF" },
  { icon: SiAndroidstudio, label: "Android Studio", color: "#3DDC84" },
  { icon: SiGit, label: "Git", color: "#F05032" },
  { icon: SiGithub, label: "GitHub", color: "#F5F5F5" },
];

export default function Skills() {
  return (
    <section id="skills" className="border-b border-neutral-800 py-24">
      <div className="mx-auto max-w-5xl px-6">
        <p className="mb-2 font-mono text-sm text-neutral-100">02 / TOOLKIT</p>
        <h2 className="mb-14 text-3xl font-semibold">Skills</h2>

        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2">
          {/* Left: categorized text */}
          <div className="grid grid-cols-2 gap-8">
            {skillGroups.map((group) => (
              <div key={group.title}>
                <h4 className="mb-3 font-mono text-xs uppercase tracking-wide text-neutral-400">
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

          {/* Right: icon grid */}
          <div className="grid grid-cols-4 gap-4">
            {iconStack.map(({ icon: Icon, label, color }) => (
              <div
                key={label}
                className="glass-panel flex flex-col items-center justify-center gap-2 rounded-lg py-4"
                title={label}
              >
                <Icon className="h-6 w-6" style={{ color }} />
                <span className="font-mono text-[10px] text-neutral-500">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

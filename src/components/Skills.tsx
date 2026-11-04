import {
  SiPython,
  SiTypescript,
  SiJavascript,
  SiReact,
  SiNodedotjs,
  SiPhp,
  SiMysql,
  SiPostgresql,
  SiTailwindcss,
  SiGit,
  SiGithub,
  SiFigma,
  SiAndroidstudio,
  SiLinux,
} from "react-icons/si";
import { FaJava } from "react-icons/fa6";

const iconStack = [
  { icon: SiReact, label: "React", color: "#149ECA" },
  { icon: SiTypescript, label: "TypeScript", color: "#3178C6" },
  { icon: SiJavascript, label: "JavaScript", color: "#D4A017" },
  { icon: SiNodedotjs, label: "Node.js", color: "#339933" },
  { icon: SiTailwindcss, label: "Tailwind", color: "#06B6D4" },
  { icon: SiPython, label: "Python", color: "#3776AB" },
  { icon: FaJava, label: "Java", color: "#E76F00" },
  { icon: SiPhp, label: "PHP", color: "#777BB4" },
  { icon: SiMysql, label: "MySQL", color: "#4479A1" },
  { icon: SiPostgresql, label: "PostgreSQL", color: "#336791" },
  { icon: SiAndroidstudio, label: "Android Studio", color: "#3DDC84" },
  { icon: SiLinux, label: "Linux", color: "#171717" },
  { icon: SiGit, label: "Git", color: "#F05032" },
  { icon: SiGithub, label: "GitHub", color: "#171717" },
  { icon: SiFigma, label: "Figma", color: "#F24E1E" },
];

export default function Skills() {
  return (
    <section id="skills" className="border-b border-neutral-200 py-24">
      <div className="mx-auto max-w-5xl px-6">
        <p className="mb-2 font-mono text-sm text-neutral-900">02 / TOOLKIT</p>
        <h2 className="mb-14 text-3xl font-semibold">Skills</h2>

        <div className="grid grid-cols-3 gap-4 sm:grid-cols-5">
          {iconStack.map(({ icon: Icon, label, color }) => (
            <div
              key={label}
              className="glass-panel flex flex-col items-center justify-center gap-2 rounded-lg py-5"
              title={label}
            >
              <Icon className="h-7 w-7" style={{ color }} />
              <span className="font-mono text-[10px] text-neutral-600">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

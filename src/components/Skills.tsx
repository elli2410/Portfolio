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

// Colours are the brand colours, lightened where needed so they read on the dark night background.
const iconStack = [
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

export default function Skills() {
  return (
    <section id="skills" className="px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <div className="px-plate mb-14">
          <p className="px-eyebrow mb-3">02 / TOOLKIT</p>
          <h2 className="px-title text-[clamp(1.1rem,3.2vw,1.7rem)]">Skills</h2>
        </div>

        <div className="px-panel px-vend p-0">
          <div className="px-vend-head">
            <span>VEND-O-MAT</span>
            <span>24H · OPEN</span>
          </div>
          <div className="px-vend-glass mx-5 sm:mx-8">
          <ul className="grid grid-cols-3 gap-4 sm:grid-cols-5 sm:gap-5">
            {iconStack.map(({ icon: Icon, label, color }, i) => (
              <li
                key={label}
                data-slot={`${String.fromCharCode(65 + Math.floor(i / 5))}${(i % 5) + 1}`}
                className="px-slot flex flex-col items-center justify-center gap-2 px-1 pb-6 pt-7"
                title={label}
              >
                <Icon className="px-slot-icon h-8 w-8" style={{ color }} aria-hidden="true" />
                <span className="text-center text-lg leading-tight text-[var(--px-muted)] sm:text-xl">
                  {label}
                </span>
              </li>
            ))}
          </ul>
          </div>
          <div className="px-vend-tray mb-6">INSERT COIN · TAKE SKILL</div>
        </div>
      </div>
    </section>
  );
}

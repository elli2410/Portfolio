import {
  SiPython,
  SiTypescript,
  SiJavascript,
  SiReact,
  SiMongodb,
  SiExpress,
  SiNodedotjs,
  SiTailwindcss,
  SiGit,
  SiGithub,
  SiFigma,
  SiGoogleanalytics,
  SiNotion,
} from "react-icons/si";
import { FaFileExcel, FaSlack } from "react-icons/fa6";
import { PiPalette } from "react-icons/pi";

const iconStack = [
  { icon: SiPython, label: "Python", color: "#3776AB" },
  { icon: SiTypescript, label: "TypeScript", color: "#3178C6" },
  { icon: SiJavascript, label: "JavaScript", color: "#F7DF1E" },
  { icon: SiReact, label: "React", color: "#61DAFB" },
  { icon: SiNodedotjs, label: "Node.js", color: "#339933" },
  { icon: SiExpress, label: "Express", color: "#F5F5F5" },
  { icon: SiMongodb, label: "MongoDB", color: "#47A248" },
  { icon: SiTailwindcss, label: "Tailwind", color: "#06B6D4" },
  { icon: SiGit, label: "Git", color: "#F05032" },
  { icon: SiGithub, label: "GitHub", color: "#F5F5F5" },
  { icon: SiFigma, label: "Figma", color: "#F24E1E" },
  { icon: PiPalette, label: "Canva", color: "#00C4CC" },
  { icon: FaFileExcel, label: "Excel", color: "#217346" },
  { icon: SiGoogleanalytics, label: "Google Analytics", color: "#E37400" },
  { icon: SiNotion, label: "Notion", color: "#F5F5F5" },
];

export default function Skills() {
  return (
    <section id="skills" className="border-b border-neutral-800 py-24">
      <div className="mx-auto max-w-5xl px-6">
        <p className="mb-2 font-mono text-sm text-neutral-100">02 / TOOLKIT</p>
        <h2 className="mb-14 text-3xl font-semibold">Skills</h2>

        <div className="grid grid-cols-3 gap-4 sm:grid-cols-6">
          {iconStack.map(({ icon: Icon, label, color }) => (
            <div
              key={label}
              className="glass-panel flex flex-col items-center justify-center gap-2 rounded-lg py-5"
              title={label}
            >
              <Icon className="h-7 w-7" style={{ color }} />
              <span className="font-mono text-[10px] text-neutral-500">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
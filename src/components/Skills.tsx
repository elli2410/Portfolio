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
    <section id="skills" className="vm-section">
      <div className="vm">
        {/* lit header sign */}
        <div className="vm-sign">
          <p className="vm-sign-eyebrow">02 / TOOLKIT</p>
          <h2 className="vm-sign-title">Skills</h2>
          <span className="vm-sign-status">VEND-O-MAT · 24H · OPEN</span>
        </div>

        <div className="vm-body">
          {/* glass front: the skills sit on coil shelves */}
          <div className="vm-glass">
            <ul className="vm-grid">
              {iconStack.map(({ icon: Icon, label, color }, i) => (
                <li
                  key={label}
                  data-slot={`${String.fromCharCode(65 + Math.floor(i / 5))}${(i % 5) + 1}`}
                  className="vm-slot"
                  title={label}
                >
                  <Icon className="vm-icon h-8 w-8" style={{ color }} aria-hidden="true" />
                  <span className="vm-label">{label}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* control column */}
          <aside className="vm-side" aria-hidden="true">
            <div className="vm-display">
              <span>SELECT</span>
              <b>A1</b>
            </div>
            <div className="vm-keys">
              {["1", "2", "3", "4", "5", "A", "B", "C", "OK"].map((k) => (
                <i key={k}>{k}</i>
              ))}
            </div>
            <div className="vm-coin">
              <span />
              <small>INSERT COIN</small>
            </div>
            <div className="vm-card">TAP CARD</div>
          </aside>
        </div>

        {/* delivery flap */}
        <div className="vm-flap">
          <span>PUSH · TAKE SKILL</span>
        </div>
        <span className="vm-foot vm-foot-l" aria-hidden="true" />
        <span className="vm-foot vm-foot-r" aria-hidden="true" />
        <span className="vm-plug" aria-hidden="true" />
      </div>
      <div className="vm-ledge" aria-hidden="true" />
    </section>
  );
}

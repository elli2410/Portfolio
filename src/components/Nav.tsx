export default function Nav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-neutral-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <a
          href="#top"
          className="font-mono text-sm text-black transition-opacity hover:opacity-60"
        >
          Elliah Panopio
        </a>
        <ul className="flex gap-4 text-sm text-neutral-600 sm:gap-6">
          <li>
            <a href="#work" className="nav-link">
              Work
            </a>
          </li>
          <li>
            <a href="#skills" className="nav-link">
              Skills
            </a>
          </li>
          <li>
            <a href="#about" className="nav-link">
              About
            </a>
          </li>
          <li>
            <a href="#contact" className="nav-link">
              Contact
            </a>
          </li>
        </ul>
      </div>
    </nav>
  );
}

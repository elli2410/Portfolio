export default function Nav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-neutral-800 bg-black/80 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
        <a href="#top" className="font-mono text-sm text-amber-400">
          elli.dev
        </a>
        <ul className="flex gap-6 text-sm text-neutral-400">
          <li>
            <a href="#work" className="hover:text-white">
              Work
            </a>
          </li>
          <li>
            <a href="#skills" className="hover:text-white">
              Skills
            </a>
          </li>
          <li>
            <a href="#about" className="hover:text-white">
              About
            </a>
          </li>
          <li>
            <a href="#contact" className="hover:text-white">
              Contact
            </a>
          </li>
        </ul>
      </div>
    </nav>
  );
}

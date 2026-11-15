export default function Nav() {
  return (
    <nav className="px-nav fixed top-0 left-0 right-0 z-50" aria-label="Main">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3.5 sm:px-6">
        <a
          href="#top"
          className="font-pixel text-[0.6rem] leading-none tracking-[0.14em] text-[var(--px-pink)] hover:text-white sm:text-[0.68rem]"
        >
          <span className="hidden sm:inline">Elliah Panopio</span>
          <span className="sm:hidden">Elli</span>
        </a>
        <ul className="flex gap-3.5 sm:gap-8">
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

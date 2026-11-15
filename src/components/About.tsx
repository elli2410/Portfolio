export default function About() {
  return (
    <section id="about" className="px-6 py-24">
      <div className="mx-auto max-w-3xl">
        <div className="px-plate mb-16">
          <p className="px-eyebrow mb-3">03 / ABOUT</p>
          <h2 className="px-title text-[clamp(1.1rem,3.2vw,1.7rem)]">A bit about me</h2>
        </div>

        {/* Dialogue box */}
        <div className="px-panel relative px-6 pb-14 pt-12 sm:px-10">
          <span className="px-nametag">ELLI@NIGHT-CITY:~$ ABOUT</span>
          <div className="space-y-5 text-xl text-[var(--px-ink)] sm:text-2xl">
            <p>
              I originally chose Computer Science because I was curious about how software is
              built, not just how to use it. What started as an interest in computers and gaming
              quickly grew into a desire to understand what happens behind the scenes and create
              things from scratch.
            </p>
            <p>
              I enjoy the process of turning an idea into a working application. Whether
              it&apos;s a web app, an Android project, or experimenting with machine learning,
              seeing the final product come together is what keeps me motivated to learn.
            </p>
            <p>
              Outside of school, you&apos;ll usually find me building small side projects,
              reading about new technologies, or gaming. In team projects, I&apos;m often the
              quiet one who enjoys debugging problems and making sure everything works as
              expected.
            </p>
          </div>
          <span aria-hidden="true" className="px-continue" />
        </div>
      </div>
    </section>
  );
}

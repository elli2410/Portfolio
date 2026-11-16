/**
 * A lit apartment window on the alley wall. The text is on the screen of the
 * CRT sitting on the sill, in the room behind the glass.
 */
export default function About() {
  return (
    <section id="about" className="ap-section">
      <div className="ap-wall">
        <span className="ap-pipe" aria-hidden="true" />
        <span className="ap-ac" aria-hidden="true" />
        <span className="ap-sign" aria-hidden="true">
          月 OPEN
        </span>

        <div className="ap-window">
          <div className="ap-room">
            <span className="ap-blinds" aria-hidden="true" />
            <span className="ap-lamp" aria-hidden="true" />

            <div className="crt">
              <div className="crt-bezel">
                <div className="crt-screen">
                  <p className="crt-eyebrow">03 / ABOUT</p>
                  <h2 className="crt-title">A bit about me</h2>
                  <p className="crt-prompt">ELLI@NIGHT-CITY:~$ ABOUT</p>
                  <div className="crt-text">
                    <p>
                      I originally chose Computer Science because I was curious about how software
                      is built, not just how to use it. What started as an interest in computers and
                      gaming quickly grew into a desire to understand what happens behind the scenes
                      and create things from scratch.
                    </p>
                    <p>
                      I enjoy the process of turning an idea into a working application. Whether
                      it&apos;s a web app, an Android project, or experimenting with machine
                      learning, seeing the final product come together is what keeps me motivated to
                      learn.
                    </p>
                    <p>
                      Outside of school, you&apos;ll usually find me building small side projects,
                      reading about new technologies, or gaming. In team projects, I&apos;m often
                      the quiet one who enjoys debugging problems and making sure everything works
                      as expected.
                    </p>
                  </div>
                  <span aria-hidden="true" className="px-continue" />
                </div>
                <span className="crt-led" aria-hidden="true" />
              </div>
              <span className="crt-neck" aria-hidden="true" />
              <span className="crt-base" aria-hidden="true" />
            </div>
          </div>
        </div>

        <div className="ap-sill" aria-hidden="true">
          <i /> <i /> <i />
        </div>
      </div>
    </section>
  );
}

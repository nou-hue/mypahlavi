import { createFileRoute } from "@tanstack/react-router";
import { LayoutShell } from "@/components/archive/layout-shell";
import siteCopy from "@/data/site-copy.json";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const heroSrc = siteCopy.heroSrc;
  const lines = siteCopy.poetryLines ?? [];

  return (
    <LayoutShell>
      {/* Hero — the plate alone */}
      <section className="bg-ground">
        <div className="mx-auto flex min-h-[100svh] max-w-5xl flex-col items-center justify-center px-5 pb-20 pt-28 sm:px-8 sm:pb-24 sm:pt-32">
          <p className="mb-10 font-sans text-[0.65rem] uppercase tracking-[0.32em] text-ink-subtle archive-rise">
            {siteCopy.heroKicker}
          </p>

          {heroSrc ? (
            <figure className="archive-rise w-full max-w-[min(100%,420px)] sm:max-w-[min(100%,480px)]">
              <div className="hero-plate relative w-full overflow-hidden bg-deep archive-view-only">
                <img
                  src={heroSrc}
                  alt={siteCopy.heroCaption}
                  draggable={false}
                  className="mx-auto block h-auto w-full select-none object-contain"
                  style={{ maxHeight: "min(68svh, 680px)" }}
                />
                <span aria-hidden className="absolute inset-0" />
              </div>
              <figcaption className="mt-6 text-center">
                <p className="font-serif text-base italic leading-relaxed text-ink-muted sm:text-lg">
                  {siteCopy.heroCaption}
                </p>
              </figcaption>
            </figure>
          ) : null}
        </div>
      </section>

      {/* Poetry for His Highness Reza Pahlavi */}
      <section className="border-t border-border bg-ground">
        <div className="mx-auto max-w-2xl px-5 py-20 sm:px-8 sm:py-28">
          <header className="mb-14 text-center archive-rise">
            <p className="font-sans text-[0.65rem] uppercase tracking-[0.28em] text-ink-subtle">
              {siteCopy.poetryTitle}
            </p>
            <h1 className="mt-4 font-serif text-3xl tracking-tight text-ink sm:text-4xl">
              {siteCopy.poetrySubject}
            </h1>
            <div className="mx-auto mt-6 h-px w-12 bg-border" />
          </header>

          <article
            className="archive-rise space-y-0 text-center"
            aria-label="Poem for His Highness Reza Pahlavi"
          >
            {lines.map((line, i) =>
              line === "" ? (
                <div key={`break-${i}`} className="h-7 sm:h-8" aria-hidden />
              ) : (
                <p
                  key={i}
                  className="font-serif text-[1.125rem] leading-[1.85] tracking-[-0.01em] text-ink-soft sm:text-[1.25rem] sm:leading-[1.9]"
                >
                  {line}
                </p>
              ),
            )}
          </article>

          <p className="mt-16 text-center font-sans text-[0.62rem] uppercase tracking-[0.2em] text-ink-subtle">
            mypahlavi · independent archive
          </p>
        </div>
      </section>
    </LayoutShell>
  );
}

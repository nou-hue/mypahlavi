import { createFileRoute, Link } from "@tanstack/react-router";
import { LayoutShell } from "@/components/archive/layout-shell";
import { MuseumPlate } from "@/components/archive/museum-plate";
import { editorialStories, sourcesForStory } from "@/data/editorial-v4";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const lead = editorialStories[0]!;
  const secondary = editorialStories.slice(1);

  return (
    <LayoutShell>
      <main>
        <section className="border-b border-border bg-ground">
          <div className="mx-auto grid min-h-[calc(100svh-5rem)] max-w-[90rem] gap-12 px-6 py-12 sm:px-12 sm:py-16 lg:grid-cols-[minmax(0,1.18fr)_minmax(19rem,.82fr)] lg:items-center lg:gap-20 lg:py-20">
            <MuseumPlate
              src={lead.imageSrc}
              alt={lead.imageAlt}
              meta={lead.imageMeta}
              caption="Archival image presented as a document, not a decorative crop."
              className="archive-rise"
              contain={false}
              imageClassName="aspect-[4/5] lg:aspect-[5/6]"
            />

            <div className="max-w-xl archive-rise">
              <p className="font-sans text-[0.62rem] uppercase tracking-[0.28em] text-ink-subtle">
                MYPAHLAVI / ISSUE 01
              </p>
              <h1 className="mt-7 text-balance font-serif text-5xl leading-[0.98] tracking-[-0.035em] sm:text-6xl lg:text-7xl">
                Iran in the making.
              </h1>
              <p className="mt-8 max-w-lg text-base leading-8 text-ink-muted sm:text-lg">
                A research-led archive and independent journal about twentieth-century Iran:
                photographs, buildings, objects, testimony and documents placed back into context.
              </p>
              <div className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-4">
                <Link
                  to="/library"
                  className="inline-flex items-center gap-2 border-b border-ink pb-1 font-sans text-[0.67rem] uppercase tracking-[0.18em]"
                >
                  Read Issue 01 <span aria-hidden>→</span>
                </Link>
                <Link
                  to="/gallery"
                  className="font-sans text-[0.67rem] uppercase tracking-[0.18em] text-ink-subtle transition-colors hover:text-ink"
                >
                  Enter the archive
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-ground">
          <div className="mx-auto max-w-[90rem] px-6 py-24 sm:px-12 sm:py-32">
            <div className="grid gap-14 lg:grid-cols-[minmax(0,.75fr)_minmax(0,1.25fr)] lg:gap-24">
              <div>
                <p className="font-sans text-[0.58rem] uppercase tracking-[0.28em] text-ink-subtle">
                  {lead.kicker} · {lead.readTime}
                </p>
                <h2 className="mt-6 max-w-xl font-serif text-4xl leading-[1.02] tracking-[-0.025em] sm:text-5xl">
                  {lead.title}
                </h2>
                <p className="mt-7 max-w-xl text-base leading-8 text-ink-muted">
                  {lead.standfirst}
                </p>
              </div>

              <div className="grid gap-8 sm:grid-cols-2">
                {lead.paragraphs.slice(0, 2).map((paragraph) => (
                  <p key={paragraph} className="text-[0.96rem] leading-8 text-ink-soft">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>

            <div className="mt-16 border-y border-border py-8">
              <div className="grid gap-6 lg:grid-cols-[11rem_1fr]">
                <p className="font-sans text-[0.58rem] uppercase tracking-[0.24em] text-ink-subtle">
                  Research trail
                </p>
                <div className="grid gap-5 md:grid-cols-3">
                  {sourcesForStory(lead).map((source) => (
                    <a
                      key={source.url}
                      href={source.url}
                      target="_blank"
                      rel="noreferrer"
                      className="group"
                    >
                      <p className="font-serif text-lg leading-snug transition-opacity group-hover:opacity-60">
                        {source.label}
                      </p>
                      <p className="mt-1 font-sans text-[0.55rem] uppercase tracking-[0.14em] text-ink-subtle">
                        {source.institution}
                      </p>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-border bg-[#111214] text-[#fffefa]">
          <div className="mx-auto max-w-[90rem] px-6 py-24 sm:px-12 sm:py-32">
            <div className="mb-14 flex items-end justify-between gap-8">
              <div>
                <p className="font-sans text-[0.58rem] uppercase tracking-[0.28em] text-white/45">
                  The journal
                </p>
                <h2 className="mt-4 font-serif text-4xl tracking-[-0.025em] sm:text-5xl">
                  Stories built from evidence.
                </h2>
              </div>
              <Link
                to="/library"
                className="hidden border-b border-white/45 pb-1 font-sans text-[0.6rem] uppercase tracking-[0.18em] text-white/65 sm:inline-flex"
              >
                Open reading room →
              </Link>
            </div>

            <div className="grid gap-14 lg:grid-cols-2">
              {secondary.map((story) => (
                <article key={story.id} className="border-t border-white/15 pt-8">
                  <p className="font-sans text-[0.56rem] uppercase tracking-[0.2em] text-white/45">
                    {story.format} · {story.period} · {story.readTime}
                  </p>
                  <h3 className="mt-5 max-w-xl font-serif text-3xl leading-tight tracking-[-0.02em] sm:text-4xl">
                    {story.title}
                  </h3>
                  <p className="mt-5 max-w-xl text-sm leading-7 text-white/65">
                    {story.standfirst}
                  </p>
                  <p className="mt-7 max-w-xl text-sm leading-7 text-white/75">
                    {story.paragraphs[0]}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-ground">
          <div className="mx-auto max-w-[90rem] px-6 py-24 sm:px-12 sm:py-32">
            <div className="grid gap-16 lg:grid-cols-[.8fr_1.2fr] lg:items-start lg:gap-24">
              <div>
                <p className="font-sans text-[0.58rem] uppercase tracking-[0.28em] text-ink-subtle">
                  Archive standard
                </p>
                <h2 className="mt-5 max-w-md font-serif text-4xl leading-tight tracking-[-0.02em]">
                  The image is an object with a history.
                </h2>
              </div>
              <div className="grid gap-8 sm:grid-cols-2">
                {[
                  ["01", "Provenance before polish", "Source, date, place and rights status are part of the record."],
                  ["02", "Restoration without invention", "Dust, tilt and tonal damage may be corrected; missing historical detail is not fabricated."],
                  ["03", "No compulsory crop", "Important photographs are shown inside a generous paper mat rather than forced into interface ratios."],
                  ["04", "Captions carry evidence", "Uncertain dates, attribution and institutional perspective are labelled instead of hidden."],
                ].map(([n, title, body]) => (
                  <div key={n} className="border-t border-border pt-5">
                    <p className="font-sans text-[0.56rem] tracking-[0.16em] text-ink-subtle">{n}</p>
                    <h3 className="mt-4 font-serif text-2xl tracking-tight">{title}</h3>
                    <p className="mt-3 text-sm leading-7 text-ink-muted">{body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-border bg-ground">
          <div className="mx-auto max-w-[90rem] px-6 py-24 sm:px-12 sm:py-32">
            <div className="grid gap-14 lg:grid-cols-[.7fr_1.3fr] lg:gap-24">
              <div>
                <p className="font-sans text-[0.58rem] uppercase tracking-[0.28em] text-ink-subtle">
                  Editions / first studies
                </p>
                <h2 className="mt-5 font-serif text-4xl leading-tight tracking-[-0.02em]">
                  Research becomes an object.
                </h2>
                <p className="mt-5 max-w-sm text-sm leading-7 text-ink-muted">
                  Original artwork developed from architecture, gardens, travel graphics and the visual culture of modern Iran — not souvenir merchandise.
                </p>
                <Link
                  to="/editions"
                  className="mt-8 inline-flex border-b border-ink pb-1 font-sans text-[0.62rem] uppercase tracking-[0.18em]"
                >
                  View Editions →
                </Link>
              </div>

              <div className="grid gap-8 sm:grid-cols-3">
                {[
                  ["/editions/tehran-grid-01.svg", "Tehran Grid No. 01"],
                  ["/editions/caspian-line-01.svg", "Caspian Line No. 01"],
                  ["/editions/garden-plan-01.svg", "Garden Plan No. 01"],
                ].map(([src, label]) => (
                  <div key={src}>
                    <div className="border border-border bg-[#fffefa] p-4 shadow-soft">
                      <img src={src} alt={label} className="aspect-[3/4] w-full object-contain" />
                    </div>
                    <p className="mt-4 font-serif text-lg">{label}</p>
                    <p className="mt-1 font-sans text-[0.54rem] uppercase tracking-[0.16em] text-ink-subtle">
                      Original MyPahlavi study
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </LayoutShell>
  );
}

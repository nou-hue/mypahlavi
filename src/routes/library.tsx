import { createFileRoute, Link } from "@tanstack/react-router";
import { LayoutShell } from "@/components/archive/layout-shell";
import { MuseumPlate } from "@/components/archive/museum-plate";
import { editorialStories, sourcesForStory } from "@/data/editorial-v4";
import { libraryItems } from "@/data/archive";

export const Route = createFileRoute("/library")({
  component: JournalPage,
});

function JournalPage() {
  const lead = editorialStories[0]!;
  const rest = editorialStories.slice(1);

  return (
    <LayoutShell>
      <main>
        <section className="border-b border-border bg-ground">
          <div className="mx-auto max-w-[90rem] px-6 py-20 sm:px-12 sm:py-28">
            <p className="font-sans text-[0.6rem] uppercase tracking-[0.3em] text-ink-subtle">
              The Journal / Issue 01
            </p>
            <div className="mt-7 grid gap-12 lg:grid-cols-[.85fr_1.15fr] lg:items-end lg:gap-20">
              <div>
                <h1 className="text-balance font-serif text-5xl leading-[.98] tracking-[-0.035em] sm:text-6xl">
                  History is more interesting when the evidence is allowed to disagree.
                </h1>
              </div>
              <p className="max-w-xl text-base leading-8 text-ink-muted">
                MyPahlavi publishes researched stories from photographs, architecture,
                oral testimony and primary documents. Sources are visible. Institutional
                perspective is labelled. Uncertainty stays in the record.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-ground">
          <div className="mx-auto max-w-[90rem] px-6 py-20 sm:px-12 sm:py-28">
            <div className="grid gap-14 lg:grid-cols-[1.1fr_.9fr] lg:gap-20">
              <MuseumPlate
                src={lead.imageSrc}
                alt={lead.imageAlt}
                meta={lead.imageMeta}
                caption="Context image from the existing archive. Date and provenance remain subject to catalogue verification."
                contain={false}
                imageClassName="aspect-[5/6]"
              />
              <article className="lg:pt-6">
                <p className="font-sans text-[0.58rem] uppercase tracking-[0.24em] text-ink-subtle">
                  {lead.format} · {lead.period} · {lead.readTime}
                </p>
                <h2 className="mt-6 font-serif text-4xl leading-[1.02] tracking-[-0.03em] sm:text-5xl">
                  {lead.title}
                </h2>
                <p className="mt-6 text-lg leading-8 text-ink-soft">
                  {lead.standfirst}
                </p>
                <div className="mt-9 space-y-6">
                  {lead.paragraphs.map((p) => (
                    <p key={p} className="text-[0.96rem] leading-8 text-ink-muted">
                      {p}
                    </p>
                  ))}
                </div>

                <div className="mt-10 border-t border-border pt-7">
                  <p className="mb-5 font-sans text-[0.55rem] uppercase tracking-[0.2em] text-ink-subtle">
                    Sources & further reading
                  </p>
                  <div className="space-y-5">
                    {sourcesForStory(lead).map((source) => (
                      <a
                        key={source.url}
                        href={source.url}
                        target="_blank"
                        rel="noreferrer"
                        className="group block"
                      >
                        <p className="font-serif text-xl transition-opacity group-hover:opacity-60">
                          {source.label}
                        </p>
                        <p className="mt-1 font-sans text-[0.54rem] uppercase tracking-[0.14em] text-ink-subtle">
                          {source.institution}
                        </p>
                        <p className="mt-2 max-w-xl text-xs leading-6 text-ink-muted">
                          {source.note}
                        </p>
                      </a>
                    ))}
                  </div>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section className="border-y border-border bg-[#111214] text-[#fffefa]">
          <div className="mx-auto max-w-[90rem] px-6 py-20 sm:px-12 sm:py-28">
            <div className="mb-12">
              <p className="font-sans text-[0.58rem] uppercase tracking-[0.26em] text-white/45">
                Issue 01 / dossiers
              </p>
            </div>
            <div className="grid gap-16 lg:grid-cols-2">
              {rest.map((story) => (
                <article key={story.id} className="border-t border-white/15 pt-8">
                  <p className="font-sans text-[0.55rem] uppercase tracking-[0.18em] text-white/45">
                    {story.kicker} · {story.format} · {story.readTime}
                  </p>
                  <h2 className="mt-5 max-w-xl font-serif text-4xl leading-tight tracking-[-0.025em]">
                    {story.title}
                  </h2>
                  <p className="mt-5 max-w-xl text-base leading-8 text-white/70">
                    {story.standfirst}
                  </p>
                  <div className="mt-7 space-y-5">
                    {story.paragraphs.map((p) => (
                      <p key={p} className="max-w-xl text-sm leading-7 text-white/62">
                        {p}
                      </p>
                    ))}
                  </div>
                  <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
                    {sourcesForStory(story).map((source) => (
                      <a
                        key={source.url}
                        href={source.url}
                        target="_blank"
                        rel="noreferrer"
                        className="border-b border-white/20 pb-1 font-sans text-[0.54rem] uppercase tracking-[0.14em] text-white/55 hover:text-white"
                      >
                        {source.institution} ↗
                      </a>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {libraryItems.length > 0 && (
          <section className="bg-ground">
            <div className="mx-auto max-w-[90rem] px-6 py-20 sm:px-12 sm:py-28">
              <div className="grid gap-12 lg:grid-cols-[.55fr_1.45fr] lg:gap-20">
                <div>
                  <p className="font-sans text-[0.58rem] uppercase tracking-[0.26em] text-ink-subtle">
                    Earlier reading room
                  </p>
                  <h2 className="mt-4 font-serif text-3xl tracking-[-0.02em]">
                    Catalogue
                  </h2>
                  <p className="mt-4 max-w-sm text-sm leading-7 text-ink-muted">
                    Existing essays and letters remain available while they are
                    progressively re-edited to the V4 sourcing and caption standard.
                  </p>
                </div>

                <ol className="border-t border-border">
                  {libraryItems.map((item, i) => (
                    <li key={item.id} className="border-b border-border">
                      <Link
                        to="/library/$slug"
                        params={{ slug: item.slug }}
                        className="group grid gap-3 py-6 sm:grid-cols-[2.5rem_1fr_auto] sm:items-baseline sm:gap-7"
                      >
                        <span className="font-sans text-[0.55rem] tabular-nums text-ink-subtle">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span>
                          <span className="font-serif text-xl tracking-tight transition-opacity group-hover:opacity-60">
                            {item.title}
                          </span>
                          <span className="mt-1 block font-sans text-[0.52rem] uppercase tracking-[0.14em] text-ink-subtle">
                            {item.kind}{item.tags[0] ? ` · ${item.tags[0]}` : ""}
                          </span>
                        </span>
                        <span className="font-sans text-[0.55rem] tabular-nums text-ink-subtle">
                          {item.year}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </section>
        )}
      </main>
    </LayoutShell>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { LayoutShell } from "@/components/archive/layout-shell";
import {
  ArchiveSubnav,
  EmptyState,
  EventItem,
  PageIntro,
  PlaceholderBanner,
  archiveHead,
} from "@/components/archive-index/ui";
import { archive } from "@/content/load";

export const Route = createFileRoute("/archive/timeline")({
  head: () =>
    archiveHead({
      path: "/archive/timeline",
      // Thin until something is published here.
      noindex: !archive.events.some((r) => r.status === "published"),
      title: "Timeline",
      description: "Events in date order, shown at the precision the evidence supports and marked documented, disputed or to be verified.",
    }),
  component: TimelinePage,
});

function TimelinePage() {
  const { decades, undated } = archive.timeline();
  const everything = archive.events;

  return (
    <LayoutShell>
      <main>
        <ArchiveSubnav active="/archive/timeline" />
        {everything.length > 0 && everything.every((e) => e.status === "placeholder") ? <PlaceholderBanner /> : null}
        <PageIntro kicker="Archive / Timeline" title="Timeline">
          <p>
            Events appear in date order. Each is marked <em>documented</em>, <em>disputed</em> or{" "}
            <em>to be verified</em>, and carries its citations. Where accounts differ, the timeline says whose
            account it is.
          </p>
        </PageIntro>

        <section className="bg-ground">
          <div className="mx-auto max-w-[90rem] px-6 py-16 sm:px-12 sm:py-24">
            {everything.length === 0 ? (
              <EmptyState title="The timeline begins when the first event is sourced.">
                Each event needs a date, at least one citation and a stated level of confidence before it is
                published.
              </EmptyState>
            ) : (
              <>
                {decades.length > 0 && (
                  <nav aria-label="Jump to decade" className="mb-14 flex flex-wrap gap-x-6 gap-y-2 font-sans text-[0.62rem] uppercase tracking-[0.18em]">
                    {decades.map((d) => (
                      <a key={d.decade} href={`#decade-${d.decade}`} className="py-2 text-ink-subtle hover:text-ink">
                        {d.decade}s
                      </a>
                    ))}
                    {undated.length > 0 && (
                      <a href="#undated" className="py-2 text-ink-subtle hover:text-ink">Awaiting dates</a>
                    )}
                  </nav>
                )}

                <div className="space-y-16">
                  {decades.map((d) => (
                    <section key={d.decade} id={`decade-${d.decade}`} aria-labelledby={`h-${d.decade}`} className="grid scroll-mt-28 gap-6 lg:grid-cols-[9rem_1fr] lg:gap-14">
                      <h2 id={`h-${d.decade}`} className="font-serif text-4xl tracking-[-0.03em] lg:sticky lg:top-32 lg:self-start">
                        {d.decade}s
                      </h2>
                      <ol className="border-t border-border">
                        {d.items.map((e) => (
                          <EventItem key={e.id} event={e} />
                        ))}
                      </ol>
                    </section>
                  ))}

                  {undated.length > 0 && (
                    <section id="undated" aria-labelledby="h-undated" className="grid scroll-mt-28 gap-6 lg:grid-cols-[9rem_1fr] lg:gap-14">
                      <div className="lg:sticky lg:top-32 lg:self-start">
                        <h2 id="h-undated" className="font-serif text-3xl italic tracking-[-0.02em] text-ink-soft">
                          Awaiting dates
                        </h2>
                        <p className="mt-3 text-xs leading-6 text-ink-muted">
                          Recorded, but not yet placed in time.
                        </p>
                      </div>
                      <ol className="border-t border-border">
                        {undated.map((e) => (
                          <EventItem key={e.id} event={e} />
                        ))}
                      </ol>
                    </section>
                  )}
                </div>
              </>
            )}
          </div>
        </section>
      </main>
    </LayoutShell>
  );
}

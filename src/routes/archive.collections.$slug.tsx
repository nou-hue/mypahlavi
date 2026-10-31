import { createFileRoute, Link } from "@tanstack/react-router";
import { LayoutShell } from "@/components/archive/layout-shell";
import {
  ArchiveSubnav,
  EmptyState,
  EntryRow,
  EventItem,
  PlaceholderBanner,
  PlaceholderMark,
  PlateTile,
  SectionHeading,
  archiveHead,
} from "@/components/archive-index/ui";
import { archive } from "@/content/load";

export const Route = createFileRoute("/archive/collections/$slug")({
  head: ({ params }) => {
    const c = archive.collection(params.slug);
    return archiveHead({
      path: `/archive/collections/${params.slug}`,
      title: c?.title ?? "Collection not found",
      description: c?.description ?? "A collection in the MyPahlavi archive.",
      noindex: !c || c.status !== "published",
    });
  },
  component: CollectionPage,
});

function CollectionPage() {
  const { slug } = Route.useParams();
  const c = archive.collection(slug);

  if (!c) {
    return (
      <LayoutShell>
        <main>
          <ArchiveSubnav active="/archive/collections" />
          <div className="mx-auto max-w-[90rem] px-6 py-24 sm:px-12">
            <EmptyState
              title="This collection is not in the archive."
              action={
                <Link to="/archive/collections" className="font-sans text-[0.6rem] uppercase tracking-[0.18em] underline underline-offset-8">
                  Browse collections
                </Link>
              }
            >
              It may not be published yet, or the address may have changed.
            </EmptyState>
          </div>
        </main>
      </LayoutShell>
    );
  }

  const m = archive.membersOf(c);
  const total = m.entries.length + m.plates.length + m.events.length;

  return (
    <LayoutShell>
      <main>
        <ArchiveSubnav active="/archive/collections" />
        {c.status === "placeholder" ? <PlaceholderBanner /> : null}
        <header className="border-b border-border">
          <div className="mx-auto max-w-[90rem] px-6 py-16 sm:px-12 sm:py-24">
            <p className="flex items-center gap-4 font-sans text-[0.6rem] uppercase tracking-[0.3em] text-ink-subtle">
              Collection {c.status === "placeholder" ? <PlaceholderMark /> : null}
            </p>
            <h1 className="mt-6 max-w-4xl text-balance font-serif text-4xl leading-[1.02] tracking-[-0.03em] sm:text-6xl">
              {c.title}
            </h1>
            {c.subtitle ? <p className="mt-5 font-serif text-xl italic text-ink-soft">{c.subtitle}</p> : null}
            <p className="mt-8 max-w-2xl text-base leading-8 text-ink-muted">{c.description}</p>
            {c.curatorNote ? (
              <p className="mt-8 max-w-2xl border-l border-ink/20 pl-6 text-sm leading-7 text-ink-muted">
                <span className="mb-1 block font-sans text-[0.56rem] uppercase tracking-[0.2em] text-ink-subtle">Curator’s note</span>
                {c.curatorNote}
              </p>
            ) : null}
          </div>
        </header>

        <div className="mx-auto max-w-[90rem] space-y-20 px-6 py-16 sm:px-12 sm:py-24">
          {total === 0 ? (
            <EmptyState title="Nothing has been added to this collection yet.">
              Entries, plates and events appear here as they are published.
            </EmptyState>
          ) : null}
          {m.entries.length > 0 && (
            <section>
              <SectionHeading>Entries</SectionHeading>
              <ul className="border-t border-border">
                {m.entries.map((e) => (
                  <EntryRow key={e.slug} entry={e} />
                ))}
              </ul>
            </section>
          )}
          {m.plates.length > 0 && (
            <section>
              <SectionHeading>Plates</SectionHeading>
              <div className="grid gap-x-10 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
                {m.plates.map((p) => (
                  <PlateTile key={p.id} plate={p} />
                ))}
              </div>
            </section>
          )}
          {m.events.length > 0 && (
            <section>
              <SectionHeading>Timeline</SectionHeading>
              <ul className="border-t border-border">
                {m.events.map((e) => (
                  <EventItem key={e.id} event={e} />
                ))}
              </ul>
            </section>
          )}
        </div>
      </main>
    </LayoutShell>
  );
}

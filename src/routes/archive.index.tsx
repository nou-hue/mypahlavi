import { createFileRoute, Link } from "@tanstack/react-router";
import { LayoutShell } from "@/components/archive/layout-shell";
import {
  ArchiveSubnav,
  CollectionCard,
  EmptyState,
  EntryRow,
  EventItem,
  PageIntro,
  PlaceholderBanner,
  SectionHeading,
  TextLink,
  archiveHead,
} from "@/components/archive-index/ui";
import { archive } from "@/content/load";

export const Route = createFileRoute("/archive/")({
  head: () =>
    archiveHead({
      path: "/archive",
      title: "The Archive",
      description:
        "Entries, collections, a timeline, plates and sources — every claim traceable to its evidence.",
    }),
  component: ArchiveHub,
});

const published = (list: { status: string }[]) => list.filter((r) => r.status === "published").length;
const inReview = (list: { status: string }[]) => list.filter((r) => r.status === "review").length;

function ArchiveHub() {
  const { counts } = archive;
  const ways = [
    { to: "/archive/entries", label: "Entries", n: counts.entries, p: published(archive.articles), r: inReview(archive.articles), copy: "Essays, photographs, objects, places and documents, each with its sources." },
    { to: "/archive/collections", label: "Collections", n: counts.collections, p: published(archive.collections), r: inReview(archive.collections), copy: "Curated groups of entries, plates and events around a single thread." },
    { to: "/archive/timeline", label: "Timeline", n: counts.events, p: published(archive.events), r: inReview(archive.events), copy: "Events in order, with dates shown as precisely as the evidence allows." },
    { to: "/archive/plates", label: "Plates", n: counts.plates, p: published(archive.plates), r: inReview(archive.plates), copy: "Images with credit lines, rights status and provenance." },
    { to: "/archive/sources", label: "Sources", n: counts.sources, p: published(archive.sources), r: inReview(archive.sources), copy: "The bibliography behind everything published here." },
  ] as const;

  const collections = archive.collections.slice(0, 3);
  const entries = archive.articles.slice(0, 4);
  const events = archive.events.slice(0, 3);

  return (
    <LayoutShell>
      <main>
        <ArchiveSubnav active="/archive" />
        {archive.onlyPlaceholders && counts.entries + counts.plates + counts.events > 0 ? (
          <PlaceholderBanner>
            The archive is being catalogued. Everything below is a labelled placeholder showing layout only.
          </PlaceholderBanner>
        ) : null}
        <PageIntro kicker="The Archive" title="Evidence, arranged so it can be checked.">
          <p>
            Every entry names its sources. Every image carries its credit and rights status. Dates are given only
            as precisely as the record allows, and where accounts differ, the difference is shown rather than
            smoothed over.
          </p>
        </PageIntro>

        <section className="bg-ground">
          <div className="mx-auto max-w-[90rem] px-6 py-16 sm:px-12 sm:py-24">
            <SectionHeading>Ways in</SectionHeading>
            <ul className="grid border-l border-t border-border sm:grid-cols-2 lg:grid-cols-5">
              {ways.map((w) => (
                <li key={w.to} className="border-b border-r border-border">
                  <Link to={w.to} className="group flex h-full flex-col justify-between gap-10 p-7 transition-colors hover:bg-ground-elevated/60">
                    <span>
                      <span className="block font-serif text-3xl tracking-[-0.02em]">{w.label}</span>
                      <span className="mt-4 block text-sm leading-6 text-ink-muted">{w.copy}</span>
                    </span>
                    <span className="font-sans text-[0.56rem] uppercase tracking-[0.18em] text-ink-subtle">
                      {w.p} published{w.r > 0 ? ` · ${w.r} in review` : ""}{w.n - w.p - w.r > 0 ? ` · ${w.n - w.p - w.r} placeholder` : ""}
                      <span aria-hidden className="ml-2 inline-block transition-transform group-hover:translate-x-1">→</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mt-8 text-sm leading-7 text-ink-muted">
              Looking for the photographs themselves?{" "}
              <Link to="/gallery" className="text-ink underline decoration-ink/30 underline-offset-4 hover:decoration-ink">
                The photographic gallery
              </Link>{" "}
              and{" "}
              <Link to="/library" className="text-ink underline decoration-ink/30 underline-offset-4 hover:decoration-ink">
                the Journal
              </Link>{" "}
              remain as they were.
            </p>
          </div>
        </section>

        <section className="border-t border-border bg-ground">
          <div className="mx-auto max-w-[90rem] px-6 py-16 sm:px-12 sm:py-24">
            <SectionHeading action={<TextLink to="/archive/collections">All collections</TextLink>}>Collections</SectionHeading>
            {collections.length === 0 ? (
              <EmptyState title="Collections will gather here.">
                Each collection draws entries, plates and events around one thread, with a note on how it was
                assembled and what the record leaves out.
              </EmptyState>
            ) : (
              <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
                {collections.map((c) => (
                  <CollectionCard
                    key={c.slug}
                    collection={c}
                    cover={c.coverPlateId ? archive.plate(c.coverPlateId) : undefined}
                    count={c.members.length}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="border-t border-border bg-ground">
          <div className="mx-auto grid max-w-[90rem] gap-16 px-6 py-16 sm:px-12 sm:py-24 lg:grid-cols-2 lg:gap-24">
            <div>
              <SectionHeading action={<TextLink to="/archive/entries">All entries</TextLink>}>Entries</SectionHeading>
              {entries.length === 0 ? (
                <EmptyState title="The first entries are in preparation.">
                  Nothing is published until its sources are cited and its images are cleared.
                </EmptyState>
              ) : (
                <ul className="border-t border-border">
                  {entries.map((e) => (
                    <EntryRow key={e.slug} entry={e} />
                  ))}
                </ul>
              )}
            </div>
            <div>
              <SectionHeading action={<TextLink to="/archive/timeline">Full timeline</TextLink>}>Timeline</SectionHeading>
              {events.length === 0 ? (
                <EmptyState title="The timeline begins when the first event is sourced.">
                  Events appear in date order, each marked documented, disputed or to be verified.
                </EmptyState>
              ) : (
                <ul className="border-t border-border">
                  {events.map((e) => (
                    <EventItem key={e.id} event={e} />
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>

        <section className="border-t border-border bg-ground-elevated/60">
          <div className="mx-auto max-w-[90rem] px-6 py-16 sm:px-12 sm:py-24">
            <SectionHeading>How the archive handles evidence</SectionHeading>
            <dl className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ["Sources", "A claim without a citation is not published. Citations point to a named source, and to a page, folio or timestamp where one exists."],
                ["Credit & rights", "Each image shows who made it, who holds it and on what terms it is shown. Where rights are not cleared the image is withheld."],
                ["Dates", "A date is shown at the precision the evidence supports: a day, a month, a year, a decade. “c.” marks an approximate date."],
                ["Perspective", "Documents are labelled by whose voice they carry. Where accounts conflict, an entry says so and names the account."],
              ].map(([t, d]) => (
                <div key={t}>
                  <dt className="font-serif text-2xl tracking-[-0.015em]">{t}</dt>
                  <dd className="mt-3 text-sm leading-7 text-ink-muted">{d}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      </main>
    </LayoutShell>
  );
}

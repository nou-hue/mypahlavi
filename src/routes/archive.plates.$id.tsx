import { createFileRoute, Link } from "@tanstack/react-router";
import { LayoutShell } from "@/components/archive/layout-shell";
import { SourceLine } from "@/components/archive-index/entry-template";
import {
  ArchiveSubnav,
  DateLabel,
  EmptyState,
  PlaceholderBanner,
  PlaceholderMark,
  PlateFrame,
  RIGHTS_LABEL,
  SectionHeading,
  archiveHead,
} from "@/components/archive-index/ui";
import { archive } from "@/content/load";

export const Route = createFileRoute("/archive/plates/$id")({
  head: ({ params }) => {
    const p = archive.plate(params.id);
    return archiveHead({
      path: `/archive/plates/${params.id}`,
      title: p?.title ?? "Plate not found",
      description: p?.caption ?? "A plate in the MyPahlavi archive.",
      noindex: !p || p.status !== "published",
    });
  },
  component: PlatePage,
});

function PlatePage() {
  const { id } = Route.useParams();
  const plate = archive.plate(id);

  if (!plate) {
    return (
      <LayoutShell>
        <main>
          <ArchiveSubnav active="/archive/plates" />
          <div className="mx-auto max-w-[90rem] px-6 py-24 sm:px-12">
            <EmptyState
              title="This plate is not in the archive."
              action={
                <Link to="/archive/plates" className="font-sans text-[0.6rem] uppercase tracking-[0.18em] underline underline-offset-8">
                  Browse plates
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

  const sources = plate.sourceIds.map((s) => archive.source(s)).filter(Boolean);
  const appearsIn = archive.collectionsContaining("plate", plate.id);
  const usedBy = archive.articles.filter((a) => a.plateIds.includes(plate.id));

  const rows: [string, React.ReactNode][] = [
    ["Date", <DateLabel key="d" date={plate.date} />],
    ...(plate.place ? ([["Place", plate.place]] as [string, string][]) : []),
    ["Credit", plate.credit.line],
    ...(plate.credit.creator ? ([["Made by", plate.credit.creator]] as [string, string][]) : []),
    ...(plate.credit.institution ? ([["Held by", plate.credit.institution]] as [string, string][]) : []),
    ...(plate.credit.accession ? ([["Accession", plate.credit.accession]] as [string, string][]) : []),
    ["Rights", RIGHTS_LABEL[plate.rights.status] ?? plate.rights.status],
    ...(plate.rights.holder ? ([["Rights holder", plate.rights.holder]] as [string, string][]) : []),
    ...(plate.rights.licence
      ? ([[
          "Licence",
          plate.rights.licenceUrl ? (
            <a key="l" href={plate.rights.licenceUrl} target="_blank" rel="noreferrer noopener" className="underline underline-offset-4">
              {plate.rights.licence}
            </a>
          ) : (
            plate.rights.licence
          ),
        ]] as [string, React.ReactNode][])
      : []),
    ["Source", plate.credit.sourceUrl ? (
      <a key="s" href={plate.credit.sourceUrl} target="_blank" rel="noreferrer noopener" className="underline underline-offset-4">
        View the source record
      </a>
    ) : "Not recorded"],
    ...(plate.rights.restrictions ? ([["Restrictions", plate.rights.restrictions]] as [string, string][]) : []),
  ];

  return (
    <LayoutShell>
      <main>
        <ArchiveSubnav active="/archive/plates" />
        {plate.status === "placeholder" ? <PlaceholderBanner /> : null}
        <div className="mx-auto grid max-w-[90rem] gap-12 px-6 py-14 sm:px-12 sm:py-20 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,.9fr)] lg:gap-20">
          <figure>
            <PlateFrame plate={plate} className="archive-fade" />
          </figure>
          <div className="lg:pt-4">
            <p className="flex items-center gap-4 font-sans text-[0.6rem] uppercase tracking-[0.28em] text-ink-subtle">
              Plate {plate.status === "placeholder" ? <PlaceholderMark /> : null}
            </p>
            <h1 className="mt-5 text-balance font-serif text-4xl leading-[1.05] tracking-[-0.03em] sm:text-5xl">{plate.title}</h1>
            {plate.caption ? <p className="mt-6 max-w-lg font-serif text-lg italic leading-relaxed text-ink-soft">{plate.caption}</p> : null}

            <dl className="mt-10 divide-y divide-border border-y border-border">
              {rows.map(([k, v]) => (
                <div key={k} className="grid grid-cols-[8rem_1fr] gap-4 py-3.5">
                  <dt className="font-sans text-[0.56rem] uppercase tracking-[0.18em] text-ink-subtle">{k}</dt>
                  <dd className="text-sm leading-6 text-ink-soft">{v}</dd>
                </div>
              ))}
            </dl>

            {plate.uncertainty ? (
              <p className="mt-8 border-l border-accent/50 pl-5 text-sm leading-7 text-ink-muted">
                <span className="mb-1 block font-sans text-[0.56rem] uppercase tracking-[0.2em] text-ink-subtle">What is uncertain</span>
                {plate.uncertainty}
              </p>
            ) : null}

            {sources.length > 0 && (
              <div className="mt-12">
                <SectionHeading>Sources</SectionHeading>
                <ul className="space-y-5">
                  {sources.map((s) => (
                    <li key={s!.id}>
                      <SourceLine source={s!} />
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {(appearsIn.length > 0 || usedBy.length > 0) && (
              <div className="mt-12">
                <SectionHeading>Appears in</SectionHeading>
                <ul className="space-y-3 font-serif text-xl">
                  {usedBy.map((a) => (
                    <li key={a.slug}>
                      <Link to="/archive/entries/$slug" params={{ slug: a.slug }} className="underline decoration-ink/20 underline-offset-4 hover:decoration-ink">
                        {a.title}
                      </Link>
                    </li>
                  ))}
                  {appearsIn.map((c) => (
                    <li key={c.slug}>
                      <Link to="/archive/collections/$slug" params={{ slug: c.slug }} className="underline decoration-ink/20 underline-offset-4 hover:decoration-ink">
                        {c.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </main>
    </LayoutShell>
  );
}
